import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from './Pressable';
import { FontAwesome6 } from '@expo/vector-icons';
import { tabsDef } from '../data';
import { colors, font } from '../theme';

export default function TabBar({ activeTab, onChange }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.bar, { height: 58 + bottomPad, paddingBottom: bottomPad }]}>
      {tabsDef.map((t) => {
        const active = activeTab === t.key;
        const color = active ? colors.orange : colors.textFaint45;
        return (
          <Pressable key={t.key} style={styles.item} onPress={() => onChange(t.key)}>
            <FontAwesome6 name={t.icon} iconStyle="solid" size={19} color={color} />
            <Text style={[styles.label, { color }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(3,7,18,0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.surface08,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 10.5,
  },
});
