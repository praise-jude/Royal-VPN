import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import RmButton from '../components/RmButton';
import { colors, font } from '../theme';

const MENU_ITEMS = [
  { icon: 'bell', label: 'Notifications' },
  { icon: 'globe', label: 'Language', value: 'English' },
  { icon: 'headset', label: 'Royal Support' },
  { icon: 'lock', label: 'Privacy Center' },
];

export default function SettingsScreen({ planLabel }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>Ada Okafor</Text>
          <Text style={styles.profileEmail}>ada.okafor@email.com</Text>
        </View>
        <FontAwesome6 name="chevron-right" iconStyle="solid" size={14} color="rgba(255,255,255,0.3)" />
      </View>

      <LinearGradient
        colors={[colors.blue, colors.orange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planCard}
      >
        <View style={styles.planHeader}>
          <FontAwesome6 name="crown" iconStyle="solid" size={14} color="#fff" />
          <Text style={styles.planLabel}>{planLabel}</Text>
        </View>
        <Text style={styles.planMeta}>Renews Sep 18, 2026 · All locations · 5 devices</Text>
        <RmButton variant="primary" size="sm" shape="pill">
          Manage Subscription
        </RmButton>
      </LinearGradient>

      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <View
            key={item.label}
            style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
          >
            <FontAwesome6 name={item.icon} iconStyle="solid" size={16} color={colors.orange} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
            <FontAwesome6 name="chevron-right" iconStyle="solid" size={13} color="rgba(255,255,255,0.3)" />
          </View>
        ))}
      </View>

      <RmButton variant="secondary" size="md" shape="lg" style={{ width: '100%' }}>
        Log Out
      </RmButton>

      <Text style={styles.version}>Royal-VPN v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontFamily: font.extrabold, fontSize: 25, color: '#fff', marginBottom: 18 },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface05,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 9999,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.bold, fontSize: 18, color: '#000' },
  profileName: { fontFamily: font.bold, fontSize: 15, color: '#fff' },
  profileEmail: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  planCard: { borderRadius: 16, padding: 18, marginBottom: 14 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  planLabel: { fontFamily: font.bold, fontSize: 13, color: '#fff', letterSpacing: 0.5 },
  planMeta: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 14 },
  menuCard: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  menuIcon: { width: 20, textAlign: 'center' },
  menuLabel: { flex: 1, fontFamily: font.medium, fontSize: 14, color: '#fff' },
  menuValue: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.45)', marginRight: 4 },
  version: { textAlign: 'center', fontFamily: font.regular, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 16 },
});
