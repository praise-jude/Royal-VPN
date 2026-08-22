import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import BackHeader from '../components/BackHeader';
import { splitTunnelApps } from '../data';
import { colors, font } from '../theme';

export default function SplitTunnelScreen({ vpnApps, onToggleApp, onBack }) {
  return (
    <View>
      <BackHeader title="Smart Split Tunnel" onBack={onBack} />
      <View style={styles.container}>
        <Text style={styles.subtitle}>Choose which apps route through Royal-VPN and which connect directly.</Text>

        <View style={styles.card}>
          {splitTunnelApps.map((app, i) => {
            const onVpn = vpnApps[app.id] !== false;
            return (
              <View key={app.id} style={[styles.row, i < splitTunnelApps.length - 1 && styles.rowBorder]}>
                <FontAwesome6 name={app.icon} iconStyle="solid" size={16} color={colors.orange} style={styles.icon} />
                <Text style={styles.name}>{app.name}</Text>
                <Pressable onPress={() => onToggleApp(app.id)} style={styles.pillGroup}>
                  <View style={[styles.pill, onVpn && styles.pillActive]}>
                    <Text style={[styles.pillText, onVpn && styles.pillTextActive]}>VPN</Text>
                  </View>
                  <View style={[styles.pill, !onVpn && styles.pillActiveBlue]}>
                    <Text style={[styles.pillText, !onVpn && styles.pillTextActive]}>Direct</Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, marginBottom: 18, lineHeight: 19 },
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  icon: { width: 20, textAlign: 'center' },
  name: { flex: 1, fontFamily: font.medium, fontSize: 14, color: '#fff' },
  pillGroup: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 9999, padding: 2, gap: 2 },
  pill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 9999 },
  pillActive: { backgroundColor: colors.orange },
  pillActiveBlue: { backgroundColor: colors.blue },
  pillText: { fontFamily: font.semibold, fontSize: 10.5, color: colors.textFaint7 },
  pillTextActive: { color: '#fff' },
});
