import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SamplerRecord } from '@/contexts/SamplerContext';
import { useColors } from '@/hooks/useColors';
import { MealSession, SampleRetention } from '@/types';

const SESSION_LABEL: Record<MealSession, string> = {
  sang: 'Sáng',
  trua: 'Trưa',
  chieu: 'Chiều',
  phu: 'Phụ',
};

function formatDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function getRecordedTime(record: SamplerRecord) {
  const match = record.recordedAt.match(/(\d{2}:\d{2})$/);
  return match?.[1] ?? '—';
}

function getRecordStatus(record: SamplerRecord) {
  const expiresAt = record.expiresAt
    ? new Date(record.expiresAt)
    : undefined;
  if (!expiresAt) return 'Đang theo dõi';
  return expiresAt.getTime() > Date.now()
    ? `Đang theo dõi (đến ${formatDate(expiresAt)})`
    : `Đã hết hạn (${formatDate(expiresAt)})`;
}

function getFallbackStatus(sample?: SampleRetention) {
  if (!sample) return 'Chưa có thông tin lưu mẫu';
  if (sample.status === 'active') return `Đang theo dõi (đến ${sample.expiryDate})`;
  if (sample.status === 'expired') return `Đã hết hạn (${sample.expiryDate})`;
  if (sample.status === 'disposed') return 'Đã tiêu hủy';
  return 'Chưa lấy mẫu';
}

export function recordPhotos(record: SamplerRecord) {
  if (record.photoUris?.length) return record.photoUris;
  return record.photoUri ? [record.photoUri] : [];
}

export default function SamplePhotoGallery({
  mealId,
  mealName,
  session,
  date,
  records,
  fallbackSample,
  compact = false,
  showRetentionLink = false,
}: {
  mealId: string;
  mealName: string;
  session: MealSession;
  date: string;
  records: SamplerRecord[];
  fallbackSample?: SampleRetention;
  compact?: boolean;
  showRetentionLink?: boolean;
}) {
  const colors = useColors();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const latestRecord = useMemo(
    () => [...records].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0],
    [records],
  );
  const photos = useMemo(() => records.flatMap(recordPhotos), [records]);
  const dateLabel = latestRecord
    ? `${getRecordedTime(latestRecord)}, ${latestRecord.recordedAt.slice(0, 10)}`
    : fallbackSample && fallbackSample.storedDate !== '—'
      ? `${fallbackSample.storedTime}, ${fallbackSample.storedDate}`
      : 'Chưa ghi nhận thời gian lưu mẫu';
  const statusLabel = latestRecord
    ? getRecordStatus(latestRecord)
    : getFallbackStatus(fallbackSample);

  return (
    <View
      style={[
        styles.container,
        compact && styles.compactContainer,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.heading}>
        <Feather name="image" size={14} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Hình ảnh thực tế</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>{photos.length} ảnh</Text>
        </View>
      </View>

      {photos.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
        >
          {photos.map((uri, index) => (
            <TouchableOpacity
              key={`${uri}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Phóng to ảnh khay lưu mẫu ${index + 1}`}
              onPress={() => setSelectedPhoto(uri)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri }}
                resizeMode="cover"
                style={[styles.photo, compact && styles.compactPhoto]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.empty, { backgroundColor: colors.muted }]}>
          <Feather name="image" size={14} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Chưa có hình ảnh lưu mẫu
          </Text>
        </View>
      )}

      <Text style={[styles.mealLabel, { color: colors.mutedForeground }]}>
        {SESSION_LABEL[session]} · {mealName}
      </Text>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {dateLabel}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather
            name={latestRecord ? 'shield' : 'info'}
            size={12}
            color={latestRecord ? colors.safeGreen : colors.mutedForeground}
          />
          <Text
            style={[
              styles.detailText,
              { color: latestRecord ? colors.safeGreen : colors.mutedForeground },
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      {showRetentionLink && (
        <TouchableOpacity
          accessibilityRole="link"
          onPress={() =>
            router.push({
              pathname: '/sample-retention/[mealId]',
              params: { mealId, date },
            } as any)
          }
          style={styles.link}
          activeOpacity={0.7}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>Xem trong Lưu mẫu</Text>
          <Feather name="arrow-up-right" size={13} color={colors.primary} />
        </TouchableOpacity>
      )}

      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.viewer}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Đóng ảnh"
            onPress={() => setSelectedPhoto(null)}
            style={styles.closeButton}
          >
            <Feather name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              resizeMode="contain"
              style={styles.fullPhoto}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  compactContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 9,
    gap: 6,
    borderRadius: 10,
  },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  countBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  photoList: { gap: 8 },
  photo: { width: 120, height: 92, borderRadius: 8, backgroundColor: '#f0f0f0' },
  compactPhoto: { width: 72, height: 58 },
  empty: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  emptyText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  mealLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  details: { gap: 5 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 10, fontFamily: 'Inter_400Regular', flexShrink: 1 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingTop: 2 },
  linkText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  viewer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullPhoto: { width: '100%', height: '82%' },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 18,
    zIndex: 1,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
