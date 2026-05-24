/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { units } from '@/server/db/schema';

export type UnitDto = {
  id: number;
  unitName: string;
  unitSymbol: string;
};

export async function getUnits(): Promise<UnitDto[]> {
  const results = await db.select().from(units);
  return results;
}
