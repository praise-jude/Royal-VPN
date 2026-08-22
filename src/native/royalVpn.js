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

export async function startRealVpn() {
  if (!isRealVpnAvailable) return;
  try {
    await RoyalVpnAndroid.start();
  } catch (e) {
    // no-op: the app's own mock connection state still governs the UI
  }
}

export async function stopRealVpn() {
  if (!isRealVpnAvailable) return;
  try {
    await RoyalVpnAndroid.stop();
  } catch (e) {
    // no-op
  }
}
