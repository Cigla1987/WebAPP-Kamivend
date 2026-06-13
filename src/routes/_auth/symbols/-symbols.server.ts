/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { UserRole } from '#/shared/enums';
import { symbols } from '@/server/db/schema';
import { user } from '@/server/db/schema/auth';
import { eq, isNull, or } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';
import z from 'zod';

export type SymbolDto = {
  id: string;
  symbolName: string;
  symbolPicture: string;
  ownerId: string | null;
};

export const createSymbolApiSchema = z.object({
  symbolName: z
    .string()
    .min(1, 'Symbol name is required')
    .max(50, 'Symbol name must be 50 characters or less'),
  symbolPicture: z.string().min(1, 'Symbol picture is required'),
});

type CreateSymbol = z.infer<typeof createSymbolApiSchema>;

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

  if (role === UserRole.Superadmin) {
    results = await baseQuery;
  } else if (role === UserRole.Owner) {
    results = await baseQuery.where(
      or(eq(symbols.ownerId, userId), isNull(symbols.ownerId))
    );
  } else if (role === UserRole.Employee) {
    const [employee] = await db
      .select({ ownerId: user.ownerId })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const ownerId = employee?.ownerId;

    if (ownerId) {
      results = await baseQuery.where(
        or(eq(symbols.ownerId, ownerId), isNull(symbols.ownerId))
      );
    } else {
      results = await baseQuery.where(isNull(symbols.ownerId));
    }
  } else {
    throw new Error('Unauthorized');
  }

  return results;
}

export async function createSymbol(
  data: CreateSymbol,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<{ id: string }> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const [createdSymbol] = await db
    .insert(symbols)
    .values({
      symbolName: data.symbolName,
      symbolPicture: data.symbolPicture,
      ownerId: role === UserRole.Superadmin ? null : userId,
    })
    .returning();

  return { id: createdSymbol.id };
}
