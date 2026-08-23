export const regions = [
  { key: 'all', label: 'All', icon: 'globe' },
  { key: 'africa', label: 'Africa', icon: 'earth-africa' },
  { key: 'europe', label: 'Europe', icon: 'earth-europe' },
  { key: 'americas', label: 'Americas', icon: 'earth-americas' },
  { key: 'asia', label: 'Asia', icon: 'earth-asia' },
  { key: 'middleEast', label: 'Middle East', icon: 'mosque' },
  { key: 'oceania', label: 'Oceania', icon: 'earth-oceania' },
];

// Free plan gets exactly the 3 servers below (matching the Free plan's
// "3 server locations" copy on the Plans screen). Everything else is
// VIP -- locked behind a paid subscription.
export const servers = [
  { id: 'lagos', country: 'Nigeria', city: 'Lagos', region: 'africa', ping: 22, load: 34, packetLoss: 0.1, jitter: 2 },
  { id: 'london', country: 'United Kingdom', city: 'London', region: 'europe', ping: 48, load: 51, packetLoss: 0.3, jitter: 4 },
  { id: 'newyork', country: 'United States', city: 'New York', region: 'americas', ping: 61, load: 40, packetLoss: 0.2, jitter: 5 },

  { id: 'california', country: 'United States', city: 'California', region: 'americas', ping: 74, load: 28, packetLoss: 0.1, jitter: 3, vip: true },
  { id: 'frankfurt', country: 'Germany', city: 'Frankfurt', region: 'europe', ping: 39, load: 62, packetLoss: 0.4, jitter: 6, vip: true },
  { id: 'toronto', country: 'Canada', city: 'Toronto', region: 'americas', ping: 58, load: 20, packetLoss: 0.1, jitter: 3, vip: true },
  { id: 'paris', country: 'France', city: 'Paris', region: 'europe', ping: 44, load: 45, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'singapore', country: 'Singapore', city: 'Singapore', region: 'asia', ping: 120, load: 33, packetLoss: 0.3, jitter: 7, vip: true },
  { id: 'tokyo', country: 'Japan', city: 'Tokyo', region: 'asia', ping: 135, load: 30, packetLoss: 0.2, jitter: 6, vip: true },

  // Africa
  { id: 'johannesburg', country: 'South Africa', city: 'Johannesburg', region: 'africa', ping: 45, load: 38, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'nairobi', country: 'Kenya', city: 'Nairobi', region: 'africa', ping: 52, load: 42, packetLoss: 0.3, jitter: 5, vip: true },
  { id: 'accra', country: 'Ghana', city: 'Accra', region: 'africa', ping: 58, load: 33, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'cairo', country: 'Egypt', city: 'Cairo', region: 'africa', ping: 68, load: 35, packetLoss: 0.2, jitter: 4, vip: true },

  // Europe
  { id: 'amsterdam', country: 'Netherlands', city: 'Amsterdam', region: 'europe', ping: 41, load: 48, packetLoss: 0.2, jitter: 3, vip: true },
  { id: 'zurich', country: 'Switzerland', city: 'Zurich', region: 'europe', ping: 43, load: 30, packetLoss: 0.1, jitter: 3, vip: true },
  { id: 'stockholm', country: 'Sweden', city: 'Stockholm', region: 'europe', ping: 47, load: 25, packetLoss: 0.1, jitter: 3, vip: true },

  // France (full coverage)
  { id: 'marseille', country: 'France', city: 'Marseille', region: 'europe', ping: 49, load: 36, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'lyon', country: 'France', city: 'Lyon', region: 'europe', ping: 46, load: 41, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'nice', country: 'France', city: 'Nice', region: 'europe', ping: 51, load: 29, packetLoss: 0.1, jitter: 3, vip: true },
  { id: 'bordeaux', country: 'France', city: 'Bordeaux', region: 'europe', ping: 47, load: 33, packetLoss: 0.2, jitter: 4, vip: true },

  // USA (full coverage)
  { id: 'chicago', country: 'United States', city: 'Chicago', region: 'americas', ping: 56, load: 45, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'miami', country: 'United States', city: 'Miami', region: 'americas', ping: 65, load: 38, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'dallas', country: 'United States', city: 'Dallas', region: 'americas', ping: 60, load: 31, packetLoss: 0.1, jitter: 3, vip: true },
  { id: 'seattle', country: 'United States', city: 'Seattle', region: 'americas', ping: 71, load: 26, packetLoss: 0.1, jitter: 3, vip: true },
  { id: 'ashburn', country: 'United States', city: 'Ashburn', region: 'americas', ping: 55, load: 58, packetLoss: 0.3, jitter: 5, vip: true },

  // Asia
  { id: 'mumbai', country: 'India', city: 'Mumbai', region: 'asia', ping: 95, load: 55, packetLoss: 0.3, jitter: 6, vip: true },
  { id: 'seoul', country: 'South Korea', city: 'Seoul', region: 'asia', ping: 128, load: 38, packetLoss: 0.2, jitter: 5, vip: true },

  // Middle East
  { id: 'dubai', country: 'United Arab Emirates', city: 'Dubai', region: 'middleEast', ping: 78, load: 44, packetLoss: 0.2, jitter: 4, vip: true },
  { id: 'istanbul', country: 'Turkey', city: 'Istanbul', region: 'middleEast', ping: 62, load: 40, packetLoss: 0.2, jitter: 4, vip: true },

  // Oceania
  { id: 'sydney', country: 'Australia', city: 'Sydney', region: 'oceania', ping: 145, load: 32, packetLoss: 0.3, jitter: 6, vip: true },
];

