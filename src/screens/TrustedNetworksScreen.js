import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import BackHeader from '../components/BackHeader';
import { colors, font } from '../theme';

export default function TrustedNetworksScreen({ networks, onAdd, onRemove, onBack }) {
  return (
    <View>
      <BackHeader title="Trusted Networks" onBack={onBack} />
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Royal-VPN won't nag you to connect while you're on a network you trust.
        </Text>

        {networks.length === 0 ? (
          <Text style={styles.emptyText}>No trusted networks yet.</Text>
        ) : (
          <View style={styles.card}>
            {networks.map((n, i) => (
              <View key={n.id} style={[styles.row, i < networks.length - 1 && styles.rowBorder]}>
                <FontAwesome6 name="wifi" iconStyle="solid" size={16} color={colors.orange} style={styles.rowIcon} />
                <Text style={styles.name}>{n.name}</Text>
                <Pressable onPress={() => onRemove(n.id)} hitSlop={8}>
                  <FontAwesome6 name="trash" iconStyle="solid" size={14} color={colors.red} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable onPress={onAdd} style={styles.addBtn}>
          <FontAwesome6 name="plus" iconStyle="solid" size={13} color="#000" />
          <Text style={styles.addBtnText}>Add Current Network</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, lineHeight: 19, marginBottom: 18 },
  emptyText: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, marginBottom: 18 },
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden', marginBottom: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  rowIcon: { width: 20, textAlign: 'center' },
  name: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: 9999,
    paddingVertical: 12,
  },
  addBtnText: { fontFamily: font.bold, fontSize: 14, color: '#000' },
});
