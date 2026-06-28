/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '@/server/db';
import { UserRole, MemberRole } from '#/shared/enums';
import { symbols } from '@/server/db/schema';
import { organization, member } from '@/server/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';
import z from 'zod';

export type SymbolDto = {
  id: string;
  symbolName: string;
  symbolPicture: string;
  organizationId: string | null;
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
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<SymbolDto[]> {
  const baseQuery = db
    .select({
      id: symbols.id,
      symbolName: symbols.symbolName,
      symbolPicture: symbols.symbolPicture,
      organizationId: symbols.organizationId,
    })
    .from(symbols);

  let results: SymbolDto[];

  if (currentUser.role === UserRole.Admin) {
    results = await baseQuery;
  } else {
    if (!activeOrg) {
      return [];
    }
    results = await baseQuery.where(
      eq(symbols.organizationId, activeOrg.id)
    );
  }

  return results;
}

export async function createSymbol(
  data: CreateSymbol,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<{ id: string }> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  if (currentUser.role !== UserRole.Admin) {
    const [mem] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, activeOrg.id),
          eq(member.userId, currentUser.id)
        )
      )
      .limit(1);
    if (!mem || mem.role !== MemberRole.Owner) {
      throw new Error('Unauthorized');
    }
  }

  const [createdSymbol] = await db
    .insert(symbols)
    .values({
      symbolName: data.symbolName,
      symbolPicture: data.symbolPicture,
      organizationId: activeOrg.id,
      createdBy: currentUser.id,
    })
    .returning();

  return { id: createdSymbol.id };
}
