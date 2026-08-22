import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import BackHeader from '../components/BackHeader';
import Sparkline from '../components/Sparkline';
import { formatRelativeTime } from '../utils';
import { colors, font } from '../theme';

export default function NetworkHistoryScreen({ quality, history, events, onBack }) {
  return (
    <View>
      <BackHeader title="Network Activity" onBack={onBack} />
      <View style={styles.container}>
        <View style={styles.currentCard}>
          <View>
            <Text style={styles.currentLabel}>Current quality</Text>
            <Text style={[styles.currentScore, { color: quality.color }]}>
              {quality.score}% · {quality.label}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>LAST {history.length} SAMPLES</Text>
        <View style={styles.chartCard}>
          <Sparkline samples={history} />
        </View>

        <Text style={styles.sectionTitle}>NETWORK EVENTS</Text>
        <View style={styles.card}>
          {events.length === 0 ? (
            <Text style={styles.emptyText}>No events yet</Text>
          ) : (
            events.slice(0, 30).map((e, i) => (
              <View key={e.id} style={[styles.row, i < Math.min(events.length, 30) - 1 && styles.rowBorder]}>
                <FontAwesome6 name={e.icon} iconStyle="solid" size={14} color={e.color} style={styles.rowIcon} />
                <Text style={styles.rowLabel} numberOfLines={2}>
                  {e.label}
                </Text>
                <Text style={styles.rowTime}>{formatRelativeTime(e.time)}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  currentCard: { backgroundColor: colors.surface06, borderRadius: 16, padding: 16, marginBottom: 20 },
  currentLabel: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginBottom: 4 },
  currentScore: { fontFamily: font.extrabold, fontSize: 20 },
  sectionTitle: { fontFamily: font.bold, fontSize: 11, color: colors.textFaint5, letterSpacing: 0.5, marginBottom: 8 },
  chartCard: { backgroundColor: colors.surface05, borderRadius: 16, padding: 16, marginBottom: 20 },
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  emptyText: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  rowIcon: { width: 16, textAlign: 'center', marginTop: 2 },
  rowLabel: { flex: 1, fontFamily: font.medium, fontSize: 12.5, color: '#fff', lineHeight: 17 },
  rowTime: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45, marginTop: 1 },
});
