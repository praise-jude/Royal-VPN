import { registerWebModule, NativeModule } from 'expo';

class RoyalVpnAndroidModule extends NativeModule<{}> {
  async getPublicKeyAsync(): Promise<string> {
    return '';
  }
  async requestPermissionAsync(): Promise<boolean> {
    return false;
  }
  async startTunnelAsync(): Promise<boolean> {
    return false;
  }
  async stopTunnelAsync(): Promise<boolean> {
    return false;
  }
  async isActive(): Promise<boolean> {
    return false;
  }
  async startGuardAsync(): Promise<boolean> {
    return false;
  }
  async stopGuardAsync(): Promise<boolean> {
    return false;
  }
  async isGuardActive(): Promise<boolean> {
    return false;
  }
}

export default registerWebModule(RoyalVpnAndroidModule, 'RoyalVpnAndroidModule');
