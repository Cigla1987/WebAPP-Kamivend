/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { UserRole } from '#/shared/enums';
import {
  products,
  pictures,
  symbols,
  currencies,
  units,
} from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';
import z from 'zod';

export const createProductApiSchema = z.object({
  productName: z
    .string()
    .min(6, 'Name must contain at least 6 characters')
    .max(100)
    .trim(),
  defaultPrice: z.number().positive('Default price must be a positive number'),
  currencyId: z.uuid('Currency ID must be a valid UUID'),
  defaultQuantity: z.number().positive('Quantity must be a positive number'),
  unitId: z.uuid('Unit ID must be a valid UUID'),
  productSymbolId: z.uuid().nullish(),
});

export const updateProductDiscountApiSchema = z.object({
  id: z.uuid('Product ID must be a valid UUID'),
  defaultPrice: z.number().min(0, 'Default price must be a positive number'),
  discountValue: z.number().min(0, 'Discount value must be at least 0'),
  discountDay: z.number().min(0, 'Discount day must be at least 0'),
});

export const updateProductPictureApiSchema = z.object({
  id: z.uuid('Product ID must be a valid UUID'),
  productPictureId: z.uuid('Picture ID must be a valid UUID'),
});

type CreateProduct = z.infer<typeof createProductApiSchema>;
type UpdateProductDiscount = z.infer<typeof updateProductDiscountApiSchema>;
type UpdateProductPicture = z.infer<typeof updateProductPictureApiSchema>;

export type ProductDto = {
  id: string;
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

  if (role === UserRole.Superadmin) {
    results = await baseQuery;
  } else {
    results = await baseQuery.where(eq(products.ownerId, userId));
  }

  return results;
}

export async function createProduct(
  data: CreateProduct,
  currentUser: Pick<User, 'id'>
): Promise<ProductDto> {
  const userId = currentUser.id;

  if (data.productSymbolId) {
    const existingSymbol = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.productSymbolId, data.productSymbolId))
      .limit(1);

    if (existingSymbol.length > 0) {
      throw new Error(
        'Symbol is already in use. Please select another symbol.'
      );
    }
  }

  const [createdProduct] = await db
    .insert(products)
    .values({
      productName: data.productName,
      defaultPrice: data.defaultPrice.toString(),
      defaultCurrencyId: data.currencyId,
      defaultQuantity: data.defaultQuantity.toString(),
      defaultUnitId: data.unitId,
      ownerId: userId,
      productSymbolId: data.productSymbolId ?? null,
    })
    .returning({ id: products.id });

  const [product] = await db
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
    .leftJoin(symbols, eq(symbols.id, products.productSymbolId))
    .where(eq(products.id, createdProduct.id));

  return product;
}

export async function updateProductDiscount(
  data: UpdateProductDiscount,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<void> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const [existingProduct] = await db
    .select({ id: products.id, ownerId: products.ownerId })
    .from(products)
    .where(eq(products.id, data.id))
    .limit(1);

  if (role !== UserRole.Superadmin && existingProduct.ownerId !== userId) {
    throw new Error('Unauthorized.');
  }
  if (!existingProduct) {
    throw new Error('Product not found.');
  }

  await db
    .update(products)
    .set({
      defaultPrice: data.defaultPrice.toString(),
      discountValue: data.discountValue,
      discountDay: data.discountDay,
    })
    .where(eq(products.id, data.id));
}

export async function updateProductPicture(
  data: UpdateProductPicture,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<void> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const [existingProduct] = await db
    .select({ id: products.id, ownerId: products.ownerId })
    .from(products)
    .where(eq(products.id, data.id))
    .limit(1);

  if (role !== UserRole.Superadmin && existingProduct.ownerId !== userId) {
    throw new Error('Unauthorized.');
  }
  if (!existingProduct) {
    throw new Error('Product not found.');
  }

  await db
    .update(products)
    .set({
      productPictureId: data.productPictureId,
    })
    .where(eq(products.id, data.id));
}
