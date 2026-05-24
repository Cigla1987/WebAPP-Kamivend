/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { symbols } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';

export type SymbolDto = {
  id: number;
  symbolName: string | null;
  symbolPicture: string | null;
  ownerId: string | null;
};

export async function getSymbols(
  currentUser: Pick<User, 'id' | 'role'>
): Promise<SymbolDto[]> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const baseQuery = db
    .select({
      id: symbols.id,
      symbolName: symbols.symbolName,
      symbolPicture: symbols.symbolPicture,
      ownerId: symbols.ownerId,
    })
    .from(symbols);

  let results: SymbolDto[];

  if (role === 'superadmin') {
    results = await baseQuery;
  } else {
    results = await baseQuery.where(eq(symbols.ownerId, userId));
  }

  return results;
}
