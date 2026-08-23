import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://royal-vpn-api-production.up.railway.app';
const TOKEN_KEY = 'royal-vpn:auth-token';

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: data.error || 'Something went wrong.' };
  }
  return { success: true, ...data };
}

export async function signup(email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await parseResponse(res);
  if (result.success) await AsyncStorage.setItem(TOKEN_KEY, result.token);
  return result;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await parseResponse(res);
  if (result.success) await AsyncStorage.setItem(TOKEN_KEY, result.token);
  return result;
}

export async function restoreSession() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return null;
    }
    const data = await res.json();
    return { token, email: data.email, planId: data.planId };
  } catch (e) {
    return null;
  }
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}
