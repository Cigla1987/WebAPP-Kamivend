import { MemberRole } from '@vending/domain';

export function isOrgMember(memberRole: string): boolean {
  return memberRole === MemberRole.Owner || memberRole === MemberRole.Employee;
}

export function isOwner(memberRole: string): boolean {
  return memberRole === MemberRole.Owner;
}
