import type { DeviceDeparture } from './deviceDeparture';

export const canUseDeviceLocation = false;

export async function findDeviceDeparture(_askPermission: boolean): Promise<DeviceDeparture> {
  return { reason: 'unavailable' };
}
