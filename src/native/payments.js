import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getToken } from './auth';

const API_BASE = 'https://royal-vpn-api-production.up.railway.app';

export async function startPaystackCheckout({ planId }) {
  const token = await getToken();
  if (!token) {
    return { success: false, error: 'Please log in first.' };
  }

  let initData;
  try {
    const initRes = await fetch(`${API_BASE}/paystack/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ planId }),
    });
    initData = await initRes.json();
    if (!initRes.ok || !initData.authorizationUrl) {
      return { success: false, error: initData.error || 'Could not start checkout.' };
    }
  } catch (e) {
    return { success: false, error: 'Could not reach the payment server.' };
  }

  const redirectUrl = Linking.createURL('payment-callback');
  const result = await WebBrowser.openAuthSessionAsync(initData.authorizationUrl, redirectUrl);

  if (result.type !== 'success') {
    return { success: false, error: 'Payment was cancelled.' };
  }

  try {
    const verifyRes = await fetch(`${API_BASE}/paystack/verify/${encodeURIComponent(initData.reference)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.paid) {
      return { success: false, error: 'Payment could not be verified.' };
    }
    return { success: true, planId: verifyData.planId, amountNaira: verifyData.amountNaira };
  } catch (e) {
    return { success: false, error: 'Could not verify payment with the server.' };
  }
}
