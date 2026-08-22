import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
import {
  servers as initialServers,
  devices as initialDevices,
  connectionModes,
  initialThreatCounts,
  threatDomainPool,
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

function AppContent() {
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
      setRecentBlocks((list) => [{ id: blockIdCounter, domain, category, time: 'just now' }, ...list].slice(0, 20));
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
    } else {
      setConnecting(true);
      setTimeout(() => {
        setConnecting(false);
        setConnected(true);
      }, 1400);
    }
  }, [connected, connecting]);

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

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
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
              onSelectExit={setServerId}
              onBack={() => setSubScreen(null)}
            />
          ) : (
            <>
              {tab === 'home' && (
                <HomeScreen
                  connected={connected}
                  connecting={connecting}
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
                  onConnectClick={handleConnectPress}
                  onGoServers={() => setTab('servers')}
                  onOpenMultiHop={() => setSubScreen('multi-hop')}
                  onToggleKill={() => setKillSwitch((v) => !v)}
                  onToggleAuto={() => setAutoConnect((v) => !v)}
                />
              )}
              {tab === 'servers' && (
                <ServersScreen
                  servers={rankedServers}
                  selectedId={server.id}
                  favorites={favorites}
                  onSelect={setServerId}
                  onToggleFav={(id) => setFavorites((f) => ({ ...f, [id]: !f[id] }))}
                  bestServer={bestServer}
                  onUseRecommended={setServerId}
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
                  onToggleKill={() => setKillSwitch((v) => !v)}
                  onToggleAuto={() => setAutoConnect((v) => !v)}
                  onToggle2FA={() => setTwoFA((v) => !v)}
                  onOpenSplitTunnel={() => setSubScreen('split-tunnel')}
                  onOpenThreatBlocker={() => setSubScreen('threat-blocker')}
                />
              )}
              {tab === 'devices' && (
                <DevicesScreen
                  devices={devices}
                  onSignOut={(id) => setSignedOutIds((s) => ({ ...s, [id]: true }))}
                />
              )}
              {tab === 'settings' && <SettingsScreen planLabel="PRO PLAN" />}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <TabBar activeTab={tab} onChange={(t) => { setSubScreen(null); setTab(t); }} />
    </View>
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
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 100 },
});
