import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { vpnProtocols } from '../data';
import { colors, font } from '../theme';

export default function ProtocolSwitcher({ protocol, onChange }) {
  const active = vpnProtocols.find((p) => p.key === protocol) || vpnProtocols[0];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>VPN Protocol</Text>
      <View style={styles.segments}>
        {vpnProtocols.map((p) => {
          const isActive = p.key === protocol;
          return (
            <Pressable
              key={p.key}
              onPress={() => onChange(p.key)}
              style={[styles.segment, isActive && styles.segmentActive]}
            >
              <FontAwesome6
                name={p.icon}
                iconStyle="solid"
                size={12}
                color={isActive ? '#000' : colors.textFaint7}
              />
              <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.description}>{active.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface05, borderRadius: 14, padding: 14, marginBottom: 10 },
  title: { fontFamily: font.semibold, fontSize: 14, color: '#fff', marginBottom: 10 },
  segments: { flexDirection: 'row', backgroundColor: colors.surface06, borderRadius: 10, padding: 3, gap: 3 },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentActive: { backgroundColor: colors.orange },
  segmentLabel: { fontFamily: font.semibold, fontSize: 12, color: colors.textFaint7 },
  segmentLabelActive: { color: '#000' },
  description: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45, marginTop: 8, lineHeight: 15 },
});
