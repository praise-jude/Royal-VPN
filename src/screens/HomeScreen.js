import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors, font } from '../theme';

export default function HomeScreen({
  connected,
  connecting,
  server,
  durationStr,
  showStats,
  killSwitch,
  autoConnect,
  onConnectClick,
  onGoServers,
  onToggleKill,
  onToggleAuto,
}) {
  const connectBtnBg = connecting ? '#4B5563' : connected ? colors.blue : colors.orange;
  const connectLabel = connecting ? 'Connecting…' : connected ? 'PROTECTED' : 'CONNECT';
  const statusLine = connecting
    ? 'Securing your connection…'
    : connected
    ? 'Your connection is protected'
    : 'You are not protected';
  const statusDotColor = connected ? colors.green : connecting ? colors.yellow : colors.red;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome6 name="shield-halved" iconStyle="solid" size={20} color={colors.orange} />
        <Text style={styles.headerTitle}>ROYAL-VPN</Text>
      </View>

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

      {showStats && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>{durationStr}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PING</Text>
            <Text style={styles.statValue}>{server.ping} ms</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PROTOCOL</Text>
            <Text style={styles.statValue}>WireGuard</Text>
          </View>
        </View>
      )}

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
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 },
  headerTitle: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: 0.5, color: '#fff' },
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
