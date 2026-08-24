export const regions = [
  { key: 'all', label: 'All', icon: 'globe' },
  { key: 'africa', label: 'Africa', icon: 'earth-africa' },
  { key: 'europe', label: 'Europe', icon: 'earth-europe' },
  { key: 'americas', label: 'Americas', icon: 'earth-americas' },
  { key: 'asia', label: 'Asia', icon: 'earth-asia' },
  { key: 'middleEast', label: 'Middle East', icon: 'mosque' },
  { key: 'oceania', label: 'Oceania', icon: 'earth-oceania' },
];

// Server locations are fetched live from the backend (GET /servers) --
// this map only supplies the region grouping used for the filter chips,
// keyed by the real server ids the backend returns. No ping/load/status
// data is hardcoded here; that all comes from the pilot node's real
// health check or is honestly marked "Coming Soon".
export const serverRegionMap = {
  'pilot-nyc1': 'americas',
  london: 'europe',
  frankfurt: 'europe',
  lag1: 'africa',
  sin1: 'asia',
  syd1: 'oceania',
};

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

// Two tiers only: Freemium (ad-supported, free) and VIP (no ads, flat price).
// Both get the same feature set -- the difference is ads, not functionality.
// NOTE: 'vip' price here is a display string only. The real Paystack charge
// amount comes from the PLAN_VIP_NGN env var on the backend (server/index.js) --
// keep that in sync with this price or customers will see one number and be
// charged another.
const SHARED_PLAN_FEATURES = [
  '3 live servers (more coming soon)',
  '1 device',
  'Unlimited data',
  'Threat Blocker',
  'Multi-Hop routing',
  'Trusted Trading — add your own trusted sites',
  'Priority support',
  'Speed Test',
  'Max Privacy mode',
];

export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Freemium',
    price: '₦0',
    period: '',
    features: ['Includes ads', ...SHARED_PLAN_FEATURES],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: '₦20,000',
    period: '/month',
    features: ['No ads', ...SHARED_PLAN_FEATURES],
  },
];

export const devices = [
  { id: 1, name: 'iPhone 15 Pro', platform: 'iOS', lastActive: 'Active now', current: true },
  { id: 2, name: 'MacBook Pro', platform: 'macOS', lastActive: 'Active 2h ago', current: false },
  { id: 3, name: 'Home PC', platform: 'Windows', lastActive: 'Active yesterday', current: false },
];

// Empty by default -- add your own trusted domains from the Trusted Trading screen.
export const initialTrustedServices = [];

export const tabsDef = [
  { key: 'home', icon: 'house', label: 'Home' },
  { key: 'servers', icon: 'server', label: 'Servers' },
  { key: 'security', icon: 'shield-halved', label: 'Security' },
  { key: 'devices', icon: 'mobile-screen-button', label: 'Devices' },
  { key: 'settings', icon: 'gear', label: 'Settings' },
];
