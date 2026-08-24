import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, AppState, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import TabBar from './src/components/TabBar';
import Sidebar from './src/components/Sidebar';
import HomeScreen from './src/screens/HomeScreen';
import ServersScreen from './src/screens/ServersScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplitTunnelScreen from './src/screens/SplitTunnelScreen';
import ThreatBlockerScreen from './src/screens/ThreatBlockerScreen';
import MultiHopScreen from './src/screens/MultiHopScreen';
import AppLockScreen from './src/screens/AppLockScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SpeedTestScreen from './src/screens/SpeedTestScreen';
import NetworkHistoryScreen from './src/screens/NetworkHistoryScreen';
import TrustedNetworksScreen from './src/screens/TrustedNetworksScreen';
import PlansScreen from './src/screens/PlansScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import TrustedServicesScreen from './src/screens/TrustedServicesScreen';
import TradingConnectionTestScreen from './src/screens/TradingConnectionTestScreen';
import {
  isRealVpnAvailable,
  requestVpnPermission,
  startRealVpn,
  stopRealVpn,
  checkRealVpnActive,
  getDevicePublicKey,
} from './src/native/royalVpn';
import { signup as apiSignup, login as apiLogin, restoreSession, logout as apiLogout } from './src/native/auth';
import { fetchServers } from './src/native/servers';
import { registerPilotPeer } from './src/native/vpnConfig';
import {
  serverRegionMap,
  devices as initialDevices,
  connectionModes,
  initialThreatCounts,
  threatDomainPool,
  initialTrustedNetworks,
  initialTrustedServices,
  subscriptionPlans,
  vpnProtocols,
} from './src/data';
import { colors } from './src/theme';
import { formatDuration, computeConnectionScore, computeMultiHopQuality, rankServers } from './src/utils';

const THREAT_CATEGORY_WEIGHTS = [
  ['ads', 5],
  ['trackers', 3],
  ['malware', 1],
  ['phishing', 1],
];

function pickWeightedCategory() {
  const total = THREAT_CATEGORY_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of THREAT_CATEGORY_WEIGHTS) {
    if (r < w) return key;
    r -= w;
  }
  return THREAT_CATEGORY_WEIGHTS[0][0];
}

let blockIdCounter = 0;
let eventIdCounter = 0;
let trustedNetworkIdCounter = 100;
let trustedAuditIdCounter = 0;

const STATIC_NOTIFICATIONS = [
  {
    id: 'static-welcome',
    icon: 'crown',
    color: colors.orange,
    title: 'Welcome to Royal-VPN Pro',
    subtitle: 'All server locations and unlimited data are unlocked.',
    time: Date.now() - 1000 * 60 * 60 * 20,
    read: true,
  },
  {
    id: 'static-multihop',
    icon: 'route',
    color: colors.blue,
    title: 'New: Multi-Hop routing',
    subtitle: 'Switch to Max Privacy mode to route through two servers.',
    time: Date.now() - 1000 * 60 * 60 * 5,
    read: true,
  },
];

const APP_LOCK_STORAGE_KEY = 'royal-vpn:app-lock-enabled';
const TRUSTED_SERVICES_KEY = 'royal-vpn:trusted-services';
const TRUSTED_RECONNECT_POLICY_KEY = 'royal-vpn:trusted-reconnect-policy';
const TRUSTED_AUDIT_LOG_KEY = 'royal-vpn:trusted-audit-log';

// Shown only while the live server list is still loading from the backend --
// never a stand-in for real ping/load numbers.
const PLACEHOLDER_SERVER = {
  id: null,
  city: 'Loading…',
  country: '',
  region: 'other',
  live: false,
  status: 'LOADING',
  ping: null,
  load: null,
  packetLoss: 0,
  jitter: 0,
};

const EVENT_META = {
  connect: { icon: 'power-off', color: colors.green },
  disconnect: { icon: 'power-off', color: colors.red },
  reconnect: { icon: 'arrows-rotate', color: colors.yellow },
  'server-switch': { icon: 'server', color: colors.blue },
  'wifi-detected': { icon: 'wifi', color: colors.orange },
  'network-change': { icon: 'signal', color: colors.textFaint6 },
  'speed-test': { icon: 'gauge-high', color: colors.orange },
  lockdown: { icon: 'lock-open', color: colors.red },
  protocol: { icon: 'arrows-rotate', color: colors.blue },
};

