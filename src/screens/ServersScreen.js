import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import AiRouteBanner from '../components/AiRouteBanner';
import { colors, font } from '../theme';

function loadColor(load) {
  if (load > 55) return colors.red;
  if (load > 35) return colors.yellow;
  return colors.green;
}

export default function ServersScreen({ servers, selectedId, favorites, onSelect, onToggleFav, bestServer, onUseRecommended }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servers</Text>
      <Text style={styles.subtitle}>Choose the best gateway for you</Text>

      <View style={styles.searchBar}>
        <FontAwesome6 name="magnifying-glass" iconStyle="solid" size={13} color="rgba(255,255,255,0.4)" />
        <Text style={styles.searchPlaceholder}>Search country or city</Text>
      </View>

      {bestServer && bestServer.id !== selectedId && (
        <AiRouteBanner server={bestServer} onUse={() => onUseRecommended(bestServer.id)} />
      )}

      {servers.map((sv) => {
        const isSelected = sv.id === selectedId;
        const isFav = !!favorites[sv.id];
        return (
          <Pressable
            key={sv.id}
            onPress={() => onSelect(sv.id)}
            style={[
              styles.row,
              {
                backgroundColor: isSelected ? colors.selectedBg : colors.surface04,
                borderColor: isSelected ? colors.blue : 'transparent',
              },
            ]}
          >
            <View style={[styles.loadDot, { backgroundColor: loadColor(sv.load) }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.cityRow}>
                <Text style={styles.city}>{sv.city}</Text>
                {bestServer && sv.id === bestServer.id && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>BEST</Text>
                  </View>
                )}
              </View>
              <Text style={styles.meta}>
                {sv.country} · Load {sv.load}%
              </Text>
            </View>
            <Text style={styles.ping}>{sv.ping} ms</Text>
            <Pressable hitSlop={8} onPress={() => onToggleFav(sv.id)}>
              <FontAwesome6
                name="star"
                iconStyle={isFav ? 'solid' : 'regular'}
                size={15}
                color={isFav ? colors.orange : 'rgba(255,255,255,0.35)'}
              />
            </Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontFamily: font.extrabold, fontSize: 25, color: '#fff', marginBottom: 4 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, marginBottom: 18 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface06,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchPlaceholder: { fontFamily: font.regular, fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  loadDot: { width: 9, height: 9, borderRadius: 9999 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  city: { fontFamily: font.semibold, fontSize: 15, color: '#fff' },
  bestBadge: { backgroundColor: colors.orange, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  bestBadgeText: { fontFamily: font.bold, fontSize: 9, color: '#000', letterSpacing: 0.5 },
  meta: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  ping: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint6, marginRight: 4 },
});
