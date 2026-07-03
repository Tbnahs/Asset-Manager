import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '@/components/Header';
import { MEALS, TRACEABILITY_RECORDS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { isMonitoringActive } from '@/utils/monitoring';

type FilterMode = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

function parseCookDate(cookTime: string): Date | null {
  // cookTime format: "HH:MM DD/MM/YYYY"
  const match = cookTime.match(/(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

function isSameWeek(d1: Date, d2: Date) {
  const startOfWeek = (d: Date) => {
    const clone = new Date(d);
    const day = clone.getDay();
    const diff = clone.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(clone.setDate(diff));
  };
  const s1 = startOfWeek(d1);
  const s2 = startOfWeek(d2);
  return isSameDay(s1, s2);
}

function isSameMonth(d1: Date, d2: Date) {
  return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

function isSameYear(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear();
}

const FILTER_CONFIG: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'year', label: 'Năm nay' },
];

export default function TraceabilityScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const [filter, setFilter] = useState<FilterMode>('all');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const today = new Date();

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return TRACEABILITY_RECORDS;
    return TRACEABILITY_RECORDS.filter((r) => {
      const d = parseCookDate(r.cookTime);
      if (!d) return false;
      switch (filter) {
        case 'today': return isSameDay(d, today);
        case 'week': return isSameWeek(d, today);
        case 'month': return isSameMonth(d, today);
        case 'year': return isSameYear(d, today);
        case 'custom': return customDate ? isSameDay(d, customDate) : true;
        default: return true;
      }
    });
  }, [filter, customDate]);

  const onPickerChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) {
      setCustomDate(selected);
      setFilter('custom');
    }
  };

  const customLabel = customDate
    ? customDate.toLocaleDateString('vi-VN')
    : 'Chọn ngày';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}>

        <Text style={[styles.pageTitle, { color: colors.text }]}>Danh sách món ăn lưu mẫu</Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          Thông tin nguồn gốc & quy trình chế biến thực phẩm
        </Text>

        {/* Filter bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}>
          {FILTER_CONFIG.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            key="custom"
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
            style={[
              styles.filterChip,
              styles.dateFilterChip,
              {
                backgroundColor: filter === 'custom' ? colors.primary : colors.card,
                borderColor: filter === 'custom' ? colors.primary : colors.border,
              },
            ]}>
            <Feather
              name="calendar"
              size={13}
              color={filter === 'custom' ? '#fff' : colors.mutedForeground}
            />
            <Text
              style={[
                styles.filterChipText,
                { color: filter === 'custom' ? '#fff' : colors.text },
              ]}>
              {customLabel}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {showDatePicker && (
          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerHeaderText, { color: colors.text }]}>Chọn ngày</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.pickerDoneBtn}>
                <Text style={[styles.pickerDoneText, { color: colors.primary }]}>Xong</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={customDate ?? today}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickerChange}
              locale="vi-VN"
              themeVariant="light"
            />
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          DANH SÁCH TRUY XUẤT ({filteredRecords.length})
        </Text>

        {filteredRecords.map((record) => (
          <TouchableOpacity
            key={record.id}
            onPress={() => router.push(`/traceability/${record.id}` as any)}
            style={[styles.card, { backgroundColor: colors.card }]}
            activeOpacity={0.72}>
            {/* Orange top stripe with trace code */}
            <View style={[styles.cardStripe, { backgroundColor: colors.primary }]}>
              <Feather name="home" size={11} color="rgba(255,255,255,0.8)" />
              <Text style={styles.stripeCode} numberOfLines={1}>{record.traceCode}</Text>
              {(() => {
                const meal = MEALS.find(m => m.id === record.mealId);
                const active = record.isMonitored && isMonitoringActive(meal?.monitoredUntil);
                return (
                  <View style={[styles.monitoredBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <View style={[styles.monitoredDot, { backgroundColor: active ? '#34C759' : 'rgba(255,255,255,0.5)' }]} />
                    <Text style={styles.monitoredText}>{active ? 'Đang theo dõi' : 'Ngưng hoạt động'}</Text>
                  </View>
                );
              })()}
            </View>

            {/* Card body */}
            <View style={styles.cardBody}>
              <Image source={record.image} style={styles.mealImage} resizeMode="cover" />
              <View style={styles.cardInfo}>
                <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
                  {record.mealName}
                </Text>
                <Text style={[styles.mealType, { color: colors.mutedForeground }]}>
                  {record.mealTypeCategory}
                </Text>

                {/* Chef + process row */}
                <View style={styles.metaRow}>
                  <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                    <Feather name="user" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {record.chefName}
                    </Text>
                  </View>
                  <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                    <Feather name="hash" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {record.processCode}
                    </Text>
                  </View>
                </View>

                {/* Ingredients preview */}
                <View style={styles.ingRow}>
                  {record.traceIngredients.slice(0, 3).map((ing) => (
                    <View key={ing.name} style={[styles.ingChip, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.ingChipText, { color: colors.primary }]}>
                        {ing.name}
                      </Text>
                    </View>
                  ))}
                  {record.traceIngredients.length > 3 && (
                    <View style={[styles.ingChip, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.ingChipText, { color: colors.mutedForeground }]}>
                        +{record.traceIngredients.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Footer stats */}
            <View style={[styles.cardFooter, { backgroundColor: colors.muted, borderTopColor: colors.border }]}>
              <View style={styles.statItem}>
                <Feather name="eye" size={11} color={colors.mutedForeground} />
                <Text style={[styles.statText, { color: colors.mutedForeground }]}>
                  Tổng quét: <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{record.totalScans}</Text>
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Feather name="clock" size={11} color={colors.mutedForeground} />
                <Text style={[styles.statText, { color: colors.mutedForeground }]}>
                  Hôm nay: <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{record.todayScans}</Text>
                </Text>
              </View>
              <View style={styles.viewMore}>
                <Text style={[styles.viewMoreText, { color: colors.primary }]}>Chi tiết</Text>
                <Feather name="chevron-right" size={12} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredRecords.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Không có món ăn lưu mẫu trong khoảng thời gian này
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  pageTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },

  filterBar: { flexDirection: 'row', gap: 8, paddingBottom: 16 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  dateFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  pickerContainer: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  pickerHeaderText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  pickerDoneBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  pickerDoneText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 12 },

  card: {
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  cardStripe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stripeCode: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.4,
  },
  monitoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  monitoredDot: { width: 6, height: 6, borderRadius: 3 },
  monitoredText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_500Medium' },

  cardBody: { flexDirection: 'row', padding: 12, gap: 12, alignItems: 'flex-start' },
  mealImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#f0f0f0', flexShrink: 0 },
  cardInfo: { flex: 1, gap: 5 },
  mealName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  mealType: { fontSize: 12, fontFamily: 'Inter_400Regular' },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  metaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  metaText: { fontSize: 10, fontFamily: 'Inter_400Regular' },

  ingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  ingChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  ingChipText: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1, height: 14, marginHorizontal: 4 },
  viewMore: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  viewMoreText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