const NETWORK_LABELS = {
  WIFI: 'This Wi-Fi Network',
  CELLULAR: 'Mobile Data',
};

function AppContent() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 58 + Math.max(insets.bottom, 12);
  const { width: winWidth } = useWindowDimensions();
  const isDesktop = winWidth > DESKTOP_BREAKPOINT;
  const [tab, setTab] = useState('home');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [servers, setServers] = useState([]);
  const [serversLoading, setServersLoading] = useState(true);
  const [serverId, setServerId] = useState(null);
  const [killSwitch, setKillSwitch] = useState(true);
  const [lockdownEnabled, setLockdownEnabled] = useState(false);
  const [autoConnect, setAutoConnect] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [signedOutIds, setSignedOutIds] = useState({});
  const [mode, setMode] = useState('balanced');
  const [protocol, setProtocol] = useState('wireguard');
  const [vpnApps, setVpnApps] = useState({});
  const [subScreen, setSubScreen] = useState(null);
  const [threatBlockerOn, setThreatBlockerOn] = useState(true);
  const [threatCounts, setThreatCounts] = useState(initialThreatCounts);
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [appLockSupported, setAppLockSupported] = useState(false);
  const [unlocked, setUnlocked] = useState(true);
  const [lockError, setLockError] = useState('');
  const appState = useRef(AppState.currentState);
  const [networkEvents, setNetworkEvents] = useState([]);
  const [qualityHistory, setQualityHistory] = useState([]);
  const [autoReconnecting, setAutoReconnecting] = useState(false);
  const [protectBanner, setProtectBanner] = useState('');
  const [trustedNetworks, setTrustedNetworks] = useState(initialTrustedNetworks);
  const [trustedServices, setTrustedServices] = useState(initialTrustedServices);
  const [allowTrustedDuringReconnect, setAllowTrustedDuringReconnect] = useState(false);
  const [trustedAuditLog, setTrustedAuditLog] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState('free');
  const [authChecked, setAuthChecked] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [readNotificationIds, setReadNotificationIds] = useState({});
  const networkState = Network.useNetworkState();
  const prevNetworkTypeRef = useRef(null);
  const qualityRef = useRef(null);
  const connectedRef = useRef(connected);
  const autoConnectRef = useRef(autoConnect);
  const connectingRef = useRef(connecting);
  const droppedWhileConnectedRef = useRef(false);

  const logEvent = useCallback((type, label) => {
    eventIdCounter += 1;
    const meta = EVENT_META[type] || { icon: 'circle-info', color: colors.textFaint6 };
    setNetworkEvents((list) =>
      [{ id: eventIdCounter, type, label, time: Date.now(), icon: meta.icon, color: meta.color }, ...list].slice(0, 40)
    );
  }, []);

  useEffect(() => {
    (async () => {
      const session = await restoreSession();
      if (session) {
        setAuthUser({ email: session.email });
        setCurrentPlanId(session.planId);
      }
      setAuthChecked(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const isActive = await checkRealVpnActive();
      if (isActive) {
        setConnected(true);
        logEvent('connect', 'Restored an already-active VPN session');
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadServers() {
      try {
        const list = await fetchServers();
        if (cancelled) return;
        const enriched = list.map((sv) => ({
          ...sv,
          region: serverRegionMap[sv.id] || 'other',
          ping: sv.pingMs,
          load: sv.loadPct,
          packetLoss: 0,
          jitter: 0,
        }));
        setServers(enriched);
        setServerId((prev) => prev || enriched.find((s) => s.live)?.id || enriched[0]?.id || null);
      } catch (e) {
        // Keep whatever server list we already have; the next poll will retry.
      } finally {
        if (!cancelled) setServersLoading(false);
      }
    }
    loadServers();
    const interval = setInterval(loadServers, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    const result = await apiLogin(email, password);
    if (result.success) {
      setAuthUser({ email: result.email });
      setCurrentPlanId(result.planId);
    }
    return result;
  }, []);

  const handleSignup = useCallback(async (email, password) => {
    const result = await apiSignup(email, password);
    if (result.success) {
      setAuthUser({ email: result.email });
      setCurrentPlanId(result.planId);
    }
    return result;
  }, []);

  const handleLogout = useCallback(async () => {
    await apiLogout();
    setAuthUser(null);
    setAuthMode('login');
  }, []);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware && (await LocalAuthentication.isEnrolledAsync());
      setAppLockSupported(isEnrolled);

      const stored = await AsyncStorage.getItem(APP_LOCK_STORAGE_KEY);
      const enabled = stored === 'true' && isEnrolled;
      setAppLockEnabled(enabled);
      if (enabled) setUnlocked(false);
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/active/) && next.match(/inactive|background/) && appLockEnabled) {
        setUnlocked(false);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [appLockEnabled]);

  const handleToggleAppLock = useCallback(async () => {
    const next = !appLockEnabled;
    setAppLockEnabled(next);
    await AsyncStorage.setItem(APP_LOCK_STORAGE_KEY, next ? 'true' : 'false');
  }, [appLockEnabled]);

  const handleUnlock = useCallback(async () => {
    setLockError('');
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Royal-VPN',
      disableDeviceFallback: false,
    });
    if (result.success) {
      setUnlocked(true);
    } else if (result.error && result.error !== 'user_cancel') {
      setLockError('Authentication failed. Try again.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedServices = await AsyncStorage.getItem(TRUSTED_SERVICES_KEY);
        if (storedServices) setTrustedServices(JSON.parse(storedServices));
        const storedPolicy = await AsyncStorage.getItem(TRUSTED_RECONNECT_POLICY_KEY);
        if (storedPolicy) setAllowTrustedDuringReconnect(storedPolicy === 'true');
        const storedAudit = await AsyncStorage.getItem(TRUSTED_AUDIT_LOG_KEY);
        if (storedAudit) {
          const parsed = JSON.parse(storedAudit);
          setTrustedAuditLog(parsed);
          trustedAuditIdCounter = parsed.reduce((max, e) => Math.max(max, Number(e.id.split('-')[1]) || 0), 0);
        }
      } catch {
        // corrupt or unavailable storage — keep defaults
      }
    })();
  }, []);

  const logTrustedAudit = useCallback((label) => {
    trustedAuditIdCounter += 1;
    const entry = { id: `audit-${trustedAuditIdCounter}`, label, time: Date.now() };
    setTrustedAuditLog((list) => {
      const next = [entry, ...list].slice(0, 50);
      AsyncStorage.setItem(TRUSTED_AUDIT_LOG_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleToggleTrustedService = useCallback(
    (id) => {
      const target = trustedServices.find((s) => s.id === id);
      if (!target) return;
      const next = trustedServices.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      setTrustedServices(next);
      AsyncStorage.setItem(TRUSTED_SERVICES_KEY, JSON.stringify(next));
      logTrustedAudit(`${target.name} ${!target.enabled ? 'enabled' : 'disabled'}`);
    },
    [trustedServices, logTrustedAudit]
  );

  const handleRemoveTrustedService = useCallback(
    (id) => {
      const target = trustedServices.find((s) => s.id === id);
      const next = trustedServices.filter((s) => s.id !== id);
      setTrustedServices(next);
      AsyncStorage.setItem(TRUSTED_SERVICES_KEY, JSON.stringify(next));
      if (target) logTrustedAudit(`${target.name} removed from Trusted Trading`);
    },
    [trustedServices, logTrustedAudit]
  );

  const handleAddTrustedService = useCallback(
    (name, domain, includeSubdomains) => {
      const next = [...trustedServices, { id: `custom-${Date.now()}`, name, domain, includeSubdomains, enabled: true, builtIn: false }];
      setTrustedServices(next);
      AsyncStorage.setItem(TRUSTED_SERVICES_KEY, JSON.stringify(next));
      logTrustedAudit(`${name} added to Trusted Trading`);
    },
    [trustedServices, logTrustedAudit]
  );

  const handleToggleReconnectPolicy = useCallback(() => {
    const next = !allowTrustedDuringReconnect;
    setAllowTrustedDuringReconnect(next);
    AsyncStorage.setItem(TRUSTED_RECONNECT_POLICY_KEY, String(next));
    logTrustedAudit(`Allow trusted services during VPN reconnect ${next ? 'enabled' : 'disabled'}`);
  }, [allowTrustedDuringReconnect, logTrustedAudit]);

  useEffect(() => {
    const id = setInterval(() => {
      if (connected) setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [connected]);

  useEffect(() => {
    if (!connected || !threatBlockerOn) return;
    const id = setInterval(() => {
      const category = pickWeightedCategory();
      const pool = threatDomainPool[category];
      const domain = pool[Math.floor(Math.random() * pool.length)];
      blockIdCounter += 1;
      setThreatCounts((c) => ({ ...c, [category]: c[category] + 1 }));
      setRecentBlocks((list) => [{ id: blockIdCounter, domain, category, time: Date.now() }, ...list].slice(0, 20));
    }, 4000);
    return () => clearInterval(id);
  }, [connected, threatBlockerOn]);

  const threatsBlockedToday = useMemo(
    () => Object.values(threatCounts).reduce((sum, n) => sum + n, 0),
    [threatCounts]
  );

  const liveServers = useMemo(() => servers.filter((s) => s.live), [servers]);

  const server = useMemo(
    () => servers.find((s) => s.id === serverId) || liveServers[0] || PLACEHOLDER_SERVER,
    [servers, serverId, liveServers]
  );

  const handleConnectPress = useCallback(() => {
    if (connecting) return;
    if (!connected && !server?.live) {
      logEvent('disconnect', 'No live server is available yet');
      return;
    }
    if (connected) {
      setConnected(false);
      setSeconds(0);
      logEvent('disconnect', 'Manually disconnected');
      if (lockdownEnabled) {
        logEvent('lockdown', 'Royal Lockdown is blocking all traffic while disconnected');
      }
      stopRealVpn();
    } else {
      setConnecting(true);
      (async () => {
        if (isRealVpnAvailable) {
          const granted = await requestVpnPermission();
          if (!granted) {
            setConnecting(false);
            logEvent('disconnect', 'VPN permission was not granted');
            return;
          }
          const publicKey = await getDevicePublicKey();
          if (!publicKey) {
            setConnecting(false);
            logEvent('disconnect', 'Could not generate a device key');
            return;
          }
          const registration = await registerPilotPeer(publicKey, server.id);
          if (!registration.success) {
            setConnecting(false);
            logEvent('disconnect', registration.error || 'Could not reach the pilot server');
            return;
          }
          const started = await startRealVpn({
            serverPublicKey: registration.serverPublicKey,
            endpoint: registration.endpoint,
            clientAddress: registration.clientAddress,
            dns: registration.dns,
          });
          if (!started) {
            setConnecting(false);
            logEvent('disconnect', 'Could not start the WireGuard tunnel');
            return;
          }
          setConnecting(false);
          setConnected(true);
          logEvent('connect', 'Connected');
        } else {
          setTimeout(() => {
            setConnecting(false);
            setConnected(true);
            logEvent('connect', 'Connected');
          }, 800);
        }
      })();
    }
  }, [connected, connecting, logEvent, lockdownEnabled, server]);

  const handleSelectServer = useCallback(
    (id) => {
      const target = servers.find((s) => s.id === id);
      setServerId(id);
      if (target) logEvent('server-switch', `Switched exit server to ${target.city}`);
    },
    [logEvent, servers]
  );

  const [entryServerId, setEntryServerId] = useState(null);

  const entryServer = useMemo(() => {
    if (mode !== 'privacy') return null;
    return (
      liveServers.find((s) => s.id === entryServerId && s.id !== server.id) ||
      liveServers.find((s) => s.id !== server.id) ||
      null
    );
  }, [liveServers, entryServerId, server, mode]);

  const devices = useMemo(
    () => initialDevices.filter((d) => !signedOutIds[d.id]),
    [signedOutIds]
  );

  const activeMode = connectionModes.find((m) => m.key === mode) || connectionModes[1];
  const activeProtocol = vpnProtocols.find((p) => p.key === protocol) || vpnProtocols[0];
  const protocolLabel = `${activeProtocol.label} · ${activeMode.hopLabel}`;

  const quality = useMemo(() => {
    if (!server.live) return { score: 0, label: serversLoading ? 'Loading' : 'Unavailable', color: colors.textFaint5 };
    if (mode === 'privacy' && entryServer) return computeMultiHopQuality(entryServer, server);
    return computeConnectionScore({
      ping: server.ping,
      packetLoss: server.packetLoss,
      jitter: server.jitter,
      load: server.load,
      latencyPenalty: activeMode.latencyPenalty,
    });
  }, [server, entryServer, mode, activeMode, serversLoading]);

  const rankedLiveServers = useMemo(
    () => rankServers(liveServers, activeMode.latencyPenalty),
    [liveServers, activeMode]
  );
  const bestServer = rankedLiveServers[0] || null;
  const disabledModeKeys = liveServers.length < 2 ? ['privacy'] : [];

  useEffect(() => {
    if (disabledModeKeys.includes(mode)) setMode('balanced');
  }, [disabledModeKeys, mode]);
  const comingSoonServers = useMemo(() => servers.filter((s) => !s.live), [servers]);
  const allServersForDisplay = useMemo(
    () => [...rankedLiveServers, ...comingSoonServers],
    [rankedLiveServers, comingSoonServers]
  );

  const notifications = useMemo(() => {
    const fromEvents = networkEvents.map((e) => ({
      id: `event-${e.id}`,
      icon: e.icon,
      color: e.color,
      title: e.label,
      subtitle: null,
      time: e.time,
    }));
    const fromBlocks = recentBlocks.slice(0, 10).map((b) => ({
      id: `block-${b.id}`,
      icon: 'bug-slash',
      color: colors.red,
      title: `Blocked ${b.domain}`,
      subtitle: `${b.category.charAt(0).toUpperCase()}${b.category.slice(1)} threat`,
      time: b.time,
    }));
    const merged = [...fromEvents, ...fromBlocks, ...STATIC_NOTIFICATIONS].sort((a, b) => b.time - a.time);
    return merged.slice(0, 40).map((n) => ({ ...n, read: n.read || !!readNotificationIds[n.id] }));
  }, [networkEvents, recentBlocks, readNotificationIds]);

  const unreadNotifCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const subscriptionPlanLabel = useMemo(() => {
    const plan = subscriptionPlans.find((p) => p.id === currentPlanId);
    return plan ? `${plan.name.toUpperCase()} PLAN` : 'PRO PLAN';
  }, [currentPlanId]);

  const handleAddTrustedNetwork = useCallback(() => {
    trustedNetworkIdCounter += 1;
    const label = NETWORK_LABELS[networkState?.type] || 'Current Network';
    setTrustedNetworks((list) => [...list, { id: trustedNetworkIdCounter, name: label }]);
  }, [networkState?.type]);

  const handleRemoveTrustedNetwork = useCallback((id) => {
    setTrustedNetworks((list) => list.filter((n) => n.id !== id));
  }, []);

  const handleMarkNotifRead = useCallback((id) => {
    setReadNotificationIds((r) => ({ ...r, [id]: true }));
  }, []);

  const handleMarkAllNotifRead = useCallback(() => {
    setReadNotificationIds(() => {
      const all = {};
      notifications.forEach((n) => {
        all[n.id] = true;
      });
      return all;
    });
  }, [notifications]);

  useEffect(() => {
    qualityRef.current = quality;
  }, [quality]);
  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);
  useEffect(() => {
    autoConnectRef.current = autoConnect;
  }, [autoConnect]);
  useEffect(() => {
    connectingRef.current = connecting;
  }, [connecting]);

  useEffect(() => {
    const type = networkState?.type;
    if (!type) return;
    const prev = prevNetworkTypeRef.current;

    if (prev !== null && prev !== type) {
      if (type === 'NONE' && connectedRef.current) {
        // Real connectivity loss while the tunnel was up -- the OS/network
        // dropped out from under us, not a simulated event.
        droppedWhileConnectedRef.current = true;
        logEvent('disconnect', 'Network connection lost');
      } else if (type !== 'NONE' && droppedWhileConnectedRef.current) {
        droppedWhileConnectedRef.current = false;
        setAutoReconnecting(true);
        (async () => {
          let ok = true;
          if (isRealVpnAvailable) {
            ok = false;
            const target = servers.find((s) => s.id === serverId) || server;
            if (target?.live) {
              const publicKey = await getDevicePublicKey();
              if (publicKey) {
                const registration = await registerPilotPeer(publicKey, target.id);
                if (registration.success) {
                  ok = await startRealVpn({
                    serverPublicKey: registration.serverPublicKey,
                    endpoint: registration.endpoint,
                    clientAddress: registration.clientAddress,
                    dns: registration.dns,
                  });
                }
              }
            }
          }
          setAutoReconnecting(false);
          if (ok) {
            setConnected(true);
            logEvent(
              'reconnect',
              killSwitch
                ? 'Auto-reconnected after a network interruption — Kill Switch blocked traffic during the gap'
                : 'Auto-reconnected after a network interruption'
            );
          } else {
            setConnected(false);
            logEvent('disconnect', 'Could not automatically reconnect — tap Connect to try again');
          }
        })();
      } else if (type === 'WIFI') {
        logEvent('wifi-detected', 'Joined a new Wi-Fi network — not verified as trusted');
        setProtectBanner('Unverified Wi-Fi detected');
        if (autoConnectRef.current && !connectedRef.current && !connectingRef.current) {
          setConnecting(true);
          setTimeout(() => {
            setConnecting(false);
            setConnected(true);
            logEvent('wifi-detected', 'Auto-Connect engaged on unverified Wi-Fi');
          }, 1000);
        }
        setTimeout(() => setProtectBanner(''), 6000);
      } else if (type === 'CELLULAR' && prev === 'WIFI') {
        logEvent('network-change', 'Switched from Wi-Fi to mobile data');
      }
    }
    prevNetworkTypeRef.current = type;
  }, [networkState?.type, logEvent, killSwitch, servers, serverId, server]);

  useEffect(() => {
    const id = setInterval(() => {
      if (connectedRef.current && qualityRef.current) {
        setQualityHistory((h) => [...h, { t: Date.now(), score: qualityRef.current.score }].slice(-40));
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  if (!authChecked) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
      </View>
    );
  }

  if (!authUser) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        {authMode === 'login' ? (
          <LoginScreen onLogin={handleLogin} onGoToSignup={() => setAuthMode('signup')} />
        ) : (
          <SignupScreen onSignup={handleSignup} onGoToLogin={() => setAuthMode('login')} />
        )}
      </View>
    );
  }

  if (appLockEnabled && appLockSupported && !unlocked) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <AppLockScreen onUnlock={handleUnlock} error={lockError} />
      </View>
    );
  }

  const mainContent = (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? 32 : tabBarHeight + 20 },
          isDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={isDesktop ? styles.desktopColumn : styles.mobileColumn}>
          {subScreen === 'split-tunnel' ? (
            <SplitTunnelScreen
              vpnApps={vpnApps}
              onToggleApp={(id) => setVpnApps((v) => ({ ...v, [id]: v[id] === false ? true : false }))}
              onBack={() => setSubScreen(null)}
            />
          ) : subScreen === 'threat-blocker' ? (
            <ThreatBlockerScreen
              on={threatBlockerOn}
              counts={threatCounts}
              total={threatsBlockedToday}
              recentBlocks={recentBlocks}
              onToggle={() => setThreatBlockerOn((v) => !v)}
              onBack={() => setSubScreen(null)}
            />
          ) : subScreen === 'multi-hop' ? (
            <MultiHopScreen
              servers={liveServers}
              entryId={entryServerId}
              exitId={serverId}
              onSelectEntry={setEntryServerId}
              onSelectExit={handleSelectServer}
              onBack={() => setSubScreen(null)}
            />
          ) : subScreen === 'speed-test' ? (
            <SpeedTestScreen
              server={server}
              quality={quality}
              onBack={() => setSubScreen(null)}
              onComplete={(results) =>
                logEvent('speed-test', `Speed test: ${results.download} Mbps down / ${results.upload} Mbps up`)
              }
            />
          ) : subScreen === 'network-history' ? (
            <NetworkHistoryScreen
              quality={quality}
              history={qualityHistory}
              events={networkEvents}
              onBack={() => setSubScreen(null)}
            />
          ) : subScreen === 'trusted-networks' ? (
            <TrustedNetworksScreen
              networks={trustedNetworks}
              onAdd={handleAddTrustedNetwork}
              onRemove={handleRemoveTrustedNetwork}
              onBack={() => setSubScreen(null)}
            />
          ) : subScreen === 'trusted-services' ? (
            <TrustedServicesScreen
              services={trustedServices}
              allowDuringReconnect={allowTrustedDuringReconnect}
              auditLog={trustedAuditLog}
              onBack={() => setSubScreen(null)}
              onToggleService={handleToggleTrustedService}
              onRemoveService={handleRemoveTrustedService}
              onAddService={handleAddTrustedService}
              onToggleReconnectPolicy={handleToggleReconnectPolicy}
              onOpenTest={() => setSubScreen('trading-connection-test')}
            />
          ) : subScreen === 'trading-connection-test' ? (
            <TradingConnectionTestScreen
              services={trustedServices}
              vpnServerLabel={server.country ? `${server.city}, ${server.country}` : server.city}
              protocolLabel={protocolLabel}
              onBack={() => setSubScreen('trusted-services')}
            />
          ) : subScreen === 'plans' ? (
            <PlansScreen
              currentPlanId={currentPlanId}
              onSelectPlan={(id) => {
                setCurrentPlanId(id);
                setSubScreen(null);
              }}
              onBack={() => setSubScreen(null)}
            />
          ) : subScreen === 'notifications' ? (
            <NotificationsScreen
              notifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllNotifRead}
              onBack={() => setSubScreen(null)}
            />
          ) : (
            <>
              {tab === 'home' && (
                <HomeScreen
                  connected={connected}
                  connecting={connecting}
                  autoReconnecting={autoReconnecting}
                  server={server}
                  durationStr={formatDuration(seconds)}
                  showStats={connected}
                  killSwitch={killSwitch}
                  autoConnect={autoConnect}
                  mode={mode}
                  onModeChange={setMode}
                  disabledModeKeys={disabledModeKeys}
                  protocolLabel={protocolLabel}
                  quality={quality}
                  entryServer={mode === 'privacy' ? entryServer : null}
                  networkType={networkState?.type}
                  protectBanner={
                    protectBanner ||
                    (lockdownEnabled && !connected && !connecting
                      ? 'Royal Lockdown active — all traffic blocked until VPN reconnects'
                      : '')
                  }
                  onConnectClick={handleConnectPress}
                  onGoServers={() => setTab('servers')}
                  onOpenMultiHop={() => setSubScreen('multi-hop')}
                  onOpenHistory={() => setSubScreen('network-history')}
                  onOpenSpeedTest={() => setSubScreen('speed-test')}
                  onToggleKill={() => setKillSwitch((v) => !v)}
                  onToggleAuto={() => setAutoConnect((v) => !v)}
                />
              )}
              {tab === 'servers' && (
                <ServersScreen
                  servers={allServersForDisplay}
                  serversLoading={serversLoading}
                  selectedId={server.id}
                  favorites={favorites}
                  onSelect={handleSelectServer}
                  onToggleFav={(id) => setFavorites((f) => ({ ...f, [id]: !f[id] }))}
                  bestServer={bestServer}
                  onUseRecommended={handleSelectServer}
                  isPaid={currentPlanId !== 'free'}
                  onRequireUpgrade={() => setSubScreen('plans')}
                />
              )}
              {tab === 'security' && (
                <SecurityScreen
                  connected={connected}
                  isRealVpnAvailable={isRealVpnAvailable}
                  killSwitch={killSwitch}
                  autoConnect={autoConnect}
                  twoFA={twoFA}
                  threatBlockerOn={threatBlockerOn}
                  threatsBlockedToday={threatsBlockedToday}
                  appLockEnabled={appLockEnabled}
                  appLockSupported={appLockSupported}
                  lockdownEnabled={lockdownEnabled}
                  protocol={protocol}
                  onChangeProtocol={(p) => {
                    setProtocol(p);
                    logEvent('protocol', `Switched protocol to ${vpnProtocols.find((x) => x.key === p)?.label}`);
                  }}
                  trustedNetworksCount={trustedNetworks.length}
                  trustedServicesEnabledCount={trustedServices.filter((s) => s.enabled).length}
                  onToggleKill={() => setKillSwitch((v) => !v)}
                  onToggleAuto={() => setAutoConnect((v) => !v)}
                  onToggle2FA={() => setTwoFA((v) => !v)}
                  onToggleAppLock={handleToggleAppLock}
                  onToggleLockdown={() =>
                    setLockdownEnabled((v) => {
                      const next = !v;
                      logEvent(
                        'lockdown',
                        next ? 'Royal Lockdown enabled' : 'Royal Lockdown disabled'
                      );
                      return next;
                    })
                  }
                  onOpenSplitTunnel={() => setSubScreen('split-tunnel')}
                  onOpenThreatBlocker={() => setSubScreen('threat-blocker')}
                  onOpenTrustedNetworks={() => setSubScreen('trusted-networks')}
                  onOpenTrustedServices={() => setSubScreen('trusted-services')}
                />
              )}
              {tab === 'devices' && (
                <DevicesScreen
                  devices={devices}
                  onSignOut={(id) => setSignedOutIds((s) => ({ ...s, [id]: true }))}
                />
              )}
              {tab === 'settings' && (
                <SettingsScreen
                  userEmail={authUser?.email}
                  planLabel={subscriptionPlanLabel}
                  unreadNotifCount={unreadNotifCount}
                  onOpenPlans={() => setSubScreen('plans')}
                  onOpenNotifications={() => setSubScreen('notifications')}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {isDesktop ? (
        <View style={styles.desktopRow}>
          <Sidebar
            activeTab={tab}
            onChange={(t) => {
              setSubScreen(null);
              setTab(t);
            }}
            userEmail={authUser?.email}
            planLabel={subscriptionPlanLabel}
            connected={connected}
          />
          <View style={styles.desktopMain}>{mainContent}</View>
        </View>
      ) : (
        <>
          {mainContent}
          <TabBar
            activeTab={tab}
            onChange={(t) => {
              setSubScreen(null);
              setTab(t);
            }}
          />
        </>
      )}
    </View>
  );
}

const WIDE_BREAKPOINT = 560;
const DESKTOP_BREAKPOINT = 900;
const DESKTOP_CONTENT_MAX_WIDTH = 720;
const FRAME_MAX_WIDTH = 430;
const FRAME_MAX_HEIGHT = 900;

function ResponsiveFrame({ children }) {
  const { width, height } = useWindowDimensions();
  const isWide = width > WIDE_BREAKPOINT;
  const isDesktop = width > DESKTOP_BREAKPOINT;

  // Above the desktop breakpoint, AppContent renders its own sidebar shell
  // and fills the window directly rather than sitting inside a phone card.
  if (!isWide || isDesktop) {
    return <View style={styles.fullBleed}>{children}</View>;
  }

  return (
    <LinearGradient colors={['#05070d', '#0a0d1c']} style={styles.desktopBackdrop}>
      <View
        style={[
          styles.phoneFrame,
          { height: Math.min(height - 64, FRAME_MAX_HEIGHT) },
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ResponsiveFrame>
        <AppContent />
      </ResponsiveFrame>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  scrollContentDesktop: { alignItems: 'center', paddingTop: 32 },
  mobileColumn: { width: '100%' },
  desktopColumn: { width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH },
  desktopRow: { flex: 1, flexDirection: 'row' },
  desktopMain: { flex: 1, backgroundColor: colors.bg },
  fullBleed: { flex: 1 },
  desktopBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  phoneFrame: {
    width: '100%',
    maxWidth: FRAME_MAX_WIDTH,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.6,
    shadowRadius: 60,
    elevation: 30,
  },
});
