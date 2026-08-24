import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors, font } from '../theme';

const ICONS = { protected: 'circle-check', unprotected: 'circle-xmark', unsupported: 'minus' };
const COLORS = { protected: colors.green, unprotected: colors.red, unsupported: colors.textFaint45 };

const BANNER_STYLES = {
  warning: { bg: 'rgba(239,68,68,0.12)', color: colors.red, icon: 'triangle-exclamation', title: 'SECURITY WARNING' },
  protected: { bg: 'rgba(34,197,94,0.12)', color: colors.green, icon: 'circle-check', title: 'All systems protected' },
  unavailable: {
    bg: colors.surface06,
    color: colors.textFaint7,
    icon: 'circle-info',
    title: 'Real protection requires the Android app',
  },
};

export default function SecurityCheck({ checks }) {
  // "unsupported" means the platform/feature genuinely can't verify this
  // yet -- it's an honest disclosure, not an active problem, so it never
  // triggers the warning banner on its own.
  const hasUnprotected = checks.some((c) => c.status === 'unprotected');
  const hasProtected = checks.some((c) => c.status === 'protected');
  const bannerKey = hasUnprotected ? 'warning' : hasProtected ? 'protected' : 'unavailable';
  const banner = BANNER_STYLES[bannerKey];

  return (
    <View style={styles.card}>
      <View style={[styles.banner, { backgroundColor: banner.bg }]}>
        <FontAwesome6 name={banner.icon} iconStyle="solid" size={16} color={banner.color} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerText, { color: banner.color }]}>{banner.title}</Text>
          {bannerKey === 'warning' && (
            <Text style={styles.bannerSubtext}>
              Your connection may not be fully protected. Royal-VPN has restricted protected traffic until the
              problem is resolved.
            </Text>
          )}
          {bannerKey === 'unavailable' && (
            <Text style={styles.bannerSubtext}>
              A website can't establish a real system-level VPN tunnel — install the Android app for genuine
              protection.
            </Text>
          )}
        </View>
      </View>

      {checks.map((c, i) => (
        <View key={c.label} style={[styles.row, i < checks.length - 1 && styles.rowBorder]}>
          <Text style={[styles.label, c.status === 'unsupported' && styles.labelUnsupported]}>
            {c.label}
            {c.status === 'unsupported' ? ' · Not yet supported' : ''}
          </Text>
          <FontAwesome6 name={ICONS[c.status]} iconStyle="solid" size={16} color={COLORS[c.status]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden', marginBottom: 18 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 },
  bannerText: { fontFamily: font.bold, fontSize: 13 },
  bannerSubtext: { fontFamily: font.regular, fontSize: 11.5, color: colors.textFaint7, marginTop: 4, lineHeight: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  label: { fontFamily: font.medium, fontSize: 13.5, color: '#fff' },
  labelUnsupported: { color: colors.textFaint5 },
});
