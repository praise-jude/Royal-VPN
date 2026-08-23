import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import RmButton from '../components/RmButton';
import { colors, font } from '../theme';

export default function SettingsScreen({ userEmail, planLabel, unreadNotifCount, onOpenPlans, onOpenNotifications, onLogout }) {
  const menuItems = [
    { icon: 'bell', label: 'Notifications', onPress: onOpenNotifications, badge: unreadNotifCount },
    { icon: 'globe', label: 'Language', value: 'English' },
    { icon: 'headset', label: 'Royal Support' },
    { icon: 'lock', label: 'Privacy Center' },
  ];
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileEmail}>{userEmail}</Text>
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
        <RmButton variant="primary" size="sm" shape="pill" onPress={onOpenPlans}>
          Manage Subscription
        </RmButton>
      </LinearGradient>

      <View style={styles.menuCard}>
        {menuItems.map((item, i) => {
          const Row = item.onPress ? Pressable : View;
          return (
            <Row
              key={item.label}
              onPress={item.onPress}
              style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
            >
              <FontAwesome6 name={item.icon} iconStyle="solid" size={16} color={colors.orange} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {!!item.badge && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
              <FontAwesome6 name="chevron-right" iconStyle="solid" size={13} color="rgba(255,255,255,0.3)" />
            </Row>
          );
        })}
      </View>

      <RmButton variant="secondary" size="md" shape="lg" style={{ width: '100%' }} onPress={onLogout}>
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
  profileEmail: { fontFamily: font.bold, fontSize: 15, color: '#fff' },
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
  menuBadge: {
    backgroundColor: colors.orange,
    minWidth: 18,
    height: 18,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginRight: 8,
  },
  menuBadgeText: { fontFamily: font.bold, fontSize: 10, color: '#000' },
  version: { textAlign: 'center', fontFamily: font.regular, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 16 },
});
