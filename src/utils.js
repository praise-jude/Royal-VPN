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
