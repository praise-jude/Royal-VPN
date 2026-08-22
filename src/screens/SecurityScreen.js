import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Toggle from '../components/Toggle';
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

export default function SecurityScreen({ killSwitch, autoConnect, twoFA, onToggleKill, onToggleAuto, onToggle2FA }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Center</Text>
      <Text style={styles.subtitle}>Your protection status at a glance</Text>

      <View style={styles.dnsCard}>
        <FontAwesome6 name="circle-check" iconStyle="solid" size={20} color={colors.green} />
        <View>
          <Text style={styles.dnsTitle}>DNS Leak Protection</Text>
          <Text style={styles.dnsSubtitle}>IPv4 protected · IPv6 protected · No leak detected</Text>
        </View>
      </View>

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

      <Pressable style={[styles.row, { marginBottom: 0 }]}>
        <View style={styles.rowLeft}>
          <FontAwesome6 name="route" iconStyle="solid" size={16} color={colors.orange} style={styles.rowIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Trusted Networks</Text>
            <Text style={styles.rowSubtitle}>2 networks configured</Text>
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
  dnsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  dnsTitle: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  dnsSubtitle: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint6, marginTop: 2 },
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
});
