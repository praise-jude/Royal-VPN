import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors, font } from '../theme';

export default function SecurityCheck({ checks }) {
  const allPass = checks.every((c) => c.pass);

  return (
    <View style={styles.card}>
      <View style={[styles.banner, { backgroundColor: allPass ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }]}>
        <FontAwesome6
          name={allPass ? 'circle-check' : 'triangle-exclamation'}
          iconStyle="solid"
          size={16}
          color={allPass ? colors.green : colors.red}
          style={{ marginTop: 1 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerText, { color: allPass ? colors.green : colors.red }]}>
            {allPass ? 'All systems protected' : 'SECURITY WARNING'}
          </Text>
          {!allPass && (
            <Text style={styles.bannerSubtext}>
              Your connection may not be fully protected. Royal-VPN has restricted protected traffic until the
              problem is resolved.
            </Text>
          )}
        </View>
      </View>

      {checks.map((c, i) => (
        <View key={c.label} style={[styles.row, i < checks.length - 1 && styles.rowBorder]}>
          <Text style={styles.label}>{c.label}</Text>
          <FontAwesome6
            name={c.pass ? 'circle-check' : 'circle-xmark'}
            iconStyle="solid"
            size={16}
            color={c.pass ? colors.green : colors.red}
          />
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
});
