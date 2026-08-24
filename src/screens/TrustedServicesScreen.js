import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from '../components/Pressable';
import BackHeader from '../components/BackHeader';
import Toggle from '../components/Toggle';
import { colors, font } from '../theme';
import { formatRelativeTime } from '../utils';
import { isValidDomain, lookalikeWarning, normalizeDomain } from '../trustedServices';

export default function TrustedServicesScreen({
  services,
  allowDuringReconnect,
  auditLog,
  onBack,
  onToggleService,
  onRemoveService,
  onAddService,
  onToggleReconnectPolicy,
  onOpenTest,
}) {
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [includeSubdomains, setIncludeSubdomains] = useState(false);
  const [formError, setFormError] = useState('');

  const normalizedDomain = normalizeDomain(domain);
  const warning = normalizedDomain && isValidDomain(normalizedDomain) ? lookalikeWarning(normalizedDomain, services) : null;

  const handleSubmitAdd = () => {
    setFormError('');
    if (!name.trim()) {
      setFormError('Give this trusted service a name.');
      return;
    }
    if (!normalizedDomain || !isValidDomain(normalizedDomain)) {
      setFormError('Enter a valid domain, like example.com.');
      return;
    }
    if (services.some((s) => s.domain === normalizedDomain)) {
      setFormError('That domain is already on the list.');
      return;
    }
    onAddService(name.trim(), normalizedDomain, includeSubdomains);
    setName('');
    setDomain('');
    setIncludeSubdomains(false);
    setShowAddForm(false);
  };

  return (
    <View>
      <BackHeader title="Trusted Trading" onBack={onBack} />
      <View style={styles.container}>
        <View style={styles.infoBanner}>
          <FontAwesome6 name="circle-info" iconStyle="solid" size={14} color="rgba(255,255,255,0.6)" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            These preferences keep the domains below reachable while Royal-VPN is connected. They don&apos;t change how the rest
            of your traffic is protected — everything else still goes through the normal Royal-VPN tunnel.
          </Text>
        </View>

        <View style={styles.card}>
          {services.map((service, i) => (
            <View key={service.id}>
              {confirmRemoveId === service.id ? (
                <View style={[styles.row, i < services.length - 1 && styles.rowBorder]}>
                  <Text style={styles.confirmText}>Remove {service.name}?</Text>
                  <Pressable onPress={() => setConfirmRemoveId(null)} hitSlop={8}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      onRemoveService(service.id);
                      setConfirmRemoveId(null);
                    }}
                    hitSlop={8}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={[styles.row, i < services.length - 1 && styles.rowBorder]}>
                  <View style={[styles.statusDot, { backgroundColor: service.enabled ? colors.green : 'rgba(255,255,255,0.3)' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDomain} numberOfLines={1}>
                      {service.domain}
                      {service.includeSubdomains ? ' · includes subdomains' : ''}
                    </Text>
                  </View>
                  <Toggle value={service.enabled} onToggle={() => onToggleService(service.id)} />
                  <Pressable onPress={() => setConfirmRemoveId(service.id)} hitSlop={8} style={styles.trashBtn}>
                    <FontAwesome6 name="trash" iconStyle="solid" size={13} color="rgba(255,255,255,0.35)" />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>

        {showAddForm ? (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>Add Trusted Domain</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Service name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.input}
            />
            <TextInput
              value={domain}
              onChangeText={setDomain}
              placeholder="example.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <Pressable onPress={() => setIncludeSubdomains((v) => !v)} style={styles.checkboxRow}>
              <View style={[styles.checkbox, includeSubdomains && styles.checkboxActive]}>
                {includeSubdomains && <FontAwesome6 name="check" iconStyle="solid" size={10} color="#000" />}
              </View>
              <Text style={styles.checkboxLabel}>Include all subdomains (*.{normalizedDomain || 'domain.com'})</Text>
            </Pressable>

            {warning ? (
              <View style={styles.warningBox}>
                <FontAwesome6 name="triangle-exclamation" iconStyle="solid" size={12} color={colors.yellow} style={styles.warningIcon} />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ) : null}
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <View style={styles.formActions}>
              <Pressable
                onPress={() => {
                  setShowAddForm(false);
                  setFormError('');
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmitAdd} style={styles.addBtn}>
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setShowAddForm(true)} style={styles.addToggleBtn}>
            <FontAwesome6 name="plus" iconStyle="solid" size={12} color="#fff" />
            <Text style={styles.addToggleText}>Add Trusted Domain</Text>
          </Pressable>
        )}

        <Pressable onPress={onOpenTest} style={styles.testBtn}>
          <FontAwesome6 name="gauge-high" iconStyle="solid" size={14} color={colors.orange} />
          <Text style={styles.testBtnText}>Test Connections</Text>
          <FontAwesome6 name="chevron-right" iconStyle="solid" size={12} color="rgba(255,255,255,0.3)" />
        </Pressable>

        <View style={styles.policyRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.policyTitle}>Allow trusted services during VPN reconnect</Text>
            <Text style={styles.policySubtitle}>
              With Kill Switch on, a dropped VPN normally blocks everything. Enabling this lets only the services above use a
              fallback route while Royal-VPN reconnects — everything else stays blocked.
            </Text>
          </View>
          <Toggle value={allowDuringReconnect} onToggle={onToggleReconnectPolicy} />
        </View>

        {auditLog.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>RECENT CHANGES</Text>
            <View style={styles.auditCard}>
              {auditLog.slice(0, 8).map((entry, i, arr) => (
                <View key={entry.id} style={[styles.auditRow, i < arr.length - 1 && styles.rowBorder]}>
                  <FontAwesome6 name="clock" iconStyle="solid" size={12} color="rgba(255,255,255,0.45)" />
                  <Text style={styles.auditLabel} numberOfLines={1}>
                    {entry.label}
                  </Text>
                  <Text style={styles.auditTime}>{formatRelativeTime(entry.time)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 24 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.surface06, borderRadius: 16, padding: 14, marginBottom: 16 },
  infoIcon: { marginTop: 2 },
  infoText: { flex: 1, fontFamily: font.regular, fontSize: 12, color: colors.textFaint6, lineHeight: 17 },
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  statusDot: { width: 8, height: 8, borderRadius: 9999 },
  serviceName: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  serviceDomain: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  trashBtn: { paddingLeft: 4 },
  confirmText: { flex: 1, fontFamily: font.medium, fontSize: 13, color: '#fff' },
  cancelText: { fontFamily: font.semibold, fontSize: 12, color: colors.textFaint6, paddingVertical: 6, paddingHorizontal: 8 },
  removeText: { fontFamily: font.semibold, fontSize: 12, color: colors.red, paddingVertical: 6, paddingHorizontal: 8 },
  addCard: { backgroundColor: colors.surface05, borderRadius: 16, padding: 16, marginBottom: 16 },
  addTitle: { fontFamily: font.semibold, fontSize: 14, color: '#fff', marginBottom: 12 },
  input: {
    fontFamily: font.regular,
    fontSize: 14,
    color: '#fff',
    backgroundColor: colors.surface06,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.orange, borderColor: colors.orange },
  checkboxLabel: { flex: 1, fontFamily: font.regular, fontSize: 12, color: colors.textFaint7 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(234,179,8,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  warningIcon: { marginTop: 2 },
  warningText: { flex: 1, fontFamily: font.regular, fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  errorText: { fontFamily: font.regular, fontSize: 12, color: colors.red, marginBottom: 12 },
  formActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: colors.surface08, borderRadius: 9999, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  addBtn: { flex: 1, backgroundColor: colors.orange, borderRadius: 9999, paddingVertical: 10, alignItems: 'center' },
  addBtnText: { fontFamily: font.semibold, fontSize: 14, color: '#000' },
  addToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface06,
    borderRadius: 9999,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addToggleText: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface06,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  testBtnText: { flex: 1, fontFamily: font.semibold, fontSize: 13, color: '#fff' },
  policyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface05, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 18 },
  policyTitle: { fontFamily: font.semibold, fontSize: 14, color: '#fff' },
  policySubtitle: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45, marginTop: 4, lineHeight: 15 },
  sectionTitle: { fontFamily: font.bold, fontSize: 11, color: colors.textFaint5, letterSpacing: 0.5, marginBottom: 8 },
  auditCard: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden' },
  auditRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  auditLabel: { flex: 1, fontFamily: font.medium, fontSize: 12.5, color: '#fff' },
  auditTime: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45 },
});
