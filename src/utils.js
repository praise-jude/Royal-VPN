import { colors } from './theme';

export function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const p = (n) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export function computeConnectionScore({ ping, packetLoss, jitter, load, latencyPenalty = 0 }) {
  const effectivePing = ping + latencyPenalty;
  const penalty =
    effectivePing * 0.3 + packetLoss * 18 + jitter * 1.5 + Math.max(0, load - 40) * 0.25;
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let label = 'Excellent';
  let color = colors.green;
  if (score < 60) {
    label = 'Poor';
    color = colors.red;
  } else if (score < 80) {
    label = 'Fair';
    color = colors.yellow;
  } else if (score < 92) {
    label = 'Good';
    color = colors.green;
  }

  return { score, label, color };
}

const MULTI_HOP_OVERHEAD_MS = 15;

export function computeMultiHopQuality(entry, exit) {
  return computeConnectionScore({
    ping: entry.ping + exit.ping,
    packetLoss: entry.packetLoss + exit.packetLoss,
    jitter: Math.max(entry.jitter, exit.jitter),
    load: Math.round((entry.load + exit.load) / 2),
    latencyPenalty: MULTI_HOP_OVERHEAD_MS,
  });
}

export function rankServers(servers, latencyPenalty = 0) {
  return servers
    .map((sv) => ({ ...sv, quality: computeConnectionScore({ ...sv, latencyPenalty }) }))
    .sort((a, b) => b.quality.score - a.quality.score);
}
