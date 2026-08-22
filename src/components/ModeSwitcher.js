import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { connectionModes } from '../data';
import { colors, font } from '../theme';

export default function ModeSwitcher({ mode, onChange }) {
  const active = connectionModes.find((m) => m.key === mode) || connectionModes[1];

  return (
    <View style={styles.wrap}>
      <View style={styles.segments}>
        {connectionModes.map((m) => {
          const isActive = m.key === mode;
          return (
            <Pressable
              key={m.key}
              onPress={() => onChange(m.key)}
              style={[styles.segment, isActive && styles.segmentActive]}
            >
              <FontAwesome6
                name={m.icon}
                iconStyle="solid"
                size={12}
                color={isActive ? '#000' : colors.textFaint7}
              />
              <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.tagline}>{active.tagline}</Text>
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
  segmentLabel: { fontFamily: font.semibold, fontSize: 11.5, color: colors.textFaint7 },
  segmentLabelActive: { color: '#000' },
  tagline: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textFaint5,
    textAlign: 'center',
    marginTop: 8,
  },
});
