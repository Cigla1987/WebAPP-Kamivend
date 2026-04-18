import * as fs from 'fs';
import * as path from 'path';
import { eq, sql } from 'drizzle-orm';
import {
  user,
  symbols,
  machineTypes,
  machineModes,
  machines,
  units,
  currencies,
  products,
  compartments,
} from '../db/schema'; // Adjust path to your schema
import { fileTypeFromBuffer } from 'file-type';
import logger from './logger.server';
import { db } from '../db';
import { serverEnv } from '#/config/env';
import { auth } from '../lib/auth';
import { createServerOnlyFn } from '@tanstack/react-start';

const env = serverEnv();

const seedDb = createServerOnlyFn(async (): Promise<boolean> => {
  logger.info('Checking if tables exist and seeding is needed...');

  try {
    // Check if tables exist by querying information_schema
    const tableCheckQuery = sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'products', 'compartments', 'machines', 'machine_types', 'machine_modes', 'units', 'currencies', 'symbols')
    `;

    const existingTables = await db.execute(tableCheckQuery);
    const tableNames = existingTables.rows.map((row: any) => row.table_name);

    const requiredTables = [
      'user',
      'products',
      'compartments',
      'machines',
      'machine_types',
      'machine_modes',
      'units',
      'currencies',
      'symbols',
    ];
    const missingTables = requiredTables.filter(
      (table) => !tableNames.includes(table)
    );

    if (missingTables.length > 0) {
      logger.error(`Missing required tables: ${missingTables.join(', ')}`);
      logger.error('Please run database migrations first');
      return false;
    }

    // Check if already seeded
    const existingUsers = await db.select().from(user).limit(1);
    if (existingUsers.length > 0) {
      logger.info('Database already seeded, skipping...');
      return true;
    }

    logger.info('All tables exist, proceeding with seeding...');
  } catch (error) {
    logger.error(error, 'Error checking database schema:');
    return false;
  }

  logger.info('Seeding database...');

  try {
    // const hashPassword = (pass: string) => bcrypt.hashSync(pass, 12);

    // Insert machine types
    const insertedMachineTypes = await db
      .insert(machineTypes)
      .values([
        { machineTypeName: 'lockbox' },
        { machineTypeName: 'smartfridge' },
      ])
      .returning({ id: machineTypes.id });

    const lockboxId = insertedMachineTypes[0].id;
    const smartfridgeId = insertedMachineTypes[1].id;

    // Insert machine modes
    const insertedMachineModes = await db
      .insert(machineModes)
      .values([{ machineModeName: 'single' }, { machineModeName: 'multi' }])
      .returning({ id: machineModes.id });

    const singleModeId = insertedMachineModes[0].id;
    const multiModeId = insertedMachineModes[1].id;

    // Insert units
    const insertedUnits = await db
      .insert(units)
      .values([
        { unitName: 'kilo', unitSymbol: 'kg' },
        { unitName: 'liter', unitSymbol: 'L' },
        { unitName: 'piece', unitSymbol: 'pcs' },
      ])
      .returning({ id: units.id });

    const kiloId = insertedUnits[0].id;
    const literId = insertedUnits[1].id;
    const pieceId = insertedUnits[2].id;

    // Insert currencies
    const insertedCurrencies = await db
      .insert(currencies)
      .values([
        { currencyName: 'Dollar', currencySymbol: '$' },
        { currencyName: 'Euro', currencySymbol: '€' },
        { currencyName: 'Pound', currencySymbol: '£' },
      ])
      .returning({ id: currencies.id });

    const dollarId = insertedCurrencies[0].id;
    const euroId = insertedCurrencies[1].id;
    // const poundId = insertedCurrencies[2].id;

    // Check and create superadmin using Better Auth
    const existingSuperAdmin = await db
      .select()
      .from(user)
      .where(eq(user.role, 'superadmin'))
      .limit(1);

    let user1Id: string;

    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;
    const adminName = env.ADMIN_NAME;

    if (!adminPassword) {
      logger.error(
        'Production: ADMIN_PASSWORD environment variable is required for production seeding'
      );
      logger.info('Please set ADMIN_PASSWORD in your .env file');
      return false;
    }

    if (existingSuperAdmin.length === 0) {
      const superAdminUser = await auth.api.signUpEmail({
        body: {
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        },
      });

      // Update role since Better Auth doesn't set custom roles on signup
      await db
        .update(user)
        .set({ role: 'superadmin' })
        .where(eq(user.id, superAdminUser.user.id));

      user1Id = superAdminUser.user.id;
      console.log('Superadmin created with id:', superAdminUser.user.id);
    } else {
      user1Id = existingSuperAdmin[0].id;
      console.log('Superadmin already exists');
    }

    const symbolsDir = path.join(process.cwd(), 'symbols_singles_pictures_png');
    const pngFiles = fs
      .readdirSync(symbolsDir)
      .filter((file) => file.endsWith('.png'));

    const symbolsData = await Promise.all(
      pngFiles.map(async (file) => {
        const filePath = path.join(symbolsDir, file);
        const dataUrl = await convertFileToDataUrl(filePath);
        const symbolName = file.replace('_symbol.png', '').replace('_', ' ');

        return {
          symbolName,
          symbolPicture: dataUrl,
          ownerId: null,
        };
      })
    );

    await db.insert(symbols).values(symbolsData);

    // Insert machines
    const insertedMachines = await db
      .insert(machines)
      .values([
        {
          machineName: 'Lockbox 3000',
          serialNumber: '240001',
          productionYear: 2022,
          compartmentCount: 6,
          latitude: '40.7128',
          longitude: '-74.0060',
          machineModeId: singleModeId,
          machineTypeId: lockboxId,
          ownerId: user1Id,
        },
        {
          machineName: 'SmartFridge Pro',
          serialNumber: '240002',
          productionYear: 2023,
          compartmentCount: 10,
          latitude: '37.7749',
          longitude: '-122.4194',
          machineModeId: multiModeId,
          machineTypeId: smartfridgeId,
          ownerId: user1Id,
        },
      ])
      .returning({ id: machines.id });

    const lockboxMachineId = insertedMachines[0].id;
    const smartfridgeMachineId = insertedMachines[1].id;

    // Insert products
    const insertedProducts = await db
      .insert(products)
      .values([
        {
          productName: 'Coca Cola',
          defaultPrice: '2.50',
          defaultCurrencyId: dollarId,
          defaultQuantity: '0.5',
          defaultUnitId: literId,
          ownerId: user1Id,
          productSymbolId: null,
          discountValue: null,
          discountDay: null,
        },
        {
          productName: 'Snickers Bar',
          defaultPrice: '1.75',
          defaultCurrencyId: dollarId,
          defaultQuantity: '50',
          defaultUnitId: kiloId,
          ownerId: user1Id,
          productSymbolId: null,
          discountValue: 10,
          discountDay: 1,
        },
        {
          productName: 'Water Bottle',
          defaultPrice: '1.00',
          defaultCurrencyId: dollarId,
          defaultQuantity: '1.0',
          defaultUnitId: literId,
          ownerId: user1Id,
          productSymbolId: null,
          discountValue: null,
          discountDay: null,
        },
        {
          productName: 'Potato Chips',
          defaultPrice: '2.00',
          defaultCurrencyId: dollarId,
          defaultQuantity: '150',
          defaultUnitId: kiloId,
          ownerId: user1Id,
          productSymbolId: null,
          discountValue: 15,
          discountDay: 5,
        },
        {
          productName: 'Energy Drink',
          defaultPrice: '3.00',
          defaultCurrencyId: dollarId,
          defaultQuantity: '0.25',
          defaultUnitId: literId,
          ownerId: user1Id,
          productSymbolId: null,
          discountValue: null,
          discountDay: null,
        },
        {
          productName: 'Chocolate Cookie',
          defaultPrice: '1.25',
          defaultCurrencyId: euroId,
          defaultQuantity: '1',
          defaultUnitId: pieceId,
          ownerId: user1Id,
          productSymbolId: null,
          discountValue: 20,
          discountDay: 3,
        },
      ])
      .returning({ id: products.id });

    // Insert compartments for Lockbox 3000 (6 compartments)
    await db.insert(compartments).values([
      {
        machineId: lockboxMachineId,
        compartmentNumber: 1,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: insertedProducts[0].id, // Coca Cola
        productName: 'Coca Cola',
        currentPrice: '2.50',
        currencySymbol: '$',
        currentQuantity: '12',
        unitName: 'pcs',
        discountValue: null,
        discountDay: null,
        expirationDate: '2025-12-31',
      },
      {
        machineId: lockboxMachineId,
        compartmentNumber: 2,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: insertedProducts[1].id, // Snickers Bar
        productName: 'Snickers Bar',
        currentPrice: '1.75',
        currencySymbol: '$',
        currentQuantity: '8',
        unitName: 'pcs',
        discountValue: 10,
        discountDay: 1,
        expirationDate: '2025-06-30',
      },
      {
        machineId: lockboxMachineId,
        compartmentNumber: 3,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: insertedProducts[4].id, // Energy Drink
        productName: 'Energy Drink',
        currentPrice: '3.00',
        currencySymbol: '$',
        currentQuantity: '6',
        unitName: 'pcs',
        discountValue: null,
        discountDay: null,
        expirationDate: '2025-09-15',
      },
      {
        machineId: lockboxMachineId,
        compartmentNumber: 4,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: null, // Empty compartment
        productName: null,
        currentPrice: null,
        currencySymbol: null,
        currentQuantity: null,
        unitName: null,
        discountValue: null,
        discountDay: null,
        expirationDate: null,
      },
      {
        machineId: lockboxMachineId,
        compartmentNumber: 5,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: null, // Empty compartment
        productName: null,
        currentPrice: null,
        currencySymbol: null,
        currentQuantity: null,
        unitName: null,
        discountValue: null,
        discountDay: null,
        expirationDate: null,
      },
      {
        machineId: lockboxMachineId,
        compartmentNumber: 6,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: null, // Empty compartment
        productName: null,
        currentPrice: null,
        currencySymbol: null,
        currentQuantity: null,
        unitName: null,
        discountValue: null,
        discountDay: null,
        expirationDate: null,
      },
    ]);

    // Insert compartments for SmartFridge Pro (10 compartments)
    await db.insert(compartments).values([
      {
        machineId: smartfridgeMachineId,
        compartmentNumber: 1,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: insertedProducts[2].id, // Water Bottle
        productName: 'Water Bottle',
        currentPrice: '1.00',
        currencySymbol: '$',
        currentQuantity: '15',
        unitName: 'pcs',
        discountValue: null,
        discountDay: null,
        expirationDate: '2026-01-31',
      },
      {
        machineId: smartfridgeMachineId,
        compartmentNumber: 2,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: insertedProducts[3].id, // Potato Chips
        productName: 'Potato Chips',
        currentPrice: '2.00',
        currencySymbol: '$',
        currentQuantity: '10',
        unitName: 'pcs',
        discountValue: 15,
        discountDay: 5,
        expirationDate: '2025-08-20',
      },
      {
        machineId: smartfridgeMachineId,
        compartmentNumber: 3,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: insertedProducts[5].id, // Chocolate Cookie
        productName: 'Chocolate Cookie',
        currentPrice: '1.25',
        currencySymbol: '€',
        currentQuantity: '20',
        unitName: 'pcs',
        discountValue: 20,
        discountDay: 3,
        expirationDate: '2025-07-10',
      },
      {
        machineId: smartfridgeMachineId,
        compartmentNumber: 4,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: insertedProducts[0].id, // Coca Cola
        productName: 'Coca Cola',
        currentPrice: '2.50',
        currencySymbol: '$',
        currentQuantity: '18',
        unitName: 'pcs',
        discountValue: null,
        discountDay: null,
        expirationDate: '2025-12-31',
      },
      // Compartments 5-10 empty
      ...Array.from({ length: 6 }, (_, i) => ({
        machineId: smartfridgeMachineId,
        compartmentNumber: i + 5,
        width: 200,
        height: 400,
        managedBy: user1Id,
        productId: null,
        productName: null,
        currentPrice: null,
        currencySymbol: null,
        currentQuantity: null,
        unitName: null,
        discountValue: null,
        discountDay: null,
        expirationDate: null,
      })),
    ]);

    // Add other seeds as needed...

    logger.info('Database seeded successfully!');
    return true;
  } catch (error) {
    logger.error(error, 'Error seeding database:');
    return false;
  }
});

export default seedDb;

const seedProdDb = createServerOnlyFn(async (): Promise<boolean> => {
  logger.info('Production seeding: Checking essential data...');

  try {
    // Check if tables exist by querying information_schema
    const tableCheckQuery = sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'machine_types', 'machine_modes', 'units', 'currencies', 'symbols')
    `;

    const existingTables = await db.execute(tableCheckQuery);
    const tableNames = existingTables.rows.map((row: any) => row.table_name);

    const requiredTables = [
      'user',
      'machine_types',
      'machine_modes',
      'units',
      'currencies',
      'symbols',
    ];
    const missingTables = requiredTables.filter(
      (table) => !tableNames.includes(table)
    );

    if (missingTables.length > 0) {
      logger.error(`Missing required tables: ${missingTables.join(', ')}`);
      logger.error('Please run database migrations first');
      return false;
    }

    logger.info(
      'All required tables exist, proceeding with production seeding...'
    );
  } catch (error) {
    logger.error(error, 'Error checking database schema:');
    return false;
  }

  try {
    // Check and seed machine types
    const existingMachineTypes = await db.select().from(machineTypes);

    if (existingMachineTypes.length === 0) {
      logger.info('Production: Seeding machine types...');
      await db
        .insert(machineTypes)
        .values([
          { machineTypeName: 'lockbox' },
          { machineTypeName: 'smartfridge' },
        ]);
    } else {
      logger.info('Production: Machine types already exist');
    }

    // Check and seed machine modes
    const existingMachineModes = await db.select().from(machineModes);

    if (existingMachineModes.length === 0) {
      logger.info('Production: Seeding machine modes...');
      await db
        .insert(machineModes)
        .values([{ machineModeName: 'single' }, { machineModeName: 'multi' }]);
    } else {
      logger.info('Production: Machine modes already exist');
    }

    // Check and seed units
    const existingUnits = await db.select().from(units);

    if (existingUnits.length === 0) {
      logger.info('Production: Seeding units...');
      await db.insert(units).values([
        { unitName: 'kilo', unitSymbol: 'kg' },
        { unitName: 'liter', unitSymbol: 'L' },
        { unitName: 'piece', unitSymbol: 'pcs' },
      ]);
    } else {
      logger.info('Production: Units already exist');
    }

    // Check and seed currencies
    const existingCurrencies = await db.select().from(currencies);

    if (existingCurrencies.length === 0) {
      logger.info('Production: Seeding currencies...');
      await db.insert(currencies).values([
        { currencyName: 'Dollar', currencySymbol: '$' },
        { currencyName: 'Euro', currencySymbol: '€' },
        { currencyName: 'Pound', currencySymbol: '£' },
      ]);
    } else {
      logger.info('Production: Currencies already exist');
    }

    // Check and seed superadmin user
    const existingAdminUsers = await db
      .select()
      .from(user)
      .where(eq(user.role, 'superadmin'));

    if (existingAdminUsers.length === 0) {
      logger.info('Production: Seeding superadmin user...');

      // Get admin credentials from environment variables
      const adminEmail = env.ADMIN_EMAIL;
      const adminPassword = env.ADMIN_PASSWORD;
      const adminName = env.ADMIN_NAME;

      if (!adminPassword) {
        logger.error(
          'Production: ADMIN_PASSWORD environment variable is required for production seeding'
        );
        logger.info('Please set ADMIN_PASSWORD in your .env file');
        return false;
      }

      try {
        // Use Better Auth to create the superadmin
        const superAdminUser = await auth.api.signUpEmail({
          body: {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
          },
        });

        // Update role to superadmin
        await db
          .update(user)
          .set({ role: 'superadmin' })
          .where(eq(user.id, superAdminUser.user.id));

        const adminId = superAdminUser.user.id;

        logger.info(
          `Production: Superadmin created successfully with email: ${adminEmail}`
        );

        // Check and seed symbols with admin as owner
        const existingSymbols = await db.select().from(symbols);

        if (existingSymbols.length === 0) {
          logger.info('Production: Seeding symbols...');
          const symbolsDir = path.join(
            process.cwd(),
            '..',
            'symbols_singles_pictures_png'
          );

          if (fs.existsSync(symbolsDir)) {
            const pngFiles = fs
              .readdirSync(symbolsDir)
              .filter((file) => file.endsWith('.png'));

            const symbolsData = pngFiles.map((file, index) => {
              const filePath = path.join(symbolsDir, file);
              const imageBuffer = fs.readFileSync(filePath);
              const base64Image = `${imageBuffer.toString('base64')}`;
              const symbolName = file
                .replace('_symbol.png', '')
                .replace('_', ' ');

              return {
                symbolName,
                symbolPicture: base64Image,
                symbolCode: String(index + 1).padStart(3, '0'),
                ownerId: adminId,
              };
            });

            await db.insert(symbols).values(symbolsData);
          } else {
            logger.warn(
              'Production: Symbols directory not found, skipping symbol seeding...'
            );
          }
        } else {
          logger.info('Production: Symbols already exist');
        }
      } catch (error) {
        logger.error(error, 'Error creating superadmin user:');
        return false;
      }
    } else {
      logger.info('Production: Admin user already exists');

      // Still check symbols even if admin exists
      const existingSymbols = await db.select().from(symbols);

      if (existingSymbols.length === 0) {
        logger.info('Production: Seeding symbols with existing admin...');
        const adminId = existingAdminUsers[0].id;

        const symbolsDir = path.join(
          process.cwd(),
          '..',
          'symbols_singles_pictures_png'
        );

        if (fs.existsSync(symbolsDir)) {
          const pngFiles = fs
            .readdirSync(symbolsDir)
            .filter((file) => file.endsWith('.png'));

          const symbolsData = await Promise.all(
            pngFiles.map(async (file, index) => {
              const filePath = path.join(symbolsDir, file);
              const dataUrl = await convertFileToDataUrl(filePath);
              const symbolName = file
                .replace('_symbol.png', '')
                .replace('_', ' ');
              return {
                symbolName,
                symbolPicture: dataUrl,
                symbolCode: String(index + 1).padStart(3, '0'),
                ownerId: adminId,
              };
            })
          );

          await db.insert(symbols).values(symbolsData);
        } else {
          logger.warn(
            'Production: Symbols directory not found, skipping symbol seeding...'
          );
        }
      } else {
        logger.info('Production: Symbols already exist');
      }
    }

    logger.info('Production database seeding completed successfully!');
    return true;
  } catch (error) {
    logger.error(error, 'Error seeding production database:');
    return false;
  }
});

export { seedProdDb };

/**
 * Convert an image file buffer to a data URL with detected MIME type
 * @param filePath - Path to the image file
 * @returns Promise<string> - Data URL in format "data:mime/type;base64,data"
 */
async function convertFileToDataUrl(filePath: string): Promise<string> {
  const imageBuffer = fs.readFileSync(filePath);
  const fileType = await fileTypeFromBuffer(imageBuffer);
  const mimeType = fileType?.mime || 'image/png'; // fallback to png
  return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
}
