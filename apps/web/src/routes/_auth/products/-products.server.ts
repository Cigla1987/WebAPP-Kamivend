/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '#/server/db';
import { UserRole } from '@vending/domain';
import {
  products,
  pictures,
  currencies,
  units,
} from '@vending/db';
import { organization } from '@vending/auth';
import { eq } from 'drizzle-orm';
import type { User } from '@vending/auth';
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
};

export async function getProducts(
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<ProductDto[]> {
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
    })
    .from(products)
    .leftJoin(currencies, eq(currencies.id, products.defaultCurrencyId))
    .leftJoin(units, eq(units.id, products.defaultUnitId))
    .leftJoin(pictures, eq(pictures.id, products.productPictureId));

  let results: ProductDto[];

  if (currentUser.role === UserRole.Admin) {
    results = await baseQuery;
  } else {
    if (!activeOrg) {
      return [];
    }
    results = await baseQuery.where(eq(products.organizationId, activeOrg.id));
  }

  return results;
}

export async function createProduct(
  data: CreateProduct,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<ProductDto> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  const [createdProduct] = await db
    .insert(products)
    .values({
      productName: data.productName,
      defaultPrice: data.defaultPrice.toString(),
      defaultCurrencyId: data.currencyId,
      defaultQuantity: data.defaultQuantity.toString(),
      defaultUnitId: data.unitId,
      organizationId: activeOrg.id,
      createdBy: currentUser.id,
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
    })
    .from(products)
    .leftJoin(currencies, eq(currencies.id, products.defaultCurrencyId))
    .leftJoin(units, eq(units.id, products.defaultUnitId))
    .leftJoin(pictures, eq(pictures.id, products.productPictureId))
    .where(eq(products.id, createdProduct.id));

  return product;
}

export async function updateProductDiscount(
  data: UpdateProductDiscount,
  activeOrg: typeof organization.$inferSelect | null
): Promise<void> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  const [existingProduct] = await db
    .select({ id: products.id, organizationId: products.organizationId })
    .from(products)
    .where(eq(products.id, data.id))
    .limit(1);

  if (!existingProduct) {
    throw new Error('Product not found.');
  }

  if (existingProduct.organizationId !== activeOrg.id) {
    throw new Error('Unauthorized.');
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
  activeOrg: typeof organization.$inferSelect | null
): Promise<void> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  const [existingProduct] = await db
    .select({ id: products.id, organizationId: products.organizationId })
    .from(products)
    .where(eq(products.id, data.id))
    .limit(1);

  if (!existingProduct) {
    throw new Error('Product not found.');
  }

  if (existingProduct.organizationId !== activeOrg.id) {
    throw new Error('Unauthorized.');
  }

  await db
    .update(products)
    .set({
      productPictureId: data.productPictureId,
    })
    .where(eq(products.id, data.id));
}
