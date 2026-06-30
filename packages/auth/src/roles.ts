import { createAccessControl } from 'better-auth/plugins/access';

export const statements = {
  machine: ['create', 'read', 'update', 'delete', 'assign'],
  product: ['create', 'read', 'update', 'delete'],
  compartment: ['read', 'update', 'stock'],
  picture: ['create', 'read', 'update', 'delete'],
  member: ['create', 'read', 'update', 'delete'],
  invitation: ['create', 'read', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statements);

export const owner = ac.newRole({
  machine: ['create', 'read', 'update', 'delete', 'assign'],
  product: ['create', 'read', 'update', 'delete'],
  compartment: ['read', 'update', 'stock'],
  picture: ['create', 'read', 'update', 'delete'],
  member: ['create', 'read', 'update', 'delete'],
  invitation: ['create', 'read', 'update', 'delete'],
});

export const employee = ac.newRole({
  machine: ['read'],
  product: ['read'],
  compartment: ['read', 'update', 'stock'],
  picture: ['read'],
  member: ['read'],
  invitation: ['read'],
});
