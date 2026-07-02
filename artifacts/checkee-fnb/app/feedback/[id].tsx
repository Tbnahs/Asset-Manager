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

import { feedbackStore } from '@/data/feedbackStore';
import { useColors } from '@/hooks/useColors';
import { FeedbackItem } from '@/types';

const STATUS_CONFIG: Record<FeedbackItem['status'], { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Feather>['name'] }> = {
  pending:    { label: 'Chờ xử lý',     color: '#FF9500', bg: '#FFF4E5', icon: 'clock' },
  processing: { label: 'Đang xử lý',    color: '#007AFF', bg: '#E5F1FF', icon: 'loader' },
  resolved:   { label: 'Đã giải quyết', color: '#34C759', bg: '#E8F9ED', icon: 'check-circle' },
  rejected:   { label: 'Từ chối',       color: '#FF3B30', bg: '#FFEBEA', icon: 'x-circle' },
};

const COMPLAINT_TYPE_LABEL: Record<FeedbackItem['complaintType'], string> = {
  quality:  'Chất lượng món ăn',
  safety:   'An toàn thực phẩm',
  quantity: 'Định lượng suất ăn',
  hygiene:  'Vệ sinh',
  other:    'Khác',
};

const COMPLAINT_TYPE_COLOR: Record<FeedbackItem['complaintType'], { color: string; bg: string }> = {
  quality:  { color: '#FF9500', bg: '#FFF4E5' },
  safety:   { color: '#FF3B30', bg: '#FFEBEA' },
  quantity: { color: '#007AFF', bg: '#E5F1FF' },
  hygiene:  { color: '#34C759', bg: '#E8F9ED' },
  other:    { color: '#8E8E93', bg: '#F5F6FA' },
};

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const item = feedbackStore.getById(id ?? '');

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: isWeb ? 67 : insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết phản ánh</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Không tìm thấy phản ánh</Text>
        </View>
      </View>
    );
  }

  const status = STATUS_CONFIG[item.status];
  const complaint = COMPLAINT_TYPE_COLOR[item.complaintType];
  const hasSymptoms = item.symptoms &&
    !['không có', 'không có triệu chứng'].includes(item.symptoms.trim().toLowerCase());

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: isWeb ? 67 : insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết phản ánh</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 34 : insets.bottom + 24 }]}
      >
        {/* ── Status banner ── */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <View style={[styles.statusIconWrap, { backgroundColor: status.color + '22' }]}>
            <Feather name={status.icon} size={22} color={status.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusBannerLabel, { color: status.color }]}>Trạng thái phản ánh</Text>
            <Text style={[styles.statusBannerValue, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={[styles.idBadge, { backgroundColor: status.color + '18' }]}>
            <Text style={[styles.idBadgeText, { color: status.color }]}>#{item.id.toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Meal info ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeaderRow}>
            <Feather name="package" size={15} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Thông tin bữa ăn</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Món ăn</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.mealName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Loại phản ánh</Text>
            <View style={[styles.typeBadge, { backgroundColor: complaint.bg }]}>
              <Text style={[styles.typeBadgeText, { color: complaint.color }]}>
                {COMPLAINT_TYPE_LABEL[item.complaintType]}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Ngày gửi</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.submittedAt}</Text>
          </View>
          {item.resolvedAt && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Ngày xử lý</Text>
              <Text style={[styles.infoValue, { color: colors.safeGreen }]}>{item.resolvedAt}</Text>
            </View>
          )}
        </View>

        {/* ── Description ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeaderRow}>
            <Feather name="file-text" size={15} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Nội dung phản ánh</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.descText, { color: colors.text }]}>{item.description}</Text>
        </View>

        {/* ── Symptoms ── */}
        {hasSymptoms && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeaderRow}>
              <Feather name="alert-circle" size={15} color="#FF9500" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Triệu chứng</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.symptomBox, { backgroundColor: '#FFF4E5' }]}>
              <Text style={[styles.symptomText, { color: '#1C1C1E' }]}>{item.symptoms}</Text>
            </View>
          </View>
        )}

        {/* ── Photos ── */}
        {item.photos.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeaderRow}>
              <Feather name="image" size={15} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Hình ảnh đính kèm ({item.photos.length})</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.photoGrid}>
              {item.photos.map((src, i) => (
                <Image key={i} source={typeof src === 'string' ? { uri: src } : src} style={styles.photo} resizeMode="cover" />
              ))}
            </View>
          </View>
        )}

        {/* ── School response ── */}
        {item.response ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeaderRow}>
              <Feather
                name={item.status === 'rejected' ? 'x-circle' : 'check-circle'}
                size={15}
                color={item.status === 'rejected' ? '#FF3B30' : '#34C759'}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Phản hồi từ nhà trường</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.responseBox, {
              backgroundColor: item.status === 'rejected' ? '#FFEBEA' : '#E8F9ED',
              borderColor: item.status === 'rejected' ? '#FFCDD2' : '#B7EFC5',
            }]}>
              <Text style={[styles.responseText, { color: colors.text }]}>{item.response}</Text>
            </View>
          </View>
        ) : (
          /* Awaiting response */
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeaderRow}>
              <Feather name="message-circle" size={15} color={colors.mutedForeground} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Phản hồi từ nhà trường</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.awaitingBox, { backgroundColor: colors.muted }]}>
              <Feather name="clock" size={16} color={colors.mutedForeground} />
              <Text style={[styles.awaitingText, { color: colors.mutedForeground }]}>
                Nhà trường đang xem xét phản ánh. Bạn sẽ nhận được thông báo khi có phản hồi.
              </Text>
            </View>
          </View>
        )}

        {/* ── Timeline ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeaderRow}>
            <Feather name="activity" size={15} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Tiến trình</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Submitted */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>Đã gửi phản ánh</Text>
              <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>{item.submittedAt}</Text>
            </View>
          </View>

          {/* Processing */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, {
              backgroundColor: ['processing', 'resolved', 'rejected'].includes(item.status) ? '#007AFF' : colors.border,
            }]} />
            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, {
                color: ['processing', 'resolved', 'rejected'].includes(item.status) ? colors.text : colors.mutedForeground,
              }]}>Nhà trường tiếp nhận & xử lý</Text>
              {['processing', 'resolved', 'rejected'].includes(item.status) ? null : (
                <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>Đang chờ</Text>
              )}
            </View>
          </View>

          {/* Resolved/Rejected */}
          <View style={[styles.timelineItem, styles.timelineItemLast]}>
            <View style={[styles.timelineDot, {
              backgroundColor: item.status === 'resolved' ? '#34C759'
                : item.status === 'rejected' ? '#FF3B30'
                : colors.border,
            }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, {
                color: ['resolved', 'rejected'].includes(item.status) ? colors.text : colors.mutedForeground,
              }]}>
                {item.status === 'rejected' ? 'Phản ánh bị từ chối' : 'Phản ánh được giải quyết'}
              </Text>
              {item.resolvedAt ? (
                <Text style={[styles.timelineDate, { color: colors.safeGreen }]}>{item.resolvedAt}</Text>
              ) : (
                <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>Đang chờ</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, gap: 12 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 15, fontFamily: 'Inter_400Regular' },

  /* Status banner */
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16,
  },
  statusIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statusBannerLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  statusBannerValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  idBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  idBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },

  /* Card */
  card: {
    borderRadius: 16, padding: 14, gap: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 12 },

  /* Info rows */
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flexShrink: 0 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'right', flex: 1 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  safeGreen: { color: '#34C759' },

  /* Description */
  descText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },

  /* Symptoms */
  symptomBox: { borderRadius: 10, padding: 12 },
  symptomText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },

  /* Photos */
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 96, height: 96, borderRadius: 10, backgroundColor: '#f0f0f0' },

  /* Response */
  responseBox: { borderRadius: 10, padding: 14, borderWidth: 1 },
  responseText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },

  /* Awaiting */
  awaitingBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 10,
  },
  awaitingText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, flex: 1 },

  /* Timeline */
  timelineItem: { flexDirection: 'row', gap: 14, minHeight: 48 },
  timelineItemLast: { minHeight: 0 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3, flexShrink: 0 },
  timelineLine: { position: 'absolute', left: 5.5, top: 15, width: 1, height: '100%' },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 20 },
  timelineDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
