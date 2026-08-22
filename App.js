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
import HomeScreen from './src/screens/HomeScreen';
import ServersScreen from './src/screens/ServersScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplitTunnelScreen from './src/screens/SplitTunnelScreen';
import ThreatBlockerScreen from './src/screens/ThreatBlockerScreen';
import MultiHopScreen from './src/screens/MultiHopScreen';
import AppLockScreen from './src/screens/AppLockScreen';
import SpeedTestScreen from './src/screens/SpeedTestScreen';
import NetworkHistoryScreen from './src/screens/NetworkHistoryScreen';
import TrustedNetworksScreen from './src/screens/TrustedNetworksScreen';
import PlansScreen from './src/screens/PlansScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { isRealVpnAvailable, requestVpnPermission, startRealVpn, stopRealVpn } from './src/native/royalVpn';
import {
  servers as initialServers,
  devices as initialDevices,
  connectionModes,
  initialThreatCounts,
  threatDomainPool,
  initialTrustedNetworks,
  subscriptionPlans,
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

const EVENT_META = {
  connect: { icon: 'power-off', color: colors.green },
  disconnect: { icon: 'power-off', color: colors.red },
  reconnect: { icon: 'arrows-rotate', color: colors.yellow },
  'server-switch': { icon: 'server', color: colors.blue },
  'wifi-detected': { icon: 'wifi', color: colors.orange },
  'network-change': { icon: 'signal', color: colors.textFaint6 },
  'speed-test': { icon: 'gauge-high', color: colors.orange },
};

const NETWORK_LABELS = {
  WIFI: 'This Wi-Fi Network',
  CELLULAR: 'Mobile Data',
};

function AppContent() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 58 + Math.max(insets.bottom, 12);
  const [tab, setTab] = useState('home');
  const [connected, setConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [seconds, setSeconds] = useState(2538);
  const [serverId, setServerId] = useState('lagos');
  const [entryServerId, setEntryServerId] = useState('frankfurt');
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [favorites, setFavorites] = useState({ london: true });
  const [signedOutIds, setSignedOutIds] = useState({});
  const [mode, setMode] = useState('balanced');
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
  const [currentPlanId, setCurrentPlanId] = useState('pro');
  const [readNotificationIds, setReadNotificationIds] = useState({});
  const networkState = Network.useNetworkState();
  const prevNetworkTypeRef = useRef(null);
  const qualityRef = useRef(null);
  const connectedRef = useRef(connected);
  const autoConnectRef = useRef(autoConnect);
  const connectingRef = useRef(connecting);

  const logEvent = useCallback((type, label) => {
    eventIdCounter += 1;
    const meta = EVENT_META[type] || { icon: 'circle-info', color: colors.textFaint6 };
    setNetworkEvents((list) =>
      [{ id: eventIdCounter, type, label, time: Date.now(), icon: meta.icon, color: meta.color }, ...list].slice(0, 40)
    );
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

  const handleConnectPress = useCallback(() => {
    if (connecting) return;
    if (connected) {
      setConnected(false);
      setSeconds(0);
      logEvent('disconnect', 'Manually disconnected');
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
          await startRealVpn();
        }
        setTimeout(() => {
          setConnecting(false);
          setConnected(true);
          logEvent('connect', 'Connected');
        }, 1400);
      })();
    }
  }, [connected, connecting, logEvent]);

  const handleSelectServer = useCallback(
    (id) => {
      const target = initialServers.find((s) => s.id === id);
      setServerId(id);
      if (target) logEvent('server-switch', `Switched exit server to ${target.city}`);
    },
    [logEvent]
  );

  const server = useMemo(
    () => initialServers.find((s) => s.id === serverId) || initialServers[0],
    [serverId]
  );

  const entryServer = useMemo(
    () => initialServers.find((s) => s.id === entryServerId) || initialServers[1],
    [entryServerId]
  );

  useEffect(() => {
    if (entryServerId === serverId) {
      const fallback = initialServers.find((s) => s.id !== serverId);
      if (fallback) setEntryServerId(fallback.id);
    }
  }, [entryServerId, serverId]);

  const devices = useMemo(
    () => initialDevices.filter((d) => !signedOutIds[d.id]),
    [signedOutIds]
  );

  const activeMode = connectionModes.find((m) => m.key === mode) || connectionModes[1];

  const quality = useMemo(() => {
    if (mode === 'privacy') return computeMultiHopQuality(entryServer, server);
    return computeConnectionScore({
      ping: server.ping,
      packetLoss: server.packetLoss,
      jitter: server.jitter,
      load: server.load,
      latencyPenalty: activeMode.latencyPenalty,
    });
  }, [server, entryServer, mode, activeMode]);

  const rankedServers = useMemo(
    () => rankServers(initialServers, activeMode.latencyPenalty),
    [activeMode]
  );
  const bestServer = rankedServers[0];

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
      if (type === 'WIFI') {
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
  }, [networkState?.type, logEvent]);

  useEffect(() => {
    const id = setInterval(() => {
      if (connectedRef.current && qualityRef.current) {
        setQualityHistory((h) => [...h, { t: Date.now(), score: qualityRef.current.score }].slice(-40));
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (
        connectedRef.current &&
        !connectingRef.current &&
        !autoReconnecting &&
        Math.random() < 0.06
      ) {
        setAutoReconnecting(true);
        setTimeout(() => {
          setAutoReconnecting(false);
          logEvent(
            'reconnect',
            killSwitch
              ? 'Auto-reconnected after a network blip — Kill Switch blocked traffic during the gap'
              : 'Auto-reconnected after a brief network interruption'
          );
        }, 1700);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [autoReconnecting, killSwitch, logEvent]);

  if (appLockEnabled && appLockSupported && !unlocked) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <AppLockScreen onUnlock={handleUnlock} error={lockError} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
        >
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
              entryId={entryServerId}
              exitId={serverId}
              onSelectEntry={setEntryServerId}
              onSelectExit={handleSelectServer}
              onBack={() => setSubScreen(null)}
            />
          ) : subScreen === 'speed-test' ? (
            <SpeedTestScreen
              server={server}
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
                  protocolLabel={activeMode.protocolLabel}
                  quality={quality}
                  entryServer={mode === 'privacy' ? entryServer : null}
                  networkType={networkState?.type}
                  protectBanner={protectBanner}
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
                  servers={rankedServers}
                  selectedId={server.id}
                  favorites={favorites}
                  onSelect={handleSelectServer}
                  onToggleFav={(id) => setFavorites((f) => ({ ...f, [id]: !f[id] }))}
                  bestServer={bestServer}
                  onUseRecommended={handleSelectServer}
                />
              )}
              {tab === 'security' && (
                <SecurityScreen
                  connected={connected}
                  killSwitch={killSwitch}
                  autoConnect={autoConnect}
                  twoFA={twoFA}
                  threatBlockerOn={threatBlockerOn}
                  threatsBlockedToday={threatsBlockedToday}
                  appLockEnabled={appLockEnabled}
                  appLockSupported={appLockSupported}
                  trustedNetworksCount={trustedNetworks.length}
                  onToggleKill={() => setKillSwitch((v) => !v)}
                  onToggleAuto={() => setAutoConnect((v) => !v)}
                  onToggle2FA={() => setTwoFA((v) => !v)}
                  onToggleAppLock={handleToggleAppLock}
                  onOpenSplitTunnel={() => setSubScreen('split-tunnel')}
                  onOpenThreatBlocker={() => setSubScreen('threat-blocker')}
                  onOpenTrustedNetworks={() => setSubScreen('trusted-networks')}
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
                  planLabel={subscriptionPlanLabel}
                  unreadNotifCount={unreadNotifCount}
                  onOpenPlans={() => setSubScreen('plans')}
                  onOpenNotifications={() => setSubScreen('notifications')}
                />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <TabBar activeTab={tab} onChange={(t) => { setSubScreen(null); setTab(t); }} />
    </View>
  );
}

const WIDE_BREAKPOINT = 560;
const FRAME_MAX_WIDTH = 430;
const FRAME_MAX_HEIGHT = 900;

function ResponsiveFrame({ children }) {
  const { width, height } = useWindowDimensions();
  const isWide = width > WIDE_BREAKPOINT;

  if (!isWide) {
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
