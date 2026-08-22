import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors, font } from '../theme';

export default function AiRouteBanner({ server, onUse }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <FontAwesome6 name="wand-magic-sparkles" iconStyle="solid" size={16} color="#000" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Royal AI recommends {server.city}</Text>
        <Text style={styles.subtitle}>
          {server.quality.score}% connection quality · {server.quality.label}
        </Text>
      </View>
      <Pressable onPress={onUse} style={styles.useBtn}>
        <Text style={styles.useBtnText}>Use</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,147,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,147,0,0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: font.bold, fontSize: 13.5, color: '#fff' },
  subtitle: { fontFamily: font.regular, fontSize: 11.5, color: colors.textFaint6, marginTop: 2 },
  useBtn: { backgroundColor: colors.orange, borderRadius: 9999, paddingVertical: 7, paddingHorizontal: 14 },
  useBtnText: { fontFamily: font.bold, fontSize: 12, color: '#000' },
});
