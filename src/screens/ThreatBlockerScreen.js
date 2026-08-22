import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import BackHeader from '../components/BackHeader';
import Toggle from '../components/Toggle';
import { threatCategories } from '../data';
import { colors, font } from '../theme';
import { formatRelativeTime } from '../utils';

export default function ThreatBlockerScreen({ on, counts, total, recentBlocks, onToggle, onBack }) {
  return (
    <View>
      <BackHeader title="Threat Blocker" onBack={onBack} />
      <View style={styles.container}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Block ads, trackers &amp; malware</Text>
            <Text style={styles.toggleSubtitle}>Filters requests before they leave your device</Text>
          </View>
          <Toggle value={on} onToggle={onToggle} />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalNumber}>{total.toLocaleString()}</Text>
          <Text style={styles.totalLabel}>Threats blocked today</Text>
        </View>

        <View style={styles.grid}>
          {threatCategories.map((cat) => (
            <View key={cat.key} style={styles.gridCard}>
              <View style={[styles.gridIcon, { backgroundColor: cat.color + '26' }]}>
                <FontAwesome6 name={cat.icon} iconStyle="solid" size={14} color={cat.color} />
              </View>
              <Text style={styles.gridCount}>{counts[cat.key].toLocaleString()}</Text>
              <Text style={styles.gridLabel}>{cat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recently Blocked</Text>
        <View style={styles.card}>
          {recentBlocks.length === 0 ? (
            <Text style={styles.emptyText}>No activity yet</Text>
          ) : (
            recentBlocks.slice(0, 12).map((b, i) => {
              const cat = threatCategories.find((c) => c.key === b.category);
              return (
                <View key={b.id} style={[styles.row, i < Math.min(recentBlocks.length, 12) - 1 && styles.rowBorder]}>
                  <FontAwesome6 name={cat.icon} iconStyle="solid" size={13} color={cat.color} style={styles.rowIcon} />
                  <Text style={styles.domain} numberOfLines={1}>
                    {b.domain}
                  </Text>
                  <Text style={styles.time}>{formatRelativeTime(b.time)}</Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface05,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  toggleTitle: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  toggleSubtitle: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45, marginTop: 2 },
  totalCard: {
    backgroundColor: colors.surface06,
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalNumber: { fontFamily: font.extrabold, fontSize: 36, color: colors.orange },
  totalLabel: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint6, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  gridCard: {
    width: '47%',
    backgroundColor: colors.surface05,
    borderRadius: 14,
    padding: 14,
  },
  gridIcon: { width: 30, height: 30, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  gridCount: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
  gridLabel: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint6, marginTop: 2 },
  sectionTitle: { fontFamily: font.bold, fontSize: 15, color: '#fff', marginBottom: 10 },
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  emptyText: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  rowIcon: { width: 16, textAlign: 'center' },
  domain: { flex: 1, fontFamily: font.medium, fontSize: 12.5, color: '#fff' },
  time: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45 },
});
