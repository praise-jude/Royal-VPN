import { Platform } from 'react-native';
import RoyalVpnAndroid from '../../modules/royal-vpn-android/src/RoyalVpnAndroidModule';

export const isRealVpnAvailable = Platform.OS === 'android';

export async function requestVpnPermission() {
  if (!isRealVpnAvailable) return false;
  try {
    return await RoyalVpnAndroid.requestPermissionAsync();
  } catch (e) {
    return false;
  }
}

// The device's WireGuard public key, generated and persisted on-device.
// The matching private key never leaves the device.
export async function getDevicePublicKey() {
  if (!isRealVpnAvailable) return null;
  try {
    return await RoyalVpnAndroid.getPublicKeyAsync();
  } catch (e) {
    return null;
  }
}

export async function startRealVpn({ serverPublicKey, endpoint, clientAddress, dns }) {
  if (!isRealVpnAvailable) return false;
  try {
    return await RoyalVpnAndroid.startTunnelAsync(serverPublicKey, endpoint, clientAddress, dns);
  } catch (e) {
    return false;
  }
}

export async function stopRealVpn() {
  if (!isRealVpnAvailable) return;
  try {
    await RoyalVpnAndroid.stopTunnelAsync();
  } catch (e) {
    // no-op
  }
}

export async function checkRealVpnActive() {
  if (!isRealVpnAvailable) return false;
  try {
    return await RoyalVpnAndroid.isActive();
  } catch (e) {
    return false;
  }
}
