import { NativeModule, requireNativeModule } from 'expo';

declare class RoyalVpnAndroidModule extends NativeModule<{}> {
  getPublicKeyAsync(): Promise<string>;
  requestPermissionAsync(): Promise<boolean>;
  startTunnelAsync(serverPublicKey: string, endpoint: string, clientAddress: string, dns: string): Promise<boolean>;
  stopTunnelAsync(): Promise<boolean>;
  isActive(): Promise<boolean>;
  startGuardAsync(): Promise<boolean>;
  stopGuardAsync(): Promise<boolean>;
  isGuardActive(): Promise<boolean>;
}

export default requireNativeModule<RoyalVpnAndroidModule>('RoyalVpnAndroid');
