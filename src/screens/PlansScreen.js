import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BackHeader from '../components/BackHeader';
import { subscriptionPlans } from '../data';
import { colors, font } from '../theme';

export default function PlansScreen({ currentPlanId, onSelectPlan, onBack }) {
  return (
    <View>
      <BackHeader title="Manage Subscription" onBack={onBack} />
      <View style={styles.container}>
        <Text style={styles.subtitle}>Choose the plan that fits how you use Royal-VPN.</Text>

        {subscriptionPlans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const Wrapper = isCurrent ? LinearGradient : View;
          const wrapperProps = isCurrent
            ? { colors: [colors.blue, colors.orange], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
            : {};
          return (
            <Wrapper key={plan.id} style={[styles.card, !isCurrent && styles.cardPlain]} {...wrapperProps}>
              <View style={styles.cardHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
              </View>
              <Text style={styles.price}>
                {plan.price}
                <Text style={styles.period}>{plan.period}</Text>
              </Text>
              {plan.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <FontAwesome6 name="check" iconStyle="solid" size={12} color={isCurrent ? '#fff' : colors.green} />
                  <Text style={[styles.featureText, isCurrent && { color: '#fff' }]}>{f}</Text>
                </View>
              ))}
              {!isCurrent && (
                <Pressable onPress={() => onSelectPlan(plan.id)} style={styles.selectBtn}>
                  <Text style={styles.selectBtnText}>
                    {subscriptionPlans.findIndex((p) => p.id === plan.id) >
                    subscriptionPlans.findIndex((p) => p.id === currentPlanId)
                      ? 'Upgrade'
                      : 'Switch to ' + plan.name}
                  </Text>
                </Pressable>
              )}
            </Wrapper>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, marginBottom: 18 },
  card: { borderRadius: 18, padding: 18, marginBottom: 14 },
  cardPlain: { backgroundColor: colors.surface05 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  planName: { fontFamily: font.extrabold, fontSize: 18, color: '#fff' },
  currentBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  currentBadgeText: { fontFamily: font.bold, fontSize: 9, color: '#fff', letterSpacing: 0.5 },
  price: { fontFamily: font.extrabold, fontSize: 24, color: '#fff', marginBottom: 14 },
  period: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint6 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureText: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint7 },
  selectBtn: {
    marginTop: 8,
    backgroundColor: colors.orange,
    borderRadius: 9999,
    paddingVertical: 11,
    alignItems: 'center',
  },
  selectBtnText: { fontFamily: font.bold, fontSize: 14, color: '#000' },
});
