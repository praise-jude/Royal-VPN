import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors, font } from '../theme';

export default function SignupScreen({ onSignup, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const result = await onSignup(email.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error || 'Could not create account.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.iconWrap}>
        <FontAwesome6 name="shield-halved" iconStyle="solid" size={32} color={colors.orange} />
      </View>
      <Text style={styles.title}>ROYAL-VPN</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.textFaint45}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password (min. 8 characters)"
        placeholderTextColor={colors.textFaint45}
        secureTextEntry
        style={styles.input}
      />

      <Pressable onPress={handleSubmit} style={styles.submitBtn} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Create Account</Text>}
      </Pressable>

      <Pressable onPress={onGoToLogin} style={styles.switchLink}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.switchTextBold}>Log in</Text>
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    backgroundColor: colors.surface08,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontFamily: font.extrabold, fontSize: 22, letterSpacing: 0.5, color: '#fff', marginBottom: 4 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint6, marginBottom: 24 },
  error: {
    fontFamily: font.medium,
    fontSize: 12,
    color: colors.red,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    width: '100%',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface06,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontFamily: font.regular,
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: colors.orange,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { fontFamily: font.bold, fontSize: 15, color: '#000' },
  switchLink: { marginTop: 20 },
  switchText: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint6 },
  switchTextBold: { fontFamily: font.bold, color: colors.orange },
});
