/**
 * Members API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from -members.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getMembers,
  createMember,
  createMemberApiSchema,
} from './-members.server';
import type { MemberDto } from './-members.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getMembersFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<MemberDto[]> => {
    return getMembers(context.user);
  });

export const createMemberFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(createMemberApiSchema)
  .handler(async ({ data, context }): Promise<MemberDto> => {
    return createMember(data, context.user);
  });
