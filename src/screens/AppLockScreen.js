import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors, font } from '../theme';

export default function AppLockScreen({ onUnlock, error }) {
  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <FontAwesome6 name="shield-halved" iconStyle="solid" size={36} color={colors.orange} />
      </View>
      <Text style={styles.title}>Royal-VPN Locked</Text>
      <Text style={styles.subtitle}>Authenticate to continue</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={onUnlock} style={styles.unlockBtn}>
        <FontAwesome6 name="fingerprint" iconStyle="solid" size={16} color="#000" />
        <Text style={styles.unlockText}>Unlock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 9999,
    backgroundColor: colors.surface08,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontFamily: font.extrabold, fontSize: 20, color: '#fff', marginBottom: 6 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint6, marginBottom: 28 },
  error: { fontFamily: font.regular, fontSize: 12, color: colors.red, marginBottom: 16, textAlign: 'center' },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.orange,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  unlockText: { fontFamily: font.bold, fontSize: 15, color: '#000' },
});
