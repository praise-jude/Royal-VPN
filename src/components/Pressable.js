import { Pressable as RNPressable } from 'react-native';

// Drop-in replacement for RN's Pressable that always gives real tap feedback --
// an opacity dim (iOS) plus a native ripple (Android) -- so every button in
// the app feels responsive to touch, not just the ones that opted in.
export default function Pressable({ style, android_ripple, ...props }) {
  return (
    <RNPressable
      android_ripple={android_ripple || { color: 'rgba(255,255,255,0.15)' }}
      style={(state) => {
        const base = typeof style === 'function' ? style(state) : style;
        return [base, state.pressed && styles.pressed];
      }}
      {...props}
    />
  );
}

const styles = { pressed: { opacity: 0.7 } };
