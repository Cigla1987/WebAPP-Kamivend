/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { pictures } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';
import z from 'zod';

export type PictureDto = {
  id: number;
  pictureName: string;
  pictureContent: string | null;
  pictureDateCreated: Date | null;
  pictureOwnerId: string | null;
};

export const createPictureApiSchema = z.object({
  pictureName: z
    .string()
    .min(1, 'Picture name is required')
    .max(255, 'Picture name must be less than 255 characters'),
  pictureContent: z.string().min(1, 'Picture content is required'),
});

export const deletePictureApiSchema = z.object({
  pictureId: z.int().positive('Picture ID must be a positive number'),
});

type CreatePicture = z.infer<typeof createPictureApiSchema>;
type DeletePicture = z.infer<typeof deletePictureApiSchema>;

export async function getPictures(
  currentUser: Pick<User, 'id' | 'role'>
): Promise<PictureDto[]> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const baseQuery = db
    .select({
      id: pictures.id,
      pictureName: pictures.pictureName,
      pictureContent: pictures.pictureContent,
      pictureDateCreated: pictures.pictureDateCreated,
      pictureOwnerId: pictures.pictureOwnerId,
    })
    .from(pictures);

  let results: PictureDto[];

  if (role === 'superadmin') {
    results = await baseQuery;
  } else {
    results = await baseQuery.where(eq(pictures.pictureOwnerId, userId));
  }

  return results;
}

export async function createPicture(
  data: CreatePicture,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<PictureDto> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const [createdPicture] = await db
    .insert(pictures)
    .values({
      pictureName: data.pictureName,
      pictureContent: data.pictureContent,
      pictureOwnerId: role === 'superadmin' ? null : userId,
    })
    .returning({
      id: pictures.id,
      pictureName: pictures.pictureName,
      pictureContent: pictures.pictureContent,
      pictureDateCreated: pictures.pictureDateCreated,
      pictureOwnerId: pictures.pictureOwnerId,
    });

  return createdPicture;
}

export async function deletePicture(
  data: DeletePicture,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<void> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const baseQuery = db.select({ id: pictures.id }).from(pictures);

  let existing: { id: number }[];

  if (role === 'superadmin') {
    existing = await baseQuery.where(eq(pictures.id, data.pictureId));
  } else {
    existing = await baseQuery.where(
      and(eq(pictures.id, data.pictureId), eq(pictures.pictureOwnerId, userId))
    );
  }

  if (existing.length === 0) {
    throw new Error('Picture not found or access denied');
  }

  await db.delete(pictures).where(eq(pictures.id, data.pictureId));
}
