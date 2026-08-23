import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { tabsDef } from '../data';
import { colors, font } from '../theme';

export default function Sidebar({ activeTab, onChange, userEmail, planLabel, connected }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <FontAwesome6 name="shield-halved" iconStyle="solid" size={22} color={colors.orange} />
        <Text style={styles.brandText}>ROYAL-VPN</Text>
      </View>

      <View style={styles.nav}>
        {tabsDef.map((t) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <FontAwesome6
                name={t.icon}
                iconStyle="solid"
                size={16}
                color={active ? '#000' : colors.textFaint7}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={[styles.statusDot, { backgroundColor: connected ? colors.green : colors.red }]} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.footerEmail} numberOfLines={1}>
            {userEmail}
          </Text>
          <Text style={styles.footerPlan}>{planLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: colors.surface04,
    borderRightWidth: 1,
    borderRightColor: colors.surface08,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 28 },
  brandText: { fontFamily: font.extrabold, fontSize: 16, color: '#fff', letterSpacing: 0.5 },
  nav: { gap: 4, flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: { backgroundColor: colors.orange },
  navIcon: { width: 18, textAlign: 'center' },
  navLabel: { fontFamily: font.semibold, fontSize: 14, color: colors.textFaint7 },
  navLabelActive: { color: '#000' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surface08,
  },
  statusDot: { width: 9, height: 9, borderRadius: 9999 },
  footerEmail: { fontFamily: font.semibold, fontSize: 12, color: '#fff' },
  footerPlan: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint5, marginTop: 1 },
});
