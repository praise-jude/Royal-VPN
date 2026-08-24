import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from './Pressable';
import { colors, font } from '../theme';

export default function BackHeader({ title, onBack }) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
        <FontAwesome6 name="chevron-left" iconStyle="solid" size={15} color="#fff" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, marginBottom: 18 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    backgroundColor: colors.surface06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: font.extrabold, fontSize: 20, color: '#fff' },
});
