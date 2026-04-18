import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

export const statement = {
  ...defaultStatements,
  system: ['superadmin'],
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

export const superadmin = ac.newRole({
  ...adminAc.statements,
  system: ['superadmin'],
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
