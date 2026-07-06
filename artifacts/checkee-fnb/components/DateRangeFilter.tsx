import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export function formatVNDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function parseVNDate(str: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
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

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
}

export default function DateRangeFilter({ value, onChange, placeholder = 'Chọn khoảng ngày' }: DateRangeFilterProps) {
  const colors = useColors();
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value.start ?? new Date());

  const { start: rangeStart, end: rangeEnd } = value;
  const hasRange = rangeStart !== null;

  const rangeLabel = rangeStart
    ? `${formatVNDate(rangeStart)} - ${formatVNDate(rangeEnd ?? rangeStart)}`
    : placeholder;

  const calendarDays = useMemo(() => buildCalendarGrid(viewDate), [viewDate]);

  const goPrevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDayPress = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      onChange({ start: date, end: null });
    } else if (date < rangeStart) {
      onChange({ start: date, end: rangeStart });
    } else {
      onChange({ start: rangeStart, end: date });
    }
  };

  const clearFilter = () => onChange({ start: null, end: null });

  return (
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
  );
}

const styles = StyleSheet.create({
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
});
