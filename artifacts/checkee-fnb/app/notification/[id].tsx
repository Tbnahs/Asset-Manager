import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NOTIFICATIONS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { AppNotification } from '@/types';

const TYPE_CONFIG: Record<
  AppNotification['type'],
  { label: string; icon: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }
> = {
  menu:      { label: 'Thực đơn',   icon: 'list',           color: '#007AFF', bg: '#E5F1FF' },
  safety:    { label: 'ATTP',       icon: 'shield',         color: '#FF3B30', bg: '#FFEBEA' },
  complaint: { label: 'Phản ánh',   icon: 'message-circle', color: '#FF9500', bg: '#FFF4E5' },
  school:    { label: 'Trường học', icon: 'book-open',      color: '#8B5CF6', bg: '#F3EEFF' },
};

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const notif = NOTIFICATIONS.find((n) => n.id === id);

  if (!notif) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: isWeb ? 67 : insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
        <View style={styles.notFound}>
          <Feather name="bell-off" size={36} color={colors.mutedForeground} />
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
            Không tìm thấy thông báo
          </Text>
        </View>
      </View>
    );
  }

  const cfg = TYPE_CONFIG[notif.type];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: isWeb ? 67 : insets.top,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Chi tiết thông báo
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isWeb ? 34 : insets.bottom + 32 },
        ]}
      >
        {/* ── Type + title block ── */}
        <View style={[styles.titleCard, { backgroundColor: cfg.bg }]}>
          <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22' }]}>
            <Feather name={cfg.icon} size={26} color={cfg.color} />
          </View>
          <View style={[styles.typePill, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '40' }]}>
            <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={[styles.notifTitle, { color: '#1C1C1E' }]}>{notif.title}</Text>
          <View style={styles.metaRow}>
            <Feather name="clock" size={12} color={cfg.color} />
            <Text style={[styles.metaDate, { color: cfg.color }]}>{notif.createdAt}</Text>
            {notif.isRead ? (
              <>
                <View style={[styles.metaDot, { backgroundColor: cfg.color + '60' }]} />
                <Text style={[styles.metaRead, { color: cfg.color + 'AA' }]}>Đã đọc</Text>
              </>
            ) : (
              <>
                <View style={[styles.metaDot, { backgroundColor: cfg.color }]} />
                <Text style={[styles.metaRead, { color: cfg.color }]}>Chưa đọc</Text>
              </>
            )}
          </View>
        </View>

        {/* ── Illustration ── */}
        {notif.image && (
          <Image
            source={notif.image}
            style={styles.illustration}
            resizeMode="cover"
          />
        )}

        {/* ── Summary ── */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Feather name="align-left" size={14} color={cfg.color} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tóm tắt</Text>
          </View>
          <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
            {notif.message}
          </Text>
        </View>

        {/* ── Full body ── */}
        {notif.body ? (
          <View style={[styles.bodyCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="file-text" size={14} color={cfg.color} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nội dung chi tiết</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.bodyText, { color: colors.text }]}>{notif.body}</Text>
          </View>
        ) : null}

        {/* ── Action button based on type ── */}
        <ActionButton type={notif.type} color={cfg.color} />
      </ScrollView>
    </View>
  );
}

function ActionButton({
  type,
  color,
}: {
  type: AppNotification['type'];
  color: string;
}) {
  if (type === 'menu') {
    return (
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: color }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/' as any)}
      >
        <Feather name="list" size={16} color="#fff" />
        <Text style={styles.actionBtnText}>Xem thực đơn</Text>
        <Feather name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>
    );
  }
  if (type === 'complaint') {
    return (
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: color }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/feedback' as any)}
      >
        <Feather name="message-circle" size={16} color="#fff" />
        <Text style={styles.actionBtnText}>Xem lịch sử phản ánh</Text>
        <Feather name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'center' },

  content: { padding: 16, gap: 12 },

  /* Title card */
  titleCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  notifTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    lineHeight: 28,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaDate: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  metaDot: { width: 4, height: 4, borderRadius: 2 },
  metaRead: { fontSize: 12, fontFamily: 'Inter_400Regular' },

  illustration: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },

  /* Summary */
  summaryCard: {
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  /* Body */
  bodyCard: {
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth },
  summaryText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  bodyText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 24 },

  /* Action button */
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },
  actionBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'center' },

  /* Not found */
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  notFoundText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
});
