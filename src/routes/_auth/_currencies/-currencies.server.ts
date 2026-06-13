/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { currencies } from '@/server/db/schema';

export type CurrencyDto = {
  id: string;
  currencyName: string;
  currencySymbol: string;
};

export async function getCurrencies(): Promise<CurrencyDto[]> {
  const results = await db.select().from(currencies);
  return results;
}
