import * as fs from 'fs';
import * as path from 'path';
import { eq, sql } from 'drizzle-orm';
import {
  user,
  machineTypes,
  machineModes,
  machines,
  units,
  currencies,
  products,
  compartments,
  member,
} from '../db/schema';
import { fileTypeFromBuffer } from 'file-type';
import logger from './logger.server';
import { db } from '../db';
import { serverEnv } from '#/config/env';
import { UserRole } from '#/shared/enums';
import { auth } from '../lib/auth';
import { createServerOnlyFn } from '@tanstack/react-start';
import { MachineType, MachineMode } from '#/shared/enums';

const env = serverEnv();

const resetDatabase = createServerOnlyFn(async (): Promise<boolean> => {
  logger.info('Resetting database tables...');

  try {
    await db.execute(sql`
      TRUNCATE TABLE 
        smartfridges,
        compartments,
        products,
        pictures,
        machines,
        currencies,
        units,
        machine_modes,
        machine_types,
        member,
        invitation,
        organization,
        "user",
        session,
        account,
        verification
        CASCADE
    `);
    logger.info('Database tables truncated and sequences reset');
    return true;
  } catch (error) {
    logger.error(error, 'Error resetting database:');
    return false;
  }
});

const seedDb = createServerOnlyFn(async (): Promise<boolean> => {
  logger.info('Checking if tables exist and seeding is needed...');

  try {
    const tableCheckQuery = sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'products', 'compartments', 'machines', 'machine_types', 'machine_modes', 'units', 'currencies')
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
    ];
    const missingTables = requiredTables.filter(
      (table) => !tableNames.includes(table)
    );

    if (missingTables.length > 0) {
      logger.error(`Missing required tables: ${missingTables.join(', ')}`);
      logger.error('Please run database migrations first');
      return false;
    }

    const existingMachineTypes = await db.select().from(machineTypes).limit(1);
    if (existingMachineTypes.length > 0) {
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
    const insertedMachineTypes = await db
      .insert(machineTypes)
      .values([
        { machineTypeName: MachineType.Lockbox },
        { machineTypeName: MachineType.Smartfridge },
      ])
      .returning({ id: machineTypes.id });

    const lockboxId = insertedMachineTypes[0].id;
    const smartfridgeId = insertedMachineTypes[1].id;

    const insertedMachineModes = await db
      .insert(machineModes)
      .values([{ machineModeName: MachineMode.Single }, { machineModeName: MachineMode.Multi }])
      .returning({ id: machineModes.id });

    const singleModeId = insertedMachineModes[0].id;
    const multiModeId = insertedMachineModes[1].id;

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

    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.role, UserRole.Admin))
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

    if (existingAdmin.length === 0) {
      const adminUser = await auth.api.createUser({
        body: {
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: UserRole.Admin,
        },
      });

      user1Id = adminUser.user.id;
      console.log('Admin created with id:', adminUser.user.id);
    } else {
      user1Id = existingAdmin[0].id;
      console.log('Admin already exists');
    }

    // Create organization for admin
    const adminOrg = await auth.api.createOrganization({
      body: {
        name: 'Admin Organization',
        slug: 'admin-organization',
        userId: user1Id,
      },
    });

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
          organizationId: adminOrg.id,
          createdBy: user1Id,
        },
        {
          machineName: 'SmartFridge Pro',
          serialNumber: '240002',
          productionYear: 2023,
          compartmentCount: 0,
          latitude: '37.7749',
          longitude: '-122.4194',
          machineModeId: multiModeId,
          machineTypeId: smartfridgeId,
          organizationId: adminOrg.id,
          createdBy: user1Id,
        },
      ])
      .returning({ id: machines.id });

    const lockboxMachineId = insertedMachines[0].id;

    const insertedProducts = await db
      .insert(products)
      .values([
        {
          productName: 'Coca Cola',
          defaultPrice: '2.50',
          defaultCurrencyId: dollarId,
          defaultQuantity: '0.5',
          defaultUnitId: literId,
          organizationId: adminOrg.id,
          createdBy: user1Id,
          discountValue: null,
          discountDay: null,
        },
        {
          productName: 'Snickers Bar',
          defaultPrice: '1.75',
          defaultCurrencyId: dollarId,
          defaultQuantity: '50',
          defaultUnitId: kiloId,
          organizationId: adminOrg.id,
          createdBy: user1Id,
          discountValue: 10,
          discountDay: 1,
        },
        {
          productName: 'Water Bottle',
          defaultPrice: '1.00',
          defaultCurrencyId: dollarId,
          defaultQuantity: '1.0',
          defaultUnitId: literId,
          organizationId: adminOrg.id,
          createdBy: user1Id,
          discountValue: null,
          discountDay: null,
        },
        {
          productName: 'Potato Chips',
          defaultPrice: '2.00',
          defaultCurrencyId: dollarId,
          defaultQuantity: '150',
          defaultUnitId: kiloId,
          organizationId: adminOrg.id,
          createdBy: user1Id,
          discountValue: 15,
          discountDay: 5,
        },
        {
          productName: 'Energy Drink',
          defaultPrice: '3.00',
          defaultCurrencyId: dollarId,
          defaultQuantity: '0.25',
          defaultUnitId: literId,
          organizationId: adminOrg.id,
          createdBy: user1Id,
          discountValue: null,
          discountDay: null,
        },
        {
          productName: 'Chocolate Cookie',
          defaultPrice: '1.25',
          defaultCurrencyId: euroId,
          defaultQuantity: '1',
          defaultUnitId: pieceId,
          organizationId: adminOrg.id,
          createdBy: user1Id,
          discountValue: 20,
          discountDay: 3,
        },
      ])
      .returning({ id: products.id });

    await db.insert(compartments).values(
      [
        {
          machineId: lockboxMachineId,
          compartmentNumber: 1,
          width: 200,
          height: 400,
          managedBy: user1Id,
          productId: insertedProducts[0].id,
          productName: 'Coca Cola',
          currentPrice: '2.50',
          currencySymbol: '$',
          currentQuantity: '12',
          unitName: 'pcs',
          discountValue: null,
          discountDay: null,
          expirationDate: '2025-12-31',
          createdBy: user1Id,
        },
        {
          machineId: lockboxMachineId,
          compartmentNumber: 2,
          width: 200,
          height: 400,
          managedBy: user1Id,
          productId: insertedProducts[1].id,
          productName: 'Snickers Bar',
          currentPrice: '1.75',
          currencySymbol: '$',
          currentQuantity: '8',
          unitName: 'pcs',
          discountValue: 10,
          discountDay: 1,
          expirationDate: '2025-06-30',
          createdBy: user1Id,
        },
        {
          machineId: lockboxMachineId,
          compartmentNumber: 3,
          width: 200,
          height: 400,
          managedBy: user1Id,
          productId: insertedProducts[4].id,
          productName: 'Energy Drink',
          currentPrice: '3.00',
          currencySymbol: '$',
          currentQuantity: '6',
          unitName: 'pcs',
          discountValue: null,
          discountDay: null,
          expirationDate: '2025-09-15',
          createdBy: user1Id,
        },
        {
          machineId: lockboxMachineId,
          compartmentNumber: 4,
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
          createdBy: user1Id,
        },
        {
          machineId: lockboxMachineId,
          compartmentNumber: 5,
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
          createdBy: user1Id,
        },
        {
          machineId: lockboxMachineId,
          compartmentNumber: 6,
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
          createdBy: user1Id,
        },
      ] as any[]
    );

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
    const tableCheckQuery = sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'machine_types', 'machine_modes', 'units', 'currencies')
    `;

    const existingTables = await db.execute(tableCheckQuery);
    const tableNames = existingTables.rows.map((row: any) => row.table_name);

    const requiredTables = [
      'user',
      'machine_types',
      'machine_modes',
      'units',
      'currencies',
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
    const existingMachineTypes = await db.select().from(machineTypes);

    if (existingMachineTypes.length === 0) {
      logger.info('Production: Seeding machine types...');
      await db
        .insert(machineTypes)
        .values([
          { machineTypeName: MachineType.Lockbox },
          { machineTypeName: MachineType.Smartfridge },
        ]);
    } else {
      logger.info('Production: Machine types already exist');
    }

    const existingMachineModes = await db.select().from(machineModes);

    if (existingMachineModes.length === 0) {
      logger.info('Production: Seeding machine modes...');
      await db
        .insert(machineModes)
        .values([{ machineModeName: MachineMode.Single }, { machineModeName: MachineMode.Multi }]);
    } else {
      logger.info('Production: Machine modes already exist');
    }

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

    const existingAdminUsers = await db
      .select()
      .from(user)
      .where(eq(user.role, UserRole.Admin));

    if (existingAdminUsers.length === 0) {
      logger.info('Production: Seeding admin user...');

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
        const adminUser = await auth.api.createUser({
          body: {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: UserRole.Admin,
          },
        });

        logger.info(
          `Production: Admin created successfully with email: ${adminEmail}`
        );

        // Create organization for admin
        await auth.api.createOrganization({
          body: {
            name: 'Admin Organization',
            slug: 'admin-organization',
            userId: adminUser.user.id,
          },
        });

      } catch (error) {
        logger.error(error, 'Error creating admin user:');
        return false;
      }
    } else {
      logger.info('Production: Admin user already exists');

      // Check if admin has an organization, if not create one
      const [adminMember] = await db
        .select()
        .from(member)
        .where(eq(member.userId, existingAdminUsers[0].id))
        .limit(1);

      if (!adminMember) {
        logger.info('Production: Creating organization for existing admin...');
        await auth.api.createOrganization({
          body: {
            name: 'Admin Organization',
            slug: 'admin-organization',
            userId: existingAdminUsers[0].id,
          },
        });
      }
    }

    logger.info('Production database seeding completed successfully!');
    return true;
  } catch (error) {
    logger.error(error, 'Error seeding production database:');
    return false;
  }
});

/**
 * Convert an image file buffer to a data URL with detected MIME type
 */
async function convertFileToDataUrl(filePath: string): Promise<string> {
  const imageBuffer = fs.readFileSync(filePath);
  const fileType = await fileTypeFromBuffer(imageBuffer);
  const mimeType = fileType?.mime || 'image/png';
  return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
}

export { seedProdDb, resetDatabase };
