import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { machines, machineTypes, machineModes } from '#/server/db/schema';

export const insertMachineSchema = createInsertSchema(machines, {
  machineName: z.string().min(1).max(100),
  serialNumber: z.string().min(1).max(100),
  productionYear: z.number().min(2000).max(new Date().getFullYear()),
  compartmentCount: z.number().min(1).max(100),
  latitude: z
    .string()
    .regex(/^-?\d{1,2}\.\d{4,6}$/)
    .optional(),
  longitude: z
    .string()
    .regex(/^-?\d{1,3}\.\d{4,6}$/)
    .optional(),
});

export const selectMachineSchema = createSelectSchema(machines);
export const updateMachineSchema = createUpdateSchema(machines);

export const machineFormSchema = insertMachineSchema.omit({
  id: true,
  machineDateCreated: true,
  ownerId: true,
});

export const createMachineApiSchema = insertMachineSchema;
export const updateMachineApiSchema = updateMachineSchema.partial();

export const insertMachineTypeSchema = createInsertSchema(machineTypes);
export const selectMachineTypeSchema = createSelectSchema(machineTypes);

export const insertMachineModeSchema = createInsertSchema(machineModes);
export const selectMachineModeSchema = createSelectSchema(machineModes);
