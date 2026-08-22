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
import { servers as initialServers, devices as initialDevices } from './src/data';
import { colors } from './src/theme';

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const p = (n) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}`;
}

function AppContent() {
  const [tab, setTab] = useState('home');
  const [connected, setConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [seconds, setSeconds] = useState(2538);
  const [serverId, setServerId] = useState('lagos');
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [favorites, setFavorites] = useState({ london: true });
  const [signedOutIds, setSignedOutIds] = useState({});

  useEffect(() => {
    const id = setInterval(() => {
      if (connected) setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [connected]);

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

  const devices = useMemo(
    () => initialDevices.filter((d) => !signedOutIds[d.id]),
    [signedOutIds]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tab === 'home' && (
            <HomeScreen
              connected={connected}
              connecting={connecting}
              server={server}
              durationStr={formatDuration(seconds)}
              showStats={connected}
              killSwitch={killSwitch}
              autoConnect={autoConnect}
              onConnectClick={handleConnectPress}
              onGoServers={() => setTab('servers')}
              onToggleKill={() => setKillSwitch((v) => !v)}
              onToggleAuto={() => setAutoConnect((v) => !v)}
            />
          )}
          {tab === 'servers' && (
            <ServersScreen
              servers={initialServers}
              selectedId={server.id}
              favorites={favorites}
              onSelect={setServerId}
              onToggleFav={(id) => setFavorites((f) => ({ ...f, [id]: !f[id] }))}
            />
          )}
          {tab === 'security' && (
            <SecurityScreen
              killSwitch={killSwitch}
              autoConnect={autoConnect}
              twoFA={twoFA}
              onToggleKill={() => setKillSwitch((v) => !v)}
              onToggleAuto={() => setAutoConnect((v) => !v)}
              onToggle2FA={() => setTwoFA((v) => !v)}
            />
          )}
          {tab === 'devices' && (
            <DevicesScreen
              devices={devices}
              onSignOut={(id) => setSignedOutIds((s) => ({ ...s, [id]: true }))}
            />
          )}
          {tab === 'settings' && <SettingsScreen planLabel="PRO PLAN" />}
        </ScrollView>
      </SafeAreaView>
      <TabBar activeTab={tab} onChange={setTab} />
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
