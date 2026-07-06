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

import ZoomableImage from '@/components/ZoomableImage';
import { SAMPLE_RETENTIONS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const STATUS_CONFIG = {
  active:   { label: 'Đang bảo quản', color: '#34C759', bg: '#E8F9ED', icon: 'shield'         as const },
  expired:  { label: 'Hết hạn lưu',   color: '#FF9500', bg: '#FFF4E5', icon: 'alert-triangle' as const },
  disposed: { label: 'Đã tiêu hủy',   color: '#8E8E93', bg: '#F5F6FA', icon: 'trash-2'        as const },
  future:   { label: 'Chưa lấy mẫu',  color: '#8E8E93', bg: '#F5F6FA', icon: 'clock'          as const },
};

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function parseVNDate(str: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function formatVNDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type DayCell = { date: Date; inMonth: boolean };

function buildCalendarGrid(viewDate: Date): DayCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const gridStart = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}

export default function SampleRetentionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const [filterOpen, setFilterOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const activeCount  = SAMPLE_RETENTIONS.filter((s) => s.status === 'active').length;
  const expiredCount = SAMPLE_RETENTIONS.filter((s) => s.status === 'expired').length;
  const futureCount  = SAMPLE_RETENTIONS.filter((s) => s.status === 'future').length;

  const hasRange = rangeStart !== null;

  const filteredSamples = useMemo(() => {
    if (!rangeStart) return SAMPLE_RETENTIONS;
    const from = rangeStart;
    const to = rangeEnd ?? rangeStart;
    const lo = from <= to ? from : to;
    const hi = from <= to ? to : from;
    return SAMPLE_RETENTIONS.filter((sample) => {
      const d = parseVNDate(sample.storedDate);
      if (!d) return false;
      return d >= new Date(lo.getFullYear(), lo.getMonth(), lo.getDate())
        && d <= new Date(hi.getFullYear(), hi.getMonth(), hi.getDate(), 23, 59, 59);
    });
  }, [rangeStart, rangeEnd]);

  const rangeLabel = rangeStart
    ? `${formatVNDate(rangeStart)} - ${formatVNDate(rangeEnd ?? rangeStart)}`
    : 'Chọn khoảng ngày lưu mẫu';

  const calendarDays = useMemo(() => buildCalendarGrid(viewDate), [viewDate]);

  const goPrevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDayPress = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else if (date < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(date);
    } else {
      setRangeEnd(date);
    }
  };

  const clearFilter = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

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
        <View style={styles.filterWrap}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterOpen((v) => !v)}
            style={[
              styles.dateInput,
              {
                backgroundColor: colors.card,
                borderColor: filterOpen ? '#0095E6' : colors.border,
              },
              filterOpen && styles.dateInputFocused,
            ]}
          >
            <Feather name="calendar" size={16} color={filterOpen ? '#0095E6' : colors.mutedForeground} />
            <Text
              style={[styles.dateInputText, { color: hasRange ? colors.text : colors.mutedForeground }]}
              numberOfLines={1}
            >
              {rangeLabel}
            </Text>
            {hasRange && (
              <TouchableOpacity onPress={clearFilter} hitSlop={8}>
                <Feather name="x" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
            <Feather
              name={filterOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {filterOpen && (
            <View style={[styles.calendarDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.calHeader}>
                <TouchableOpacity onPress={goPrevMonth} hitSlop={8} style={styles.calNavBtn}>
                  <Feather name="chevron-left" size={18} color="#494E50" />
                </TouchableOpacity>
                <Text style={styles.calHeaderText}>
                  {MONTH_LABELS[viewDate.getMonth()]}, {viewDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={goNextMonth} hitSlop={8} style={styles.calNavBtn}>
                  <Feather name="chevron-right" size={18} color="#494E50" />
                </TouchableOpacity>
              </View>

              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((wd) => (
                  <Text key={wd} style={styles.weekdayText}>{wd}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {calendarDays.map((cell) => {
                  const lo = rangeStart && rangeEnd
                    ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd)
                    : rangeStart;
                  const hi = rangeStart && rangeEnd
                    ? (rangeStart <= rangeEnd ? rangeEnd : rangeStart)
                    : rangeStart;
                  const inRange = !!(lo && hi && cell.date >= lo && cell.date <= hi);
                  const isEndpoint = !!(
                    (rangeStart && isSameDay(cell.date, rangeStart)) ||
                    (rangeEnd && isSameDay(cell.date, rangeEnd))
                  );
                  return (
                    <TouchableOpacity
                      key={cell.date.toISOString()}
                      onPress={() => handleDayPress(cell.date)}
                      style={[
                        styles.dayCell,
                        inRange && !isEndpoint && styles.dayCellInRange,
                        isEndpoint && styles.dayCellEndpoint,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !cell.inMonth && styles.dayTextMuted,
                          isEndpoint && styles.dayTextEndpoint,
                        ]}
                      >
                        {cell.date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.calFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={clearFilter}>
                  <Text style={styles.calFooterClear}>Xóa lọc</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.calFooterApplyBtn}
                  onPress={() => setFilterOpen(false)}
                >
                  <Text style={styles.calFooterApplyText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

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

        {filteredSamples.map((sample) => {
          const status = STATUS_CONFIG[sample.status];
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
                    <Text style={[styles.detailValue, { color: colors.text }]}>{sample.storedDate}</Text>
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
                      {sample.expiryDate}
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

  filterWrap: { position: 'relative', zIndex: 10 },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dateInputFocused: {
    shadowColor: 'rgba(32, 162, 232, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3.2,
    elevation: 2,
  },
  dateInputText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  calendarDropdown: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  calNavBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  calHeaderText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#494E50' },
  weekdayRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    borderRadius: 6,
    paddingVertical: 6,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#424242',
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellInRange: { backgroundColor: '#ECF8FF' },
  dayCellEndpoint: { backgroundColor: '#0095E6' },
  dayText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#494E50' },
  dayTextMuted: { color: '#A0A5B6' },
  dayTextEndpoint: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  calFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  calFooterClear: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#8E8E93' },
  calFooterApplyBtn: {
    backgroundColor: '#0095E6',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  calFooterApplyText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 32,
    borderRadius: 14,
  },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
