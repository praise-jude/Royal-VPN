import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from '../components/Pressable';
import BackHeader from '../components/BackHeader';
import HopChain from '../components/HopChain';
import { connectionModes } from '../data';
import { computeMultiHopQuality } from '../utils';
import { colors, font } from '../theme';

function ServerPicker({ title, servers, selectedId, excludeId, onSelect }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {servers
          .filter((sv) => sv.id !== excludeId)
          .map((sv, i, arr) => {
            const isSelected = sv.id === selectedId;
            return (
              <Pressable
                key={sv.id}
                onPress={() => onSelect(sv.id)}
                style={[
                  styles.row,
                  i < arr.length - 1 && styles.rowBorder,
                  isSelected && styles.rowSelected,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.city}>{sv.city}</Text>
                  <Text style={styles.meta}>
                    {sv.country} · {sv.ping} ms
                  </Text>
                </View>
                {isSelected && <View style={styles.selectedDot} />}
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}

export default function MultiHopScreen({ servers, entryId, exitId, onSelectEntry, onSelectExit, onBack }) {
  const tradeoff = connectionModes.find((m) => m.key === 'privacy').tradeoff;

  if (servers.length < 2) {
    return (
      <View>
        <BackHeader title="Multi-Hop Route" onBack={onBack} />
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <FontAwesome6 name="route" iconStyle="solid" size={28} color={colors.textFaint45} />
            <Text style={styles.emptyTitle}>Multi-Hop is coming soon</Text>
            <Text style={styles.emptyText}>
              Routing through two servers needs at least two live locations. Only{' '}
              {servers.length} is live right now — more real servers are on the way.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const entry = servers.find((s) => s.id === entryId) || servers[0];
  const exit = servers.find((s) => s.id === exitId && s.id !== entry.id) || servers.find((s) => s.id !== entry.id);
  const quality = computeMultiHopQuality(entry, exit);

  return (
    <View>
      <BackHeader title="Multi-Hop Route" onBack={onBack} />
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Route your traffic through two servers so no single point knows both who you are and what you visit.
        </Text>

        <View style={styles.chainCard}>
          <HopChain entry={entry} exit={exit} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>COMBINED PING</Text>
            <Text style={styles.statValue}>{entry.ping + exit.ping} ms</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>QUALITY</Text>
            <Text style={[styles.statValue, { color: quality.color }]}>
              {quality.score}% · {quality.label}
            </Text>
          </View>
        </View>

        <View style={styles.tradeoffRow}>
          <View style={styles.tradeoffItem}>
            <Text style={styles.tradeoffLabel}>PRIVACY</Text>
            <Text style={styles.tradeoffValue}>{tradeoff.privacy}</Text>
          </View>
          <View style={styles.tradeoffDivider} />
          <View style={styles.tradeoffItem}>
            <Text style={styles.tradeoffLabel}>SPEED</Text>
            <Text style={styles.tradeoffValue}>{tradeoff.speed}</Text>
          </View>
          <View style={styles.tradeoffDivider} />
          <View style={styles.tradeoffItem}>
            <Text style={styles.tradeoffLabel}>LATENCY</Text>
            <Text style={styles.tradeoffValue}>{tradeoff.latency}</Text>
          </View>
        </View>

        <ServerPicker
          title="ENTRY SERVER"
          servers={servers}
          selectedId={entryId}
          excludeId={exitId}
          onSelect={onSelectEntry}
        />
        <ServerPicker
          title="EXIT SERVER"
          servers={servers}
          selectedId={exitId}
          excludeId={entryId}
          onSelect={onSelectExit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, color: '#fff' },
  emptyText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textFaint5,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, lineHeight: 19, marginBottom: 18 },
  chainCard: { backgroundColor: colors.surface06, borderRadius: 16, padding: 16, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  statCard: { flex: 1, backgroundColor: colors.surface05, borderRadius: 14, padding: 14, alignItems: 'center' },
  statLabel: { fontFamily: font.regular, fontSize: 10, color: colors.textFaint5, letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  tradeoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface06,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 22,
  },
  tradeoffItem: { flex: 1, alignItems: 'center' },
  tradeoffDivider: { width: 1, height: 20, backgroundColor: colors.surface08 },
  tradeoffLabel: {
    fontFamily: font.regular,
    fontSize: 8.5,
    color: colors.textFaint45,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tradeoffValue: { fontFamily: font.bold, fontSize: 10.5, color: '#fff' },
  sectionTitle: { fontFamily: font.bold, fontSize: 12, color: colors.textFaint6, letterSpacing: 0.5, marginBottom: 8 },
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  rowSelected: { backgroundColor: colors.selectedBg },
  city: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  meta: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  selectedDot: { width: 9, height: 9, borderRadius: 9999, backgroundColor: colors.orange },
});
