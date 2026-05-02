import {
  createSelectSchema,
  // createInsertSchema,
  // createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { machines, machineTypes, machineModes } from '#/server/db/schema';

export const selectMachineSchema = createSelectSchema(machines);
// const insertMachineSchema = createInsertSchema(machines);
// const updateMachineSchema = createUpdateSchema(machines);

export const selectMachineTypeSchema = createSelectSchema(machineTypes);
export const selectMachineModeSchema = createSelectSchema(machineModes);

export type Machine = z.infer<typeof selectMachineSchema>;
export type MachineType = z.infer<typeof selectMachineTypeSchema>;
export type MachineMode = z.infer<typeof selectMachineModeSchema>;
