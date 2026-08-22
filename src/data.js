export const servers = [
  { id: 'lagos', country: 'Nigeria', city: 'Lagos', ping: 22, load: 34, recommended: true },
  { id: 'london', country: 'United Kingdom', city: 'London', ping: 48, load: 51 },
  { id: 'newyork', country: 'United States', city: 'New York', ping: 61, load: 40 },
  { id: 'california', country: 'United States', city: 'California', ping: 74, load: 28 },
  { id: 'frankfurt', country: 'Germany', city: 'Frankfurt', ping: 39, load: 62 },
  { id: 'toronto', country: 'Canada', city: 'Toronto', ping: 58, load: 20 },
  { id: 'paris', country: 'France', city: 'Paris', ping: 44, load: 45 },
  { id: 'singapore', country: 'Singapore', city: 'Singapore', ping: 120, load: 33 },
  { id: 'tokyo', country: 'Japan', city: 'Tokyo', ping: 135, load: 30 },
];

export const devices = [
  { id: 1, name: 'iPhone 15 Pro', platform: 'iOS', lastActive: 'Active now', current: true },
  { id: 2, name: 'MacBook Pro', platform: 'macOS', lastActive: 'Active 2h ago', current: false },
  { id: 3, name: 'Home PC', platform: 'Windows', lastActive: 'Active yesterday', current: false },
];

export const tabsDef = [
  { key: 'home', icon: 'house', label: 'Home' },
  { key: 'servers', icon: 'server', label: 'Servers' },
  { key: 'security', icon: 'shield-halved', label: 'Security' },
  { key: 'devices', icon: 'mobile-screen-button', label: 'Devices' },
  { key: 'settings', icon: 'gear', label: 'Settings' },
];
