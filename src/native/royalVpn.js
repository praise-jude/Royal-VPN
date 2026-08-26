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

// Real Kill Switch / Royal Lockdown enforcement: a black-hole VPN interface
// that blocks every other app's traffic until the real WireGuard tunnel is
// back up. See RoyalGuardVpnService.kt for how this actually blocks traffic
// rather than just flipping a UI toggle.
export async function startTrafficGuard() {
  if (!isRealVpnAvailable) return false;
  try {
    return await RoyalVpnAndroid.startGuardAsync();
  } catch (e) {
    return false;
  }
}

export async function stopTrafficGuard() {
  if (!isRealVpnAvailable) return false;
  try {
    return await RoyalVpnAndroid.stopGuardAsync();
  } catch (e) {
    return false;
  }
}

export async function checkTrafficGuardActive() {
  if (!isRealVpnAvailable) return false;
  try {
    return await RoyalVpnAndroid.isGuardActive();
  } catch (e) {
    return false;
  }
}
