import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, font } from '../theme';

const SIZES = {
  sm: { paddingVertical: 8, paddingHorizontal: 18, fontSize: 14, height: 36 },
  md: { paddingVertical: 10, paddingHorizontal: 24, fontSize: 16, height: 44 },
  lg: { paddingVertical: 12, paddingHorizontal: 28, fontSize: 18, height: 48 },
};

const VARIANTS = {
  primary: { backgroundColor: colors.orange, color: '#fff' },
  secondary: { backgroundColor: colors.blue, color: '#fff' },
};

export default function RmButton({
  children,
  shape = 'pill',
  size = 'md',
  variant = 'primary',
  onPress,
  disabled = false,
  style,
}) {
  const radius = shape === 'lg' ? 8 : 9999;
  const sizeStyle = SIZES[size];
  const variantStyle = VARIANTS[variant];

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: radius,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          minHeight: sizeStyle.height,
          backgroundColor: pressed ? colors.blue : variantStyle.backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { fontSize: sizeStyle.fontSize, color: variantStyle.color }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  label: {
    fontFamily: font.bold,
    fontWeight: '700',
  },
});
