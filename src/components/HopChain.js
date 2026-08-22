import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors, font } from '../theme';

function Node({ icon, label, sublabel, highlight }) {
  return (
    <View style={styles.node}>
      <View style={[styles.nodeCircle, highlight && styles.nodeCircleHighlight]}>
        <FontAwesome6 name={icon} iconStyle="solid" size={14} color={highlight ? '#000' : '#fff'} />
      </View>
      <Text style={styles.nodeLabel} numberOfLines={1}>
        {label}
      </Text>
      {sublabel ? <Text style={styles.nodeSublabel}>{sublabel}</Text> : null}
    </View>
  );
}

export default function HopChain({ entry, exit }) {
  return (
    <View style={styles.row}>
      <Node icon="user" label="You" />
      <FontAwesome6 name="chevron-right" iconStyle="solid" size={11} color={colors.textFaint45} />
      <Node icon="door-open" label={entry.city} sublabel={`${entry.ping} ms`} highlight />
      <FontAwesome6 name="chevron-right" iconStyle="solid" size={11} color={colors.textFaint45} />
      <Node icon="door-closed" label={exit.city} sublabel={`${exit.ping} ms`} highlight />
      <FontAwesome6 name="chevron-right" iconStyle="solid" size={11} color={colors.textFaint45} />
      <Node icon="globe" label="Internet" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 4 },
  node: { alignItems: 'center', width: 62 },
  nodeCircle: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.surface08,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  nodeCircleHighlight: { backgroundColor: colors.orange },
  nodeLabel: { fontFamily: font.semibold, fontSize: 11, color: '#fff', textAlign: 'center' },
  nodeSublabel: { fontFamily: font.regular, fontSize: 9.5, color: colors.textFaint5, marginTop: 1 },
});
