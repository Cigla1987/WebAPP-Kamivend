import { queryOptions } from '@tanstack/react-query';
import { getMembersFn, getPendingInvitationsFn } from './-members.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function membersQueryOptions() {
  return queryOptions({
    queryKey: ['members'] as const,
    queryFn: () => getMembersFn(),
    staleTime: ONE_MINUTE,
  });
}

export function pendingInvitationsQueryOptions() {
  return queryOptions({
    queryKey: ['pending-invitations'] as const,
    queryFn: () => getPendingInvitationsFn(),
    staleTime: ONE_MINUTE,
  });
}
