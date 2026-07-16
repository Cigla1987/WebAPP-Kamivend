/**
 * ⚠️ SERVER-ONLY FILE
 */
import { db } from '#/server/db';
import {
  machines,
  machineTypes,
  products,
  smartFridgeLayouts,
  smartFridgeLayoutSlots,
  smartFridgeProductProfiles,
  smartFridgeProfiles,
  smartShelfNodes,
  smartShelfProductAssignments,
} from '@vending/db';
import { organization } from '@vending/auth';
import type { User } from '@vending/auth';
import { MachineType, UserRole } from '@vending/domain';
import { and, eq, isNull } from 'drizzle-orm';

export type SmartFridgeShelfOverview = {
  id: string;
  deviceUid: string;
  currentCanAddress: number;
  displayName: string | null;
  calibrationValid: boolean;
  baselineValid: boolean;
  currentWeightValid: boolean;
  currentTotalWeightDg: number | null;
  storedBaselineWeightDg: number | null;
  faultMask: number;
  currentFaultCode: number;
  lastSeenAt: Date | null;
  rowNumber: number | null;
  columnNumber: number | null;
  productName: string | null;
  nominalWeightDg: number | null;
  matchingToleranceDg: number | null;
  estimatedQuantity: number | null;
};

export type SmartFridgeOverview = {
  machineId: string;
  machineName: string;
  serialNumber: string;
  profileId: string;
  fridgeCode: string | null;
  expectedShelfCount: number;
  canBitrate: number;
  protocolMajor: number;
  protocolMinor: number;
  setupCompleted: boolean;
  customerOperationEnabled: boolean;
  lastOnlineAt: Date | null;
  shelves: SmartFridgeShelfOverview[];
};

export async function getSmartFridgeOverview(
  machineId: string,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<SmartFridgeOverview> {
  const [profile] = await db
    .select({
      machineId: machines.id,
      machineName: machines.machineName,
      serialNumber: machines.serialNumber,
      machineTypeName: machineTypes.machineTypeName,
      organizationId: machines.organizationId,
      profileId: smartFridgeProfiles.id,
      fridgeCode: smartFridgeProfiles.fridgeCode,
      expectedShelfCount: smartFridgeProfiles.expectedShelfCount,
      canBitrate: smartFridgeProfiles.canBitrate,
      protocolMajor: smartFridgeProfiles.protocolMajor,
      protocolMinor: smartFridgeProfiles.protocolMinor,
      setupCompleted: smartFridgeProfiles.setupCompleted,
      customerOperationEnabled: smartFridgeProfiles.customerOperationEnabled,
      lastOnlineAt: smartFridgeProfiles.lastOnlineAt,
    })
    .from(machines)
    .innerJoin(machineTypes, eq(machines.machineTypeId, machineTypes.id))
    .innerJoin(
      smartFridgeProfiles,
      eq(smartFridgeProfiles.machineId, machines.id)
    )
    .where(eq(machines.id, machineId))
    .limit(1);

  if (!profile || profile.machineTypeName !== MachineType.Smartfridge) {
    throw new Error('SmartFridge machine not found.');
  }

  if (currentUser.role !== UserRole.Admin) {
    if (!activeOrg || profile.organizationId !== activeOrg.id) {
      throw new Error('Unauthorized.');
    }
  }

  const shelfRows = await db
    .select({
      id: smartShelfNodes.id,
      deviceUid: smartShelfNodes.deviceUid,
      currentCanAddress: smartShelfNodes.currentCanAddress,
      displayName: smartShelfNodes.displayName,
      calibrationValid: smartShelfNodes.calibrationValid,
      baselineValid: smartShelfNodes.baselineValid,
      currentWeightValid: smartShelfNodes.currentWeightValid,
      currentTotalWeightDg: smartShelfNodes.currentTotalWeightDg,
      storedBaselineWeightDg: smartShelfNodes.storedBaselineWeightDg,
      faultMask: smartShelfNodes.faultMask,
      currentFaultCode: smartShelfNodes.currentFaultCode,
      lastSeenAt: smartShelfNodes.lastSeenAt,
      rowNumber: smartFridgeLayoutSlots.rowNumber,
      columnNumber: smartFridgeLayoutSlots.columnNumber,
      productName: products.productName,
      nominalWeightDg: smartFridgeProductProfiles.nominalWeightDg,
      matchingToleranceDg: smartFridgeProductProfiles.matchingToleranceDg,
      estimatedQuantity: smartShelfProductAssignments.estimatedQuantity,
    })
    .from(smartShelfNodes)
    .leftJoin(
      smartFridgeLayoutSlots,
      eq(smartFridgeLayoutSlots.shelfId, smartShelfNodes.id)
    )
    .leftJoin(
      smartFridgeLayouts,
      and(
        eq(smartFridgeLayouts.id, smartFridgeLayoutSlots.layoutId),
        eq(smartFridgeLayouts.isActive, true)
      )
    )
    .leftJoin(
      smartShelfProductAssignments,
      and(
        eq(smartShelfProductAssignments.shelfId, smartShelfNodes.id),
        isNull(smartShelfProductAssignments.activeUntil)
      )
    )
    .leftJoin(products, eq(products.id, smartShelfProductAssignments.productId))
    .leftJoin(
      smartFridgeProductProfiles,
      eq(smartFridgeProductProfiles.productId, products.id)
    )
    .where(eq(smartShelfNodes.smartFridgeId, profile.profileId));

  return {
    machineId: profile.machineId,
    machineName: profile.machineName,
    serialNumber: profile.serialNumber,
    profileId: profile.profileId,
    fridgeCode: profile.fridgeCode,
    expectedShelfCount: profile.expectedShelfCount,
    canBitrate: profile.canBitrate,
    protocolMajor: profile.protocolMajor,
    protocolMinor: profile.protocolMinor,
    setupCompleted: profile.setupCompleted,
    customerOperationEnabled: profile.customerOperationEnabled,
    lastOnlineAt: profile.lastOnlineAt,
    shelves: shelfRows.map((shelf) => ({
      ...shelf,
      deviceUid: shelf.deviceUid.toString(),
    })),
  };
}
