const API_BASE = 'https://royal-vpn-api-production.up.railway.app';

export async function fetchServers() {
  const res = await fetch(`${API_BASE}/servers`);
  if (!res.ok) throw new Error('Failed to load servers.');
  const data = await res.json();
  return data.servers || [];
}
