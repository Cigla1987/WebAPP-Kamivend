/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '@/server/db';
import { UserRole } from '#/shared/enums';
import {
  compartments,
  machines,
  machineModes,
  products,
  pictures,
} from '@/server/db/schema';
import { user, organization } from '@/server/db/schema/auth';
import { eq, and, asc } from 'drizzle-orm';

export type CompartmentDto = {
  id: string;
  machineId: string;
  machineName: string;
  compartmentNumber: number;
  managedBy: string | null;
  managedByUsername: string | null;
  productId: string | null;
  productName: string;
  currentPrice: string;
  currencySymbol: string;
  currentQuantity: number;
  unitName: string;
  expirationDate: Date | null;
  discountValue: number | null;
  discountDay: number | null;
  pictureContent: string | null;
  machineModeName: string;
  lastUpdated: Date | null;
};

export async function fetchCompartmentsByMachine(
  machineId: string,
  _userId: string,
  role: string,
  activeOrg: typeof organization.$inferSelect | null
): Promise<CompartmentDto[]> {
  const baseQuery = db
    .select({
      id: compartments.id,
      machineId: compartments.machineId,
      machineName: machines.machineName,
      compartmentNumber: compartments.compartmentNumber,
      managedBy: compartments.managedBy,
      managedByUsername: user.name,
      productId: compartments.productId,
      productName: compartments.productName,
      currentPrice: compartments.currentPrice,
      currencySymbol: compartments.currencySymbol,
      currentQuantity: compartments.currentQuantity,
      unitName: compartments.unitName,
      expirationDate: compartments.expirationDate,
      discountValue: compartments.discountValue,
      discountDay: compartments.discountDay,
      pictureContent: pictures.pictureContent,
      machineModeName: machineModes.machineModeName,
      lastUpdated: compartments.lastUpdated,
    })
    .from(compartments)
    .leftJoin(user, eq(user.id, compartments.managedBy))
    .leftJoin(products, eq(compartments.productId, products.id))
    .leftJoin(pictures, eq(products.productPictureId, pictures.id))
    .leftJoin(machines, eq(compartments.machineId, machines.id))
    .leftJoin(machineModes, eq(machines.machineModeId, machineModes.id));

  let results;

  if (role === UserRole.Admin) {
    results = await baseQuery
      .where(eq(compartments.machineId, machineId))
      .orderBy(asc(compartments.compartmentNumber));
  } else {
    if (!activeOrg) {
      return [];
    }
    results = await baseQuery
      .where(
        and(
          eq(compartments.machineId, machineId),
          eq(compartments.organizationId, activeOrg.id)
        )
      )
      .orderBy(asc(compartments.compartmentNumber));
  }

  return results.map((row) => ({
    ...row,
    currentQuantity: row.currentQuantity
      ? parseFloat(row.currentQuantity.toString())
      : 0,
    expirationDate: row.expirationDate ? new Date(row.expirationDate) : null,
  })) as CompartmentDto[];
}

export async function updateCompartmentPrice(
  id: string,
  newPrice: number,
  updateAll: boolean,
  userId: string
): Promise<void> {
  const now = new Date();

  if (updateAll) {
    const [productRow] = await db
      .select({ productId: compartments.productId })
      .from(compartments)
      .where(eq(compartments.id, id));

    if (!productRow?.productId) {
      throw new Error('This compartment is empty');
    }

    await db
      .update(compartments)
      .set({
        currentPrice: newPrice.toString(),
        lastUpdated: now,
      })
      .where(
        and(
          eq(compartments.productId, productRow.productId),
          eq(compartments.managedBy, userId)
        )
      );
  } else {
    await db
      .update(compartments)
      .set({
        currentPrice: newPrice.toString(),
        lastUpdated: now,
      })
      .where(and(eq(compartments.id, id), eq(compartments.managedBy, userId)));
  }
}

export async function updateCompartmentManagedBy(
  id: string,
  managedBy: string | null
): Promise<void> {
  await db
    .update(compartments)
    .set({ managedBy })
    .where(eq(compartments.id, id));
}

export async function updateCompartmentDiscount(
  id: string,
  discountValue: number,
  discountDay: number,
  expirationDate: string
): Promise<void> {
  const now = new Date();

  await db
    .update(compartments)
    .set({
      discountValue,
      discountDay,
      expirationDate,
      lastUpdated: now,
    })
    .where(eq(compartments.id, id));
}
