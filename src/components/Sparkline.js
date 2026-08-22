import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

function barColor(score) {
  if (score < 60) return colors.red;
  if (score < 80) return colors.yellow;
  return colors.green;
}

export default function Sparkline({ samples, height = 70 }) {
  if (samples.length === 0) {
    return <View style={[styles.wrap, { height }]} />;
  }
  return (
    <View style={[styles.wrap, { height }]}>
      {samples.map((s, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: Math.max(4, (s.score / 100) * height),
              backgroundColor: barColor(s.score),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { flex: 1, borderRadius: 2, minWidth: 2 },
});
