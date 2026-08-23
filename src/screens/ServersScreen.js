import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import AiRouteBanner from '../components/AiRouteBanner';
import { regions } from '../data';
import { colors, font } from '../theme';

function loadColor(load) {
  if (load > 55) return colors.red;
  if (load > 35) return colors.yellow;
  return colors.green;
}

export default function ServersScreen({
  servers,
  selectedId,
  favorites,
  onSelect,
  onToggleFav,
  bestServer,
  onUseRecommended,
  isPaid,
  onRequireUpgrade,
}) {
  const handleSelect = (sv) => {
    if (sv.vip && !isPaid) {
      onRequireUpgrade();
      return;
    }
    onSelect(sv.id);
  };

  const handleUseRecommended = () => {
    if (bestServer.vip && !isPaid) {
      onRequireUpgrade();
      return;
    }
    onUseRecommended(bestServer.id);
  };
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [region, setRegion] = useState('all');

  const regionCounts = useMemo(() => {
    const counts = {};
    servers.forEach((sv) => {
      counts[sv.region] = (counts[sv.region] || 0) + 1;
    });
    return counts;
  }, [servers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return servers.filter((sv) => {
      if (region !== 'all' && sv.region !== region) return false;
      if (favoritesOnly && !favorites[sv.id]) return false;
      if (!q) return true;
      return sv.city.toLowerCase().includes(q) || sv.country.toLowerCase().includes(q);
    });
  }, [servers, query, favoritesOnly, favorites, region]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servers</Text>
      <Text style={styles.subtitle}>Choose the best gateway for you</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <FontAwesome6 name="magnifying-glass" iconStyle="solid" size={13} color="rgba(255,255,255,0.4)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search country or city"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <FontAwesome6 name="circle-xmark" iconStyle="solid" size={14} color="rgba(255,255,255,0.4)" />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setFavoritesOnly((v) => !v)}
          style={[styles.favChip, favoritesOnly && styles.favChipActive]}
        >
          <FontAwesome6
            name="star"
            iconStyle={favoritesOnly ? 'solid' : 'regular'}
            size={14}
            color={favoritesOnly ? '#000' : colors.textFaint6}
          />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.regionRow}
      >
        {regions.map((r) => {
          const isActive = region === r.key;
          const count = r.key === 'all' ? servers.length : regionCounts[r.key] || 0;
          return (
            <Pressable
              key={r.key}
              onPress={() => setRegion(r.key)}
              style={[styles.regionChip, isActive && styles.regionChipActive]}
            >
              <FontAwesome6
                name={r.icon}
                iconStyle="solid"
                size={12}
                color={isActive ? '#000' : colors.textFaint7}
              />
              <Text style={[styles.regionChipText, isActive && styles.regionChipTextActive]}>
                {r.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {bestServer && bestServer.id !== selectedId && !query && !favoritesOnly && region === 'all' && (
        <AiRouteBanner server={bestServer} onUse={handleUseRecommended} />
      )}

      {filtered.length === 0 && (
        <Text style={styles.emptyText}>
          {favoritesOnly ? 'No favorite servers yet — tap the star on a server to save it.' : 'No servers match this filter.'}
        </Text>
      )}

      {filtered.map((sv) => {
        const isSelected = sv.id === selectedId;
        const isFav = !!favorites[sv.id];
        const isLocked = sv.vip && !isPaid;
        return (
          <Pressable
            key={sv.id}
            onPress={() => handleSelect(sv)}
            style={[
              styles.row,
              {
                backgroundColor: isSelected ? colors.selectedBg : colors.surface04,
                borderColor: isSelected ? colors.blue : 'transparent',
                opacity: isLocked ? 0.6 : 1,
              },
            ]}
          >
            <View style={[styles.loadDot, { backgroundColor: loadColor(sv.load) }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.cityRow}>
                <Text style={styles.city}>{sv.city}</Text>
                {isLocked ? (
                  <View style={styles.vipBadge}>
                    <FontAwesome6 name="crown" iconStyle="solid" size={8} color="#000" />
                    <Text style={styles.vipBadgeText}>VIP</Text>
                  </View>
                ) : (
                  bestServer &&
                  sv.id === bestServer.id && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>BEST</Text>
                    </View>
                  )
                )}
              </View>
              <Text style={styles.meta}>
                {sv.country} · Load {sv.load}%
              </Text>
            </View>
            {isLocked ? (
              <FontAwesome6 name="lock" iconStyle="solid" size={13} color={colors.textFaint45} style={{ marginRight: 4 }} />
            ) : (
              <Text style={styles.ping}>{sv.ping} ms</Text>
            )}
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface06,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontFamily: font.regular, fontSize: 14, color: '#fff', padding: 0 },
  favChip: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favChipActive: { backgroundColor: colors.orange },
  regionRow: { gap: 8, paddingBottom: 4, marginBottom: 14 },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface06,
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  regionChipActive: { backgroundColor: colors.orange },
  regionChipText: { fontFamily: font.semibold, fontSize: 12, color: colors.textFaint7 },
  regionChipTextActive: { color: '#000' },
  emptyText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textFaint5,
    textAlign: 'center',
    paddingVertical: 24,
  },
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
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.orange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  vipBadgeText: { fontFamily: font.bold, fontSize: 9, color: '#000', letterSpacing: 0.5 },
  meta: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  ping: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint6, marginRight: 4 },
});
