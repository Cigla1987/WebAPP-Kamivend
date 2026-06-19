/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '@/server/db';
import { UserRole } from '#/shared/enums';
import { pictures, user } from '@/server/db/schema';
import { organization } from '@/server/db/schema/auth';
import { eq, and } from 'drizzle-orm';
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
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<PictureDto[]> {
  const baseQuery = db
    .select({
      id: pictures.id,
      pictureName: pictures.pictureName,
      pictureContent: pictures.pictureContent,
      pictureDateCreated: pictures.pictureDateCreated,
      pictureOwner: user.name,
    })
    .from(pictures)
    .leftJoin(user, eq(pictures.createdBy, user.id));

  let results: PictureDto[];

  if (currentUser.role === UserRole.Admin) {
    results = await baseQuery;
  } else {
    if (!activeOrg) {
      return [];
    }
    results = await baseQuery.where(eq(pictures.organizationId, activeOrg.id));
  }

  return results;
}

export async function createPicture(
  data: CreatePicture,
  currentUser: Pick<User, 'id' | 'role' | 'name'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<PictureDto> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  const [createdPicture] = await db
    .insert(pictures)
    .values({
      pictureName: data.pictureName,
      pictureContent: data.pictureContent,
      organizationId: activeOrg.id,
      createdBy: currentUser.id,
    })
    .returning({
      id: pictures.id,
      pictureName: pictures.pictureName,
      pictureContent: pictures.pictureContent,
      pictureDateCreated: pictures.pictureDateCreated,
    });

  return {
    ...createdPicture,
    pictureOwner: currentUser.name,
  };
}

export async function deletePicture(
  data: DeletePicture,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<void> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  const baseQuery = db.select({ id: pictures.id }).from(pictures);

  let existing: { id: string }[];

  if (currentUser.role === UserRole.Admin) {
    existing = await baseQuery.where(eq(pictures.id, data.pictureId));
  } else {
    existing = await baseQuery.where(
      and(
        eq(pictures.id, data.pictureId),
        eq(pictures.organizationId, activeOrg.id)
      )
    );
  }

  if (existing.length === 0) {
    throw new Error('Picture not found or access denied');
  }

  await db.delete(pictures).where(eq(pictures.id, data.pictureId));
}
