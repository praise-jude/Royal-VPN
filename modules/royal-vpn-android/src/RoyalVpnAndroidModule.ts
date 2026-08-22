import { NativeModule, requireNativeModule } from 'expo';

declare class RoyalVpnAndroidModule extends NativeModule<{}> {
  requestPermissionAsync(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
  isActive(): Promise<boolean>;
}

export default requireNativeModule<RoyalVpnAndroidModule>('RoyalVpnAndroid');
