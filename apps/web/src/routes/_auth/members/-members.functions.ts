/**
 * Members API Functions
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getMembers,
  getPendingInvitations,
  inviteMember,
  inviteMemberApiSchema,
} from './-members.server';
import type { MemberDto, InvitationDto } from './-members.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';
import { requireRole } from '#/middleware/roles';
import { MemberRole } from '@vending/domain';

export const getMembersFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<MemberDto[]> => {
    return getMembers(context.user, context.activeOrganization);
  });

export const getPendingInvitationsFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, requireRole(MemberRole.Owner)])
  .handler(async ({ context }): Promise<InvitationDto[]> => {
    return getPendingInvitations(context.activeOrganization);
  });

export const inviteMemberFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(MemberRole.Owner)])
  .validator(inviteMemberApiSchema)
  .handler(async ({ data, context }): Promise<MemberDto> => {
    return inviteMember(data, context.activeOrganization);
  });
