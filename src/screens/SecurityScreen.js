import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Toggle from '../components/Toggle';
import SecurityCheck from '../components/SecurityCheck';
import { colors, font } from '../theme';

function Row({ icon, title, subtitle, right }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <FontAwesome6 name={icon} iconStyle="solid" size={16} color={colors.orange} style={styles.rowIcon} />
        <View>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {right}
    </View>
  );
}

export default function SecurityScreen({
  connected,
  killSwitch,
  autoConnect,
  twoFA,
  threatBlockerOn,
  threatsBlockedToday,
  appLockEnabled,
  appLockSupported,
  onToggleKill,
  onToggleAuto,
  onToggle2FA,
  onToggleAppLock,
  trustedNetworksCount,
  onOpenSplitTunnel,
  onOpenThreatBlocker,
  onOpenTrustedNetworks,
}) {
  const checks = [
    { label: 'IP protected', pass: connected },
    { label: 'DNS protected', pass: connected },
    { label: 'IPv6 protected', pass: connected },
    { label: 'WebRTC protected', pass: connected },
    { label: 'Kill switch active', pass: killSwitch },
    { label: 'VPN encryption active', pass: connected },
    { label: 'Secure DNS active', pass: connected },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Center</Text>
      <Text style={styles.subtitle}>Your protection status at a glance</Text>

      <SecurityCheck checks={checks} />

      <Pressable style={styles.row} onPress={onOpenThreatBlocker}>
        <View style={styles.rowLeft}>
          <FontAwesome6 name="bug-slash" iconStyle="solid" size={16} color={colors.orange} style={styles.rowIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Threat Blocker</Text>
            <Text style={styles.rowSubtitle}>
              {threatBlockerOn ? `${threatsBlockedToday.toLocaleString()} blocked today` : 'Off'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusDot, { backgroundColor: threatBlockerOn ? colors.green : colors.textFaint45 }]} />
        <FontAwesome6 name="chevron-right" iconStyle="solid" size={13} color="rgba(255,255,255,0.3)" />
      </Pressable>

      <Row
        icon="power-off"
        title="Kill Switch"
        subtitle="Block traffic if VPN drops"
        right={<Toggle value={killSwitch} onToggle={onToggleKill} />}
      />
      <Row
        icon="wifi"
        title="Auto-Connect"
        subtitle="On public & untrusted Wi-Fi"
        right={<Toggle value={autoConnect} onToggle={onToggleAuto} />}
      />
      <Row
        icon="lock"
        title="Two-Factor Authentication"
        subtitle="Extra layer on account login"
        right={<Toggle value={twoFA} onToggle={onToggle2FA} />}
      />
      <Row
        icon="fingerprint"
        title="App Lock"
        subtitle={appLockSupported ? 'Require Face ID / fingerprint to open' : 'Not available on this device'}
        right={appLockSupported ? <Toggle value={appLockEnabled} onToggle={onToggleAppLock} /> : null}
      />

      <Pressable style={styles.row} onPress={onOpenSplitTunnel}>
        <View style={styles.rowLeft}>
          <FontAwesome6 name="shuffle" iconStyle="solid" size={16} color={colors.orange} style={styles.rowIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Smart Split Tunnel</Text>
            <Text style={styles.rowSubtitle}>Choose which apps use the VPN</Text>
          </View>
        </View>
        <FontAwesome6 name="chevron-right" iconStyle="solid" size={13} color="rgba(255,255,255,0.3)" />
      </Pressable>

      <Pressable style={[styles.row, { marginBottom: 0 }]} onPress={onOpenTrustedNetworks}>
        <View style={styles.rowLeft}>
          <FontAwesome6 name="route" iconStyle="solid" size={16} color={colors.orange} style={styles.rowIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Trusted Networks</Text>
            <Text style={styles.rowSubtitle}>
              {trustedNetworksCount} network{trustedNetworksCount === 1 ? '' : 's'} configured
            </Text>
          </View>
        </View>
        <FontAwesome6 name="chevron-right" iconStyle="solid" size={13} color="rgba(255,255,255,0.3)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontFamily: font.extrabold, fontSize: 25, color: '#fff', marginBottom: 4 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, marginBottom: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface05,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIcon: { width: 20, textAlign: 'center' },
  rowTitle: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  rowSubtitle: { fontFamily: font.regular, fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 9999, marginRight: 10 },
});
