import { registerWebModule, NativeModule } from 'expo';

class RoyalVpnAndroidModule extends NativeModule<{}> {
  async requestPermissionAsync(): Promise<boolean> {
    return false;
  }
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  async isActive(): Promise<boolean> {
    return false;
  }
}

export default registerWebModule(RoyalVpnAndroidModule, 'RoyalVpnAndroidModule');
