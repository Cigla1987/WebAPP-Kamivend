/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { UserRole } from '#/shared/enums';
import { pictures, user } from '@/server/db/schema';
import { and, eq, or, isNull } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';
import z from 'zod';

export type PictureDto = {
  id: string;
  pictureName: string;
  pictureContent: string | null;
  pictureDateCreated: Date | null;
  pictureOwner: string | null;
};

export const createPictureApiSchema = z.object({
  pictureName: z
    .string()
    .min(1, 'Picture name is required')
    .max(255, 'Picture name must be less than 255 characters'),
  pictureContent: z.string().min(1, 'Picture content is required'),
});

export const deletePictureApiSchema = z.object({
  pictureId: z.uuid('Picture ID must be a valid UUID'),
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
      pictureOwner: user.name,
    })
    .from(pictures)
    .leftJoin(user, eq(pictures.pictureOwnerId, user.id));

  let results: PictureDto[];

  if (role === UserRole.Superadmin) {
    results = await baseQuery;
  } else {
    const [currentUserRecord] = await db
      .select({ ownerId: user.ownerId })
      .from(user)
      .where(eq(user.id, userId));

    if (currentUserRecord.ownerId === null) {
      const members = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.ownerId, userId));

      const memberIds = members.map((m) => m.id);

      results = await baseQuery.where(
        or(
          eq(pictures.pictureOwnerId, userId),
          ...memberIds.map((memberId) => eq(pictures.pictureOwnerId, memberId)),
          isNull(pictures.pictureOwnerId)
        )
      );
    } else {
      results = await baseQuery.where(
        or(
          eq(pictures.pictureOwnerId, userId),
          eq(pictures.pictureOwnerId, currentUserRecord.ownerId),
          isNull(pictures.pictureOwnerId)
        )
      );
    }
  }

  return results;
}

export async function createPicture(
  data: CreatePicture,
  currentUser: Pick<User, 'id' | 'role' | 'name'>
): Promise<PictureDto> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const [createdPicture] = await db
    .insert(pictures)
    .values({
      pictureName: data.pictureName,
      pictureContent: data.pictureContent,
      pictureOwnerId: role === UserRole.Superadmin ? null : userId,
    })
    .returning({
      id: pictures.id,
      pictureName: pictures.pictureName,
      pictureContent: pictures.pictureContent,
      pictureDateCreated: pictures.pictureDateCreated,
    });

  return {
    ...createdPicture,
    pictureOwner: role === UserRole.Superadmin ? null : currentUser.name,
  };
}

export async function deletePicture(
  data: DeletePicture,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<void> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const baseQuery = db.select({ id: pictures.id }).from(pictures);

  let existing: { id: string }[];

  if (role === UserRole.Superadmin) {
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
