import { View, Text, StyleSheet } from 'react-native';
import { colors, font } from '../theme';

export default function QualityScore({ score, label, color }) {
  return (
    <View style={styles.card}>
      <View style={styles.ring}>
        <View style={[styles.ringFill, { borderColor: color }]}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Connection Quality</Text>
        <Text style={[styles.status, { color }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface06,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  ring: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  ringFill: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: { fontFamily: font.bold, fontSize: 14 },
  title: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  status: { fontFamily: font.regular, fontSize: 12, marginTop: 2 },
});
