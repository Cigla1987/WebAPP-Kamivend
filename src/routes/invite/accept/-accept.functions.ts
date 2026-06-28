/**
 * Invitation API Functions
 */

import { createServerFn } from '@tanstack/react-start';
import { getInvitationByToken } from './-accept.server';
import type { InvitationDetails } from './-accept.server';

export const getInvitationFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }): Promise<InvitationDetails | null> => {
    return getInvitationByToken(data.token);
  });
