import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from './Pressable';
import { connectionModes } from '../data';
import { colors, font } from '../theme';

export default function ModeSwitcher({ mode, onChange, disabledKeys = [] }) {
  const active = connectionModes.find((m) => m.key === mode) || connectionModes[1];
  const isActiveDisabled = disabledKeys.includes(active.key);

  return (
    <View style={styles.wrap}>
      <View style={styles.segments}>
        {connectionModes.map((m) => {
          const isActive = m.key === mode;
          const isDisabled = disabledKeys.includes(m.key);
          return (
            <Pressable
              key={m.key}
              onPress={() => !isDisabled && onChange(m.key)}
              style={[styles.segment, isActive && styles.segmentActive, isDisabled && styles.segmentDisabled]}
            >
              <FontAwesome6
                name={m.icon}
                iconStyle="solid"
                size={12}
                color={isActive ? '#000' : isDisabled ? colors.textFaint45 : colors.textFaint7}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  isActive && styles.segmentLabelActive,
                  isDisabled && styles.segmentLabelDisabled,
                ]}
              >
                {m.label}
              </Text>
              {isDisabled && <Text style={styles.segmentSoon}>SOON</Text>}
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.tagline}>
        {isActiveDisabled ? 'Requires 2+ live server locations — coming soon' : active.tagline}
      </Text>

      <View style={styles.tradeoffRow}>
        <View style={styles.tradeoffItem}>
          <Text style={styles.tradeoffLabel}>PRIVACY</Text>
          <Text style={styles.tradeoffValue}>{active.tradeoff.privacy}</Text>
        </View>
        <View style={styles.tradeoffDivider} />
        <View style={styles.tradeoffItem}>
          <Text style={styles.tradeoffLabel}>SPEED</Text>
          <Text style={styles.tradeoffValue}>{active.tradeoff.speed}</Text>
        </View>
        <View style={styles.tradeoffDivider} />
        <View style={styles.tradeoffItem}>
          <Text style={styles.tradeoffLabel}>LATENCY</Text>
          <Text style={styles.tradeoffValue}>{active.tradeoff.latency}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  segments: {
    flexDirection: 'row',
    backgroundColor: colors.surface06,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentActive: { backgroundColor: colors.orange },
  segmentDisabled: { opacity: 0.5 },
  segmentLabel: { fontFamily: font.semibold, fontSize: 11.5, color: colors.textFaint7 },
  segmentLabelActive: { color: '#000' },
  segmentLabelDisabled: { color: colors.textFaint45 },
  segmentSoon: {
    fontFamily: font.bold,
    fontSize: 7,
    color: colors.textFaint45,
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  tagline: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textFaint5,
    textAlign: 'center',
    marginTop: 8,
  },
  tradeoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface06,
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 10,
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
});
