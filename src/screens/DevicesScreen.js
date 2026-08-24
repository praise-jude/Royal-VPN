import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from '../components/Pressable';
import { colors, font } from '../theme';

export default function DevicesScreen({ devices, onSignOut }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Devices</Text>
      <Text style={styles.subtitle}>Manage where you're signed in</Text>

      {devices.map((d) => (
        <View key={d.id} style={styles.row}>
          <FontAwesome6 name="mobile-screen-button" iconStyle="solid" size={17} color={colors.blue} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{d.name}</Text>
            <Text style={styles.meta}>
              {d.platform} · {d.lastActive}
            </Text>
          </View>
          {d.current ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>THIS DEVICE</Text>
            </View>
          ) : (
            <Pressable onPress={() => onSignOut(d.id)} hitSlop={8}>
              <Text style={styles.signOut}>Sign Out</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontFamily: font.extrabold, fontSize: 25, color: '#fff', marginBottom: 4 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, marginBottom: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface05,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  icon: { width: 22, textAlign: 'center' },
  name: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  meta: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  currentBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  currentBadgeText: { fontFamily: font.bold, fontSize: 9, color: colors.green, letterSpacing: 0.5 },
  signOut: { fontFamily: font.semibold, fontSize: 12, color: colors.red, paddingVertical: 6, paddingHorizontal: 8 },
});
