import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from '../components/Pressable';
import BackHeader from '../components/BackHeader';
import { colors, font } from '../theme';
import { formatRelativeTime } from '../utils';
import { checkReachability } from '../trustedServices';

export default function TradingConnectionTestScreen({ services, vpnServerLabel, protocolLabel, onBack }) {
  const [results, setResults] = useState({});

  const runTests = useCallback(() => {
    services
      .filter((s) => s.enabled)
      .forEach((service) => {
        setResults((r) => ({ ...r, [service.id]: { ok: false, latencyMs: null, checkedAt: Date.now(), testing: true } }));
        checkReachability(service.domain).then((result) => {
          setResults((r) => ({ ...r, [service.id]: { ...result, testing: false } }));
        });
      });
  }, [services]);

  useEffect(() => {
    runTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enabledServices = services.filter((s) => s.enabled);

  return (
    <View>
      <BackHeader title="Trading Connection Test" onBack={onBack} />
      <View style={styles.container}>
        <View style={styles.routeCard}>
          <Text style={styles.routeText}>
            Route: <Text style={styles.routeStrong}>{vpnServerLabel}</Text> · {protocolLabel}
          </Text>
        </View>

        <View style={styles.infoBanner}>
          <FontAwesome6 name="circle-info" iconStyle="solid" size={13} color="rgba(255,255,255,0.6)" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Some sites limit this kind of background check as their own security measure. If a service shows Unreachable here
            but opens fine when you visit it directly, that&apos;s the likely reason — not a sign Royal-VPN is blocking it.
          </Text>
        </View>

        {enabledServices.length === 0 && <Text style={styles.emptyText}>No trusted services are enabled to test.</Text>}

        <View style={{ gap: 10, marginBottom: 20 }}>
          {enabledServices.map((service) => {
            const result = results[service.id];
            const status = !result || result.testing ? 'testing' : result.ok ? 'ok' : 'fail';
            return (
              <View key={service.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{service.name}</Text>
                  {status === 'testing' ? (
                    <Text style={styles.testingText}>Testing…</Text>
                  ) : status === 'ok' ? (
                    <View style={styles.statusRow}>
                      <FontAwesome6 name="circle-check" iconStyle="solid" size={13} color={colors.green} />
                      <Text style={styles.okText}>Reachable</Text>
                    </View>
                  ) : (
                    <View style={styles.statusRow}>
                      <FontAwesome6 name="circle-xmark" iconStyle="solid" size={13} color={colors.red} />
                      <Text style={styles.failText}>Unreachable</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.resultDomain}>{service.domain}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Latency: <Text style={styles.metaStrong}>{result?.latencyMs != null ? `${result.latencyMs} ms` : '—'}</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    Last tested: <Text style={styles.metaStrong}>{result ? formatRelativeTime(result.checkedAt) : '—'}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable onPress={runTests} style={styles.rerunBtn}>
          <FontAwesome6 name="arrow-rotate-right" iconStyle="solid" size={13} color="#000" />
          <Text style={styles.rerunText}>Run Test Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 24 },
  routeCard: { backgroundColor: colors.surface06, borderRadius: 16, padding: 14, marginBottom: 12 },
  routeText: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint6 },
  routeStrong: { fontFamily: font.medium, color: '#fff' },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.surface06, borderRadius: 16, padding: 14, marginBottom: 16 },
  infoIcon: { marginTop: 2 },
  infoText: { flex: 1, fontFamily: font.regular, fontSize: 11, color: colors.textFaint6, lineHeight: 16 },
  emptyText: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, textAlign: 'center', paddingVertical: 24 },
  resultCard: { backgroundColor: colors.surface05, borderRadius: 16, padding: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  resultName: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  testingText: { fontFamily: font.semibold, fontSize: 12, color: colors.textFaint5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  okText: { fontFamily: font.semibold, fontSize: 12, color: colors.green },
  failText: { fontFamily: font.semibold, fontSize: 12, color: colors.red },
  resultDomain: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint45, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaText: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45 },
  metaStrong: { fontFamily: font.medium, color: colors.textFaint7 },
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
