/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import {
  compartments,
  machines,
  machineModes,
  products,
  pictures,
} from '@/server/db/schema';
import { user } from '@/server/db/schema/auth';
import { eq, and, asc } from 'drizzle-orm';

/**
 * Compartment type with joined relations
 * Matches the actual query result from fetchCompartmentsByMachine()
 */
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

/**
 * Get all compartments for a machine with joined data
 * @returns Array of compartments with relations
 */
export async function fetchCompartmentsByMachine(
  machineId: string,
  userId: string,
  role: string
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

  if (role === 'superadmin') {
    results = await baseQuery
      .where(eq(compartments.machineId, machineId))
      .orderBy(asc(compartments.compartmentNumber));
  } else if (role === 'owner') {
    results = await baseQuery
      .where(
        and(eq(compartments.machineId, machineId), eq(machines.ownerId, userId))
      )
      .orderBy(asc(compartments.compartmentNumber));
  } else if (role === 'employee') {
    results = await baseQuery
      .where(
        and(
          eq(compartments.machineId, machineId),
          eq(compartments.managedBy, userId)
        )
      )
      .orderBy(asc(compartments.compartmentNumber));
  } else {
    throw new Error('Unauthorized');
  }

  return results.map((row) => ({
    ...row,
    currentQuantity: row.currentQuantity
      ? parseFloat(row.currentQuantity.toString())
      : 0,
    expirationDate: row.expirationDate ? new Date(row.expirationDate) : null,
  })) as CompartmentDto[];
}

/**
 * Update compartment price
 */
export async function updateCompartmentPrice(
  id: string,
  newPrice: number,
  updateAll: boolean,
  userId: string
): Promise<void> {
  const now = new Date();

  if (updateAll) {
    // Get product ID first
    const [productRow] = await db
      .select({ productId: compartments.productId })
      .from(compartments)
      .where(eq(compartments.id, id));

    if (!productRow?.productId) {
      throw new Error('This compartment is empty');
    }

    // Update all compartments with same product and managed by user
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
    // Update single compartment
    await db
      .update(compartments)
      .set({
        currentPrice: newPrice.toString(),
        lastUpdated: now,
      })
      .where(and(eq(compartments.id, id), eq(compartments.managedBy, userId)));
  }
}

/**
 * Update compartment managed by
 */
export async function updateCompartmentManagedBy(
  id: string,
  managedBy: string | null
): Promise<void> {
  await db
    .update(compartments)
    .set({ managedBy })
    .where(eq(compartments.id, id));
}

/**
 * Update compartment discount
 */
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
