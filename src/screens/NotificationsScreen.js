import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Pressable from '../components/Pressable';
import BackHeader from '../components/BackHeader';
import { formatRelativeTime } from '../utils';
import { colors, font } from '../theme';

export default function NotificationsScreen({ notifications, onMarkRead, onMarkAllRead, onBack }) {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <View>
      <BackHeader title="Notifications" onBack={onBack} />
      <View style={styles.container}>
        {hasUnread && (
          <Pressable onPress={onMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        )}

        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>You're all caught up.</Text>
        ) : (
          <View style={styles.card}>
            {notifications.map((n, i) => (
              <Pressable
                key={n.id}
                onPress={() => onMarkRead(n.id)}
                style={[styles.row, i < notifications.length - 1 && styles.rowBorder]}
              >
                {!n.read && <View style={styles.unreadDot} />}
                <FontAwesome6 name={n.icon} iconStyle="solid" size={15} color={n.color} style={styles.rowIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, !n.read && styles.titleUnread]}>{n.title}</Text>
                  {n.subtitle ? <Text style={styles.subtitle}>{n.subtitle}</Text> : null}
                </View>
                <Text style={styles.time}>{formatRelativeTime(n.time)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  markAllBtn: { alignSelf: 'flex-end', marginBottom: 12 },
  markAllText: { fontFamily: font.semibold, fontSize: 12, color: colors.orange },
  emptyText: { fontFamily: font.regular, fontSize: 13, color: colors.textFaint5, textAlign: 'center', paddingVertical: 24 },
  card: { backgroundColor: colors.surface05, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface08 },
  unreadDot: { width: 6, height: 6, borderRadius: 9999, backgroundColor: colors.orange, marginTop: 6 },
  rowIcon: { width: 18, textAlign: 'center', marginTop: 1 },
  title: { fontFamily: font.medium, fontSize: 13.5, color: colors.textFaint7 },
  titleUnread: { fontFamily: font.semibold, color: '#fff' },
  subtitle: { fontFamily: font.regular, fontSize: 12, color: colors.textFaint5, marginTop: 2 },
  time: { fontFamily: font.regular, fontSize: 11, color: colors.textFaint45, marginTop: 1 },
});
