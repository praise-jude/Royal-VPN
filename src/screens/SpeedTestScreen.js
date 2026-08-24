import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from '../components/Pressable';
import BackHeader from '../components/BackHeader';
import { getNetworkRecommendation } from '../utils';
import { colors, font } from '../theme';

const PHASES = [
  { key: 'ping', label: 'Testing ping', icon: 'bolt', unit: 'ms', durationMs: 900 },
  { key: 'jitter', label: 'Testing jitter', icon: 'wave-square', unit: 'ms', durationMs: 800 },
  { key: 'loss', label: 'Testing packet loss', icon: 'triangle-exclamation', unit: '%', durationMs: 800 },
  { key: 'download', label: 'Testing download', icon: 'download', unit: 'Mbps', durationMs: 1400 },
  { key: 'upload', label: 'Testing upload', icon: 'upload', unit: 'Mbps', durationMs: 1200 },
];

function randomizeResult(key, server) {
  const ping = server.ping ?? 0;
  const jitter = server.jitter ?? 0;
  const packetLoss = server.packetLoss ?? 0;
  const load = server.load ?? 0;
  switch (key) {
    case 'ping':
      return Math.max(8, Math.round(ping + (Math.random() * 6 - 3)));
    case 'jitter':
      return Math.max(1, Math.round(jitter + (Math.random() * 2 - 1)));
    case 'loss':
      return Math.max(0, +(packetLoss + Math.random() * 0.2).toFixed(1));
    case 'download':
      return Math.round(60 + Math.random() * 70 - load * 0.3);
    case 'upload':
      return Math.round(15 + Math.random() * 25 - load * 0.1);
    default:
      return 0;
  }
}

export default function SpeedTestScreen({ server, quality, onBack, onComplete }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({});
  const [done, setDone] = useState(false);
  const reportedRef = useRef(false);

  useEffect(() => {
    setPhaseIndex(0);
    setProgress(0);
    setResults({});
    setDone(false);
    reportedRef.current = false;
  }, [server.id]);

  useEffect(() => {
    if (done || phaseIndex >= PHASES.length) return;
    const phase = PHASES[phaseIndex];
    const tickMs = 40;
    const steps = phase.durationMs / tickMs;
    let step = 0;
    setProgress(0);

    const id = setInterval(() => {
      step += 1;
      setProgress(Math.min(100, Math.round((step / steps) * 100)));
      if (step >= steps) {
        clearInterval(id);
        const value = randomizeResult(phase.key, server);
        setResults((r) => ({ ...r, [phase.key]: value }));
        if (phaseIndex + 1 >= PHASES.length) {
          setDone(true);
        } else {
          setPhaseIndex((i) => i + 1);
        }
      }
    }, tickMs);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex, done]);

  useEffect(() => {
    if (done && !reportedRef.current) {
      reportedRef.current = true;
      onComplete?.(results);
    }
  }, [done, results, onComplete]);

  const rerun = () => {
    setPhaseIndex(0);
    setProgress(0);
    setResults({});
    setDone(false);
    reportedRef.current = false;
  };

  return (
    <View>
      <BackHeader title="Speed Test" onBack={onBack} />
      <View style={styles.container}>
        {!done ? (
          <View style={styles.testingCard}>
            <FontAwesome6 name={PHASES[phaseIndex].icon} iconStyle="solid" size={28} color={colors.orange} />
            <Text style={styles.testingLabel}>{PHASES[phaseIndex].label}…</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressPct}>{progress}%</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsGrid}>
              {PHASES.map((p) => (
                <View key={p.key} style={styles.resultCard}>
                  <FontAwesome6 name={p.icon} iconStyle="solid" size={14} color={colors.orange} />
                  <Text style={styles.resultValue}>
                    {results[p.key]}
                    <Text style={styles.resultUnit}> {p.unit}</Text>
                  </Text>
                  <Text style={styles.resultLabel}>{p.label.replace('Testing ', '')}</Text>
                </View>
              ))}
            </View>

            <View style={styles.doctorCard}>
              <Text style={styles.doctorTitle}>ROYAL NETWORK DOCTOR</Text>
              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>Latency</Text>
                <Text style={styles.doctorValue}>{results.ping} ms</Text>
              </View>
              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>Jitter</Text>
                <Text style={styles.doctorValue}>{results.jitter} ms</Text>
              </View>
              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>Packet Loss</Text>
                <Text style={styles.doctorValue}>{results.loss}%</Text>
              </View>
              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>VPN Quality</Text>
                <Text style={styles.doctorValue}>{quality.score}%</Text>
              </View>
              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>Server Load</Text>
                <Text style={styles.doctorValue}>{server.load}%</Text>
              </View>
              <View style={styles.doctorDivider} />
              <View style={styles.doctorStatusRow}>
                <Text style={styles.doctorStatusLabel}>STATUS</Text>
                <Text style={[styles.doctorStatusValue, { color: quality.color }]}>
                  {quality.label.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.doctorRecommendation}>
                {getNetworkRecommendation({
                  loss: results.loss,
                  jitter: results.jitter,
                  download: results.download,
                  qualityScore: quality.score,
                })}
              </Text>
            </View>

            <Pressable onPress={rerun} style={styles.rerunBtn}>
              <FontAwesome6 name="arrow-rotate-right" iconStyle="solid" size={14} color="#000" />
              <Text style={styles.rerunText}>Run Again</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  testingCard: {
    backgroundColor: colors.surface06,
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 14,
  },
  testingLabel: { fontFamily: font.semibold, fontSize: 15, color: '#fff' },
  progressTrack: { width: '80%', height: 8, borderRadius: 9999, backgroundColor: colors.surface08, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.orange, borderRadius: 9999 },
  progressPct: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  resultCard: {
    width: '47%',
    backgroundColor: colors.surface05,
    borderRadius: 14,
    padding: 16,
    alignItems: 'flex-start',
    gap: 6,
  },
  resultValue: { fontFamily: font.extrabold, fontSize: 20, color: '#fff' },
  resultUnit: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5 },
  resultLabel: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint6, textTransform: 'capitalize' },
  doctorCard: { backgroundColor: colors.surface05, borderRadius: 16, padding: 16, marginBottom: 16 },
  doctorTitle: { fontFamily: font.bold, fontSize: 11, color: colors.textFaint5, letterSpacing: 0.8, marginBottom: 12 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  doctorLabel: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint7 },
  doctorValue: { fontFamily: font.semibold, fontSize: 13, color: '#fff' },
  doctorDivider: { height: 1, backgroundColor: colors.surface08, marginVertical: 10 },
  doctorStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  doctorStatusLabel: { fontFamily: font.bold, fontSize: 12, color: colors.textFaint6, letterSpacing: 0.5 },
  doctorStatusValue: { fontFamily: font.extrabold, fontSize: 14, letterSpacing: 0.5 },
  doctorRecommendation: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint7, lineHeight: 17 },
  rerunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: 9999,
    paddingVertical: 12,
  },
  rerunText: { fontFamily: font.bold, fontSize: 14, color: '#000' },
});