export const vpnProtocols = [
  {
    key: 'wireguard',
    label: 'WireGuard',
    icon: 'bolt',
    description: 'Fastest, modern protocol — recommended for most people',
  },
  {
    key: 'ikev2',
    label: 'IKEv2',
    icon: 'arrows-rotate',
    description: 'Reconnects quickly when switching between Wi-Fi and mobile data',
  },
];

export const connectionModes = [
  {
    key: 'speed',
    label: 'Speed',
    icon: 'bolt',
    tagline: 'Single-hop · fastest server · minimal overhead',
    hopLabel: 'Single-hop',
    hops: 1,
    latencyPenalty: 0,
    tradeoff: { privacy: 'STANDARD', speed: 'HIGHEST', latency: 'LOWEST' },
  },
  {
    key: 'balanced',
    label: 'Balanced',
    icon: 'scale-balanced',
    tagline: 'Fast server · security filtering · leak protection',
    hopLabel: 'Single-hop',
    hops: 1,
    latencyPenalty: 4,
    tradeoff: { privacy: 'ENHANCED', speed: 'HIGH', latency: 'LOW' },
  },
  {
    key: 'privacy',
    label: 'Max Privacy',
    icon: 'user-secret',
    tagline: 'Multi-hop · strict DNS · maximum privacy',
    hopLabel: 'Multi-hop',
    hops: 2,
    latencyPenalty: 22,
    tradeoff: { privacy: 'HIGH', speed: 'MODERATE', latency: 'HIGHER' },
  },
];

export const splitTunnelApps = [
  { id: 'chrome', name: 'Chrome', icon: 'globe' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'comment' },
  { id: 'mt5', name: 'MT5 Trading', icon: 'chart-line' },
  { id: 'youtube', name: 'YouTube', icon: 'video' },
  { id: 'printer', name: 'Local Printer', icon: 'print' },
  { id: 'banking', name: 'Banking App', icon: 'building-columns' },
];

export const threatCategories = [
  { key: 'ads', label: 'Ads', icon: 'rectangle-ad', color: '#FF9300' },
  { key: 'trackers', label: 'Trackers', icon: 'satellite-dish', color: '#000F9A' },
  { key: 'malware', label: 'Malware', icon: 'bug', color: '#EF4444' },
  { key: 'phishing', label: 'Phishing', icon: 'user-secret', color: '#A855F7' },
];

export const initialThreatCounts = { ads: 812, trackers: 341, malware: 12, phishing: 6 };

export const threatDomainPool = {
  ads: ['ads.doubleclick.net', 'pagead2.googlesyndication.com', 'adservice.google.com', 'adnxs.com'],
  trackers: ['scorecardresearch.com', 'segment.io', 'mixpanel.com', 'hotjar.com', 'branch.io'],
  malware: ['xkcdupdate.info', 'freegift-claim.ru', 'setup-installer.top'],
  phishing: ['secure-login-verify.com', 'account-update-alert.net', 'signin-support.help'],
};

export const initialTrustedNetworks = [
  { id: 1, name: 'Home Wi-Fi' },
  { id: 2, name: 'Office Wi-Fi' },
];

export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '₦0',
    period: '',
    features: ['1 device', '3 server locations', '10 GB / month', 'Standard support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: null,
    period: '/month',
    features: [
      '5 devices',
      'All server locations',
      'Unlimited data',
      'Threat Blocker',
      'Multi-Hop routing',
      'Priority support',
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: null,
    period: '/month',
    features: [
      '10 devices',
      'All server locations',
      'Unlimited data',
      'Threat Blocker',
      'Multi-Hop routing',
      'Family sharing (up to 6 accounts)',
      'Priority support',
    ],
  },
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
