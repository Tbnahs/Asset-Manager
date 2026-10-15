import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DateRangeFilter, { DateRange, parseVNDate } from '@/components/DateRangeFilter';
import ZoomableImage from '@/components/ZoomableImage';
import SamplePhotoGallery from '@/components/SamplePhotoGallery';
import { SamplerRecord, useSampler } from '@/contexts/SamplerContext';
import { MEALS, SAMPLE_RETENTIONS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { MealSession, SampleRetention } from '@/types';

const STATUS_CONFIG = {
  active:   { label: 'Đang bảo quản', color: '#34C759', bg: '#E8F9ED', icon: 'shield'         as const },
  expired:  { label: 'Hết hạn lưu',   color: '#FF9500', bg: '#FFF4E5', icon: 'alert-triangle' as const },
  disposed: { label: 'Đã tiêu hủy',   color: '#8E8E93', bg: '#F5F6FA', icon: 'trash-2'        as const },
  future:   { label: 'Chưa lấy mẫu',  color: '#8E8E93', bg: '#F5F6FA', icon: 'clock'          as const },
};

const SESSION_BY_MEAL = new Map(MEALS.map((meal) => [meal.id, meal.session]));

function toSampleDateISO(storedDate: string) {
  const [day, month, year] = storedDate.split('/').map(Number);
  return year && month && day
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : undefined;
}

function recordToSample(record: SamplerRecord): SampleRetention {
  const expiresAt = record.expiresAt ? new Date(record.expiresAt) : undefined;
  const formatDate = (date: Date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  return {
    id: record.id,
    mealId: record.mealId,
    mealName: record.mealName,
    image: record.mealImage,
    storedDate: record.recordedAt.slice(0, 10),
    storedTime: record.recordedAt.slice(-5),
    expiryDate: expiresAt ? formatDate(expiresAt) : '—',
    expiryTime: expiresAt
      ? `${String(expiresAt.getHours()).padStart(2, '0')}:${String(expiresAt.getMinutes()).padStart(2, '0')}`
      : '—',
    status: expiresAt && expiresAt.getTime() <= Date.now() ? 'expired' : 'active',
    storageLocation: record.storageLocation ?? '—',
    sampleCount: record.sampleCount ?? 1,
    isOnMenu: true,
  };
}

export default function SampleRetentionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const { records } = useSampler();

  const allSamples = useMemo(() => {
    const matchedKeys = new Set<string>();
    const mockBacked = SAMPLE_RETENTIONS.map((sample) => {
      const date = toSampleDateISO(sample.storedDate);
      const matchingRecords = date
        ? records.filter((record) => record.mealId === sample.mealId && record.recordedDate === date)
        : [];
      if (date && matchingRecords.length) matchedKeys.add(`${sample.mealId}:${date}`);
      return { sample, records: matchingRecords, date: date ?? '' };
    });

    const additionalRecords = records
      .filter((record) => !matchedKeys.has(`${record.mealId}:${record.recordedDate}`))
      .map((record) => ({
        sample: recordToSample(record),
        records: [record],
        date: record.recordedDate,
      }));

    return [...mockBacked, ...additionalRecords];
  }, [records]);

  const activeCount  = allSamples.filter(({ sample }) => sample.status === 'active').length;
  const expiredCount = allSamples.filter(({ sample }) => sample.status === 'expired').length;
  const futureCount  = allSamples.filter(({ sample }) => sample.status === 'future').length;

  const filteredSamples = useMemo(() => {
    if (!range.start) return allSamples;
    const from = range.start;
    const to = range.end ?? range.start;
    const lo = from <= to ? from : to;
    const hi = from <= to ? to : from;
    return allSamples.filter(({ sample }) => {
      const d = parseVNDate(sample.storedDate);
      if (!d) return false;
      return d >= new Date(lo.getFullYear(), lo.getMonth(), lo.getDate())
        && d <= new Date(hi.getFullYear(), hi.getMonth(), hi.getDate(), 23, 59, 59);
    });
  }, [allSamples, range]);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mẫu lưu bảo quản</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isWeb ? 34 : insets.bottom + 24 },
        ]}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.safeGreenLight }]}>
            <Text style={[styles.statNum, { color: colors.safeGreen }]}>{activeCount}</Text>
            <Text style={[styles.statLabel, { color: colors.safeGreen }]}>Đang bảo quản</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF4E5' }]}>
            <Text style={[styles.statNum, { color: '#FF9500' }]}>{expiredCount}</Text>
            <Text style={[styles.statLabel, { color: '#FF9500' }]}>Hết hạn lưu</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.muted }]}>
            <Text style={[styles.statNum, { color: colors.mutedForeground }]}>{futureCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Chưa lấy mẫu</Text>
          </View>
        </View>

        {/* Info box */}
        <View style={[styles.infoBox, { backgroundColor: colors.infoLight }]}>
          <Feather name="info" size={15} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.info }]}>
            Tất cả món ăn đều phải lưu mẫu. Thời gian bảo quản tối thiểu 24–72 giờ sau khi phục vụ theo quy định ATTP.
          </Text>
        </View>

        {/* Filter bar */}
        <DateRangeFilter value={range} onChange={setRange} placeholder="Chọn khoảng ngày lưu mẫu" />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          TẤT CẢ MẪU LƯU ({filteredSamples.length})
        </Text>

        {filteredSamples.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Feather name="search" size={22} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Không có mẫu lưu nào trong khoảng ngày đã chọn
            </Text>
          </View>
        )}

        {filteredSamples.map(({ sample, records: sampleRecords, date }) => {
          const status = STATUS_CONFIG[sample.status];
          const session = SESSION_BY_MEAL.get(sample.mealId) as MealSession | undefined;
          return (
            <View key={sample.id} style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.cardTop}>
                <ZoomableImage source={sample.image} style={styles.mealImage} resizeMode="cover" />
                <View style={styles.cardMain}>
                  <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
                    {sample.mealName}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Feather name={status.icon} size={11} color={status.color} />
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                    <View style={[styles.menuBadge, sample.isOnMenu
                      ? { backgroundColor: colors.infoLight }
                      : { backgroundColor: colors.muted }]}>
                      <Text style={[styles.menuBadgeText, sample.isOnMenu
                        ? { color: colors.info }
                        : { color: colors.mutedForeground }]}>
                        {sample.isOnMenu ? 'Theo thực đơn' : 'Ngoài thực đơn'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconWrap, { backgroundColor: colors.muted }]}>
                    <Feather name="calendar" size={12} color={colors.mutedForeground} />
                  </View>
                  <View>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Ngày lưu mẫu</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {sample.storedDate} {sample.storedTime}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconWrap, { backgroundColor: colors.muted }]}>
                    <Feather name="clock" size={12} color={colors.mutedForeground} />
                  </View>
                  <View>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Hạn bảo quản</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: sample.status === 'expired' ? '#FF9500' : colors.text },
                      ]}
                    >
                      {sample.expiryDate} {sample.expiryTime}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconWrap, { backgroundColor: colors.muted }]}>
                    <Feather name="archive" size={12} color={colors.mutedForeground} />
                  </View>
                  <View>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Vị trí lưu</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{sample.storageLocation}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconWrap, { backgroundColor: colors.muted }]}>
                    <Feather name="layers" size={12} color={colors.mutedForeground} />
                  </View>
                  <View>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Số mẫu</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{sample.sampleCount} mẫu</Text>
                  </View>
                </View>
              </View>
              {session && (
                <SamplePhotoGallery
                  compact
                  mealId={sample.mealId}
                  mealName={sample.mealName}
                  session={session}
                  date={date}
                  records={sampleRecords}
                  fallbackSample={sample}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
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
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statNum: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
  },
  infoText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: -4,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealImage: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#f0f0f0' },
  cardMain: { flex: 1, gap: 6 },
  mealName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  menuBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  menuBadgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  divider: { height: StyleSheet.hairlineWidth },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '46%' },
  detailIconWrap: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  detailLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  detailValue: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 1 },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 32,
    borderRadius: 14,
  },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
