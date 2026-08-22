import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import ModeSwitcher from '../components/ModeSwitcher';
import QualityScore from '../components/QualityScore';
import { colors, font } from '../theme';

const NETWORK_META = {
  WIFI: { icon: 'wifi', label: 'Wi-Fi' },
  CELLULAR: { icon: 'signal', label: 'Mobile Data' },
  NONE: { icon: 'ban', label: 'Offline' },
  UNKNOWN: { icon: 'circle-question', label: 'Connected' },
};

export default function HomeScreen({
  connected,
  connecting,
  autoReconnecting,
  server,
  durationStr,
  showStats,
  killSwitch,
  autoConnect,
  mode,
  onModeChange,
  protocolLabel,
  quality,
  entryServer,
  networkType,
  protectBanner,
  onConnectClick,
  onGoServers,
  onOpenMultiHop,
  onOpenHistory,
  onOpenSpeedTest,
  onToggleKill,
  onToggleAuto,
}) {
  const isMultiHop = mode === 'privacy' && entryServer;
  const connectBtnBg = connecting ? '#4B5563' : connected ? colors.blue : colors.orange;
  const connectLabel = connecting ? 'Connecting…' : connected ? 'PROTECTED' : 'CONNECT';
  const statusLine = autoReconnecting
    ? 'Network changed — reconnecting…'
    : connecting
    ? 'Securing your connection…'
    : connected
    ? 'Your connection is protected'
    : 'You are not protected';
  const statusDotColor = autoReconnecting
    ? colors.yellow
    : connected
    ? colors.green
    : connecting
    ? colors.yellow
    : colors.red;
  const netMeta = NETWORK_META[networkType] || NETWORK_META.UNKNOWN;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FontAwesome6 name="shield-halved" iconStyle="solid" size={20} color={colors.orange} />
          <Text style={styles.headerTitle}>ROYAL-VPN</Text>
        </View>
        <View style={styles.networkBadge}>
          <FontAwesome6 name={netMeta.icon} iconStyle="solid" size={11} color={colors.textFaint6} />
          <Text style={styles.networkBadgeText}>{netMeta.label}</Text>
        </View>
      </View>

      {protectBanner ? (
        <View style={styles.protectBanner}>
          <FontAwesome6 name="shield-halved" iconStyle="solid" size={14} color={colors.orange} />
          <Text style={styles.protectBannerText}>{protectBanner}</Text>
        </View>
      ) : null}

      <View style={styles.connectWrap}>
        <Pressable
          onPress={onConnectClick}
          style={[styles.connectBtn, { backgroundColor: connectBtnBg }]}
        >
          <FontAwesome6 name="power-off" iconStyle="solid" size={38} color="#fff" />
          <Text style={styles.connectLabel}>{connectLabel}</Text>
        </Pressable>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
          <Text style={styles.statusLine}>{statusLine}</Text>
        </View>
      </View>

      {isMultiHop ? (
        <Pressable onPress={onOpenMultiHop} style={styles.serverRow}>
          <FontAwesome6 name="route" iconStyle="solid" size={19} color={colors.orange} style={styles.serverIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.serverCity}>
              {entryServer.city} → {server.city}
            </Text>
            <Text style={styles.serverHint}>Multi-hop route · Tap to configure</Text>
          </View>
          <FontAwesome6 name="chevron-right" iconStyle="solid" size={13} color="rgba(255,255,255,0.35)" />
        </Pressable>
      ) : (
        <Pressable onPress={onGoServers} style={styles.serverRow}>
          <FontAwesome6 name="globe" iconStyle="solid" size={19} color={colors.orange} style={styles.serverIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.serverCity}>
              {server.city}, {server.country}
            </Text>
            <Text style={styles.serverHint}>Tap to change server</Text>
          </View>
          <FontAwesome6 name="chevron-right" iconStyle="solid" size={13} color="rgba(255,255,255,0.35)" />
        </Pressable>
      )}

      {showStats && (
        <Pressable onPress={onOpenHistory}>
          <QualityScore score={quality.score} label={quality.label} color={quality.color} />
        </Pressable>
      )}

      {showStats && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>{durationStr}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PING</Text>
            <Text style={styles.statValue}>{isMultiHop ? entryServer.ping + server.ping : server.ping} ms</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PROTOCOL</Text>
            <Text style={styles.statValueSmall}>{protocolLabel}</Text>
          </View>
        </View>
      )}

      <ModeSwitcher mode={mode} onChange={onModeChange} />

      <Pressable onPress={onOpenSpeedTest} style={styles.speedTestBtn}>
        <FontAwesome6 name="gauge-high" iconStyle="solid" size={14} color={colors.orange} />
        <Text style={styles.speedTestText}>Run Speed Test</Text>
        <FontAwesome6 name="chevron-right" iconStyle="solid" size={12} color="rgba(255,255,255,0.3)" />
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable onPress={onToggleKill} style={styles.actionBtn}>
          <FontAwesome6 name="power-off" iconStyle="solid" size={12} color={colors.orange} />
          <Text style={styles.actionLabel}>Kill Switch{killSwitch ? ' · On' : ''}</Text>
        </Pressable>
        <Pressable onPress={onToggleAuto} style={styles.actionBtn}>
          <FontAwesome6 name="wifi" iconStyle="solid" size={12} color={colors.orange} />
          <Text style={styles.actionLabel}>Auto-Connect{autoConnect ? ' · On' : ''}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: 0.5, color: '#fff' },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface06,
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  networkBadgeText: { fontFamily: font.medium, fontSize: 11, color: colors.textFaint6 },
  protectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,147,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,147,0,0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  protectBannerText: { flex: 1, fontFamily: font.medium, fontSize: 12, color: '#fff' },
  speedTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface06,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  speedTestText: { flex: 1, fontFamily: font.semibold, fontSize: 13, color: '#fff' },
  connectWrap: { alignItems: 'center', marginVertical: 8, marginBottom: 30 },
  connectBtn: {
    width: 196,
    height: 196,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.55,
    shadowRadius: 50,
    elevation: 10,
  },
  connectLabel: { fontFamily: font.bold, fontSize: 14, color: '#fff', letterSpacing: 1, marginTop: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  statusDot: { width: 8, height: 8, borderRadius: 9999 },
  statusLine: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint7 },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface06,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  serverIcon: { width: 22, textAlign: 'center' },
  serverCity: { fontFamily: font.semibold, fontSize: 15, color: '#fff' },
  serverHint: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface06,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statLabel: { fontFamily: font.regular, fontSize: 10, color: colors.textFaint5, letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  statValueSmall: { fontFamily: font.bold, fontSize: 10.5, color: '#fff', textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface06,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionLabel: { fontFamily: font.semibold, fontSize: 12, color: '#fff' },
});
