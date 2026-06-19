import { UserRole } from '#/shared/enums';
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

export const statement = {
  ...defaultStatements,
  system: [UserRole.Admin],
  machine: [
    'create',
    'read',
    'update_machine_mode',
    'update_machine_owner',
    'delete',
    'assign',
  ],
  product: ['create', 'read', 'update', 'delete'],
  compartment: ['read', 'update', 'stock'],
  symbol: ['create', 'read', 'update', 'delete'],
  picture: ['create', 'read', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  system: [UserRole.Admin],
  machine: [
    'create',
    'read',
    'update_machine_mode',
    'update_machine_owner',
    'delete',
    'assign',
  ],
  product: ['create', 'read', 'update', 'delete'],
  compartment: ['read', 'update', 'stock'],
  symbol: ['create', 'read', 'update', 'delete'],
  picture: ['create', 'read', 'update', 'delete'],
});

export const owner = ac.newRole({
  machine: ['create', 'read', 'update_machine_owner', 'delete', 'assign'],
  product: ['create', 'read', 'update', 'delete'],
  compartment: ['read', 'update', 'stock'],
  symbol: ['create', 'read', 'update', 'delete'],
  picture: ['create', 'read', 'update', 'delete'],
});

export const employee = ac.newRole({
  machine: ['read'],
  product: ['read'],
  compartment: ['read', 'update', 'stock'],
  symbol: ['read'],
  picture: ['read'],
});
