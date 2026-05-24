/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import {
  products,
  pictures,
  symbols,
  currencies,
  units,
} from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';

export type ProductDto = {
  id: number;
  productName: string;
  defaultPrice: string;
  currencySymbol: string | null;
  defaultQuantity: string;
  unitSymbol: string | null;
  productDateCreated: Date | null;
  discountValue: number | null;
  discountDay: number | null;
  productPicture: string | null;
  productSymbolPicture: string | null;
};

export async function getProducts(
  currentUser: Pick<User, 'id' | 'role'>
): Promise<ProductDto[]> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const baseQuery = db
    .select({
      id: products.id,
      productName: products.productName,
      defaultPrice: products.defaultPrice,
      currencySymbol: currencies.currencySymbol,
      defaultQuantity: products.defaultQuantity,
      unitSymbol: units.unitSymbol,
      productDateCreated: products.productDateCreated,
      discountValue: products.discountValue,
      discountDay: products.discountDay,
      productPicture: pictures.pictureContent,
      productSymbolPicture: symbols.symbolPicture,
    })
    .from(products)
    .leftJoin(currencies, eq(currencies.id, products.defaultCurrencyId))
    .leftJoin(units, eq(units.id, products.defaultUnitId))
    .leftJoin(pictures, eq(pictures.id, products.productPictureId))
    .leftJoin(symbols, eq(symbols.id, products.productSymbolId));

  let results: ProductDto[];

  if (role === 'superadmin') {
    results = await baseQuery;
  } else {
    results = await baseQuery.where(eq(products.ownerId, userId));
  }

  return results;
}
