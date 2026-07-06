import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '@/components/Header';
import { useColors } from '@/hooks/useColors';
import { useNotifications } from '@/contexts/NotificationsContext';
import { AppNotification } from '@/types';

const TYPE_CONFIG: Record<AppNotification['type'], { label: string; icon: string; color: string; bg: string }> = {
  menu: { label: 'Thực đơn', icon: 'list', color: '#007AFF', bg: '#E5F1FF' },
  safety: { label: 'ATTP', icon: 'shield', color: '#FF3B30', bg: '#FFEBEA' },
  complaint: { label: 'Phản ánh', icon: 'message-circle', color: '#FF9500', bg: '#FFF4E5' },
  school: { label: 'Trường học', icon: 'book-open', color: '#8B5CF6', bg: '#F3EEFF' },
};

export default function NotificationsScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Thông báo</Text>
            {unreadCount > 0 && (
              <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
                {unreadCount} thông báo chưa đọc
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Không có thông báo nào
            </Text>
          </View>
        ) : (
          notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type];
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => { markRead(n.id); router.push(`/notification/${n.id}` as any); }}
                activeOpacity={0.75}
                style={[
                  styles.card,
                  { backgroundColor: colors.card },
                  !n.isRead && { borderLeftWidth: 3, borderLeftColor: colors.primary },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Feather name={cfg.icon as any} size={18} color={cfg.color} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <View style={[styles.typePill, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.notifMsg, { color: colors.mutedForeground }]} numberOfLines={3}>
                    {n.message}
                  </Text>
                  <Text style={[styles.notifDate, { color: colors.mutedForeground }]}>
                    {n.createdAt}
                  </Text>
                </View>
                {!n.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  pageTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  pageSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  markAllText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 14 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 4 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', flex: 1 },
  typePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  typeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  notifMsg: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  notifDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
});
