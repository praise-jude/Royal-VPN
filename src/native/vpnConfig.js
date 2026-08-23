import { getToken } from './auth';

const API_BASE = 'https://royal-vpn-api-production.up.railway.app';

// Registers this device's WireGuard public key as a peer on the chosen
// real server and returns everything needed to bring up a real tunnel.
export async function registerPilotPeer(publicKey, serverId) {
  const token = await getToken();
  if (!token) return { success: false, error: 'Not authenticated.' };
  try {
    const res = await fetch(`${API_BASE}/vpn/server-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ publicKey, serverId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data.error || 'Could not reach the pilot server.' };
    return { success: true, ...data };
  } catch (e) {
    return { success: false, error: 'Could not reach the pilot server.' };
  }
}
