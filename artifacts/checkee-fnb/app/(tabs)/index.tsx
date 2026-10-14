import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import Header from '@/components/Header';
import SummaryCard from '@/components/SummaryCard';
import ZoomableImage from '@/components/ZoomableImage';
import { getMonitoringTag } from '@/utils/monitoring';
import { FEEDBACKS, MEALS, NOTIFICATIONS, SAMPLE_RETENTIONS, TRACEABILITY_RECORDS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { Meal, MealSession } from '@/types';

function sampleLabel(sample: { status: string; storedDate?: string; storedTime?: string } | undefined) {
  if (!sample || sample.status === 'future' || !sample.storedDate || sample.storedDate === '—') {
    return 'Chưa lưu mẫu';
  }
  return `Lưu mẫu: ${sample.storedDate} ${sample.storedTime}`;
}

/* ─── Constants ─────────────────────────────────────────── */
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6'];
const CAL_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const SESSIONS: { key: MealSession; label: string; color: string; bg: string }[] = [
  { key: 'sang',  label: 'Sáng',  color: '#FF9500', bg: '#FFF4E5' },
  { key: 'trua',  label: 'Trưa',  color: '#007AFF', bg: '#E5F1FF' },
  { key: 'chieu', label: 'Chiều', color: '#34C759', bg: '#E8F9ED' },
  { key: 'phu',   label: 'Phụ',   color: '#8B5CF6', bg: '#F3EEFF' },
];


const VN_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const TRAY_PHOTOS = [
  { source: require('../../assets/images/feedback-photo-1.png'), caption: 'Khay thức ăn thực tế 1' },
  { source: require('../../assets/images/feedback-photo-2.png'), caption: 'Khay thức ăn thực tế 2' },
];

/* ─── Helpers ────────────────────────────────────────────── */
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getWeekInfo() {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const daysFromMon = dow === 0 ? 6 : dow - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMon);
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const todayIdx = dow === 0 || dow === 6 ? 4 : dow - 1;
  return { days, todayIndex: Math.min(Math.max(todayIdx, 0), 4), today };
}

function parseFixedDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns meals for a given calendar date: meals with a fixed `date` are
 * matched directly (e.g. a past week added outside the normal rotation),
 * while the rest fall back to matching dayIndex against the current week.
 */
function mealsForDate(date: Date, weekDays: Date[]): Meal[] {
  const fixedMatches = MEALS.filter((m) => m.date && isSameDay(parseFixedDate(m.date), date));
  const idx = weekDays.findIndex((d) => isSameDay(d, date));
  const rotationMatches = idx === -1 ? [] : MEALS.filter((m) => !m.date && m.dayIndex === idx);
  return [...fixedMatches, ...rotationMatches];
}

/** Build calendar grid for a given year/month */
function buildCalendar(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Mon=0 … Sun=6 offset
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const cells: (Date | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ─── Sub-components ──────────────────────────────────────── */
function SessionRows({ dayMeals, colors, onMealPress }: {
  dayMeals: Meal[];
  colors: ReturnType<typeof useColors>;
  onMealPress?: (meal: Meal) => void;
}) {
  if (dayMeals.length === 0) {
    return (
      <View style={[rStyles.emptyBox, { backgroundColor: colors.card }]}>
        <Feather name="coffee" size={22} color={colors.mutedForeground} />
        <Text style={[rStyles.emptyTxt, { color: colors.mutedForeground }]}>
          Chưa có thực đơn
        </Text>
      </View>
    );
  }
  return (
    <>
      {SESSIONS.map((session) => {
        const meals = dayMeals.filter((m) => m.session === session.key);
        if (meals.length === 0) return null;
        return (
          <View key={session.key} style={[rStyles.row, { borderColor: colors.border }]}>
            <View style={[rStyles.sessionCol, { backgroundColor: session.bg }]}>
              <Text style={[rStyles.sessionLabel, { color: session.color }]}>{session.label}</Text>
              <Text style={[rStyles.sessionCount, { color: session.color }]}>{meals.length} món</Text>
            </View>
            <View style={rStyles.mealsCol}>
              {meals.map((meal, i) => (
                <TouchableOpacity
                  key={meal.id}
                  onPress={() => router.push(`/meal/${meal.id}` as any)}
                  activeOpacity={0.72}
                  style={[
                    rStyles.mealRow,
                    i < meals.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <ZoomableImage source={meal.image} style={rStyles.mealImg} resizeMode="cover" />
                  <View style={rStyles.mealInfo}>
                    <Text style={[rStyles.mealName, { color: colors.text }]} numberOfLines={1}>
                      {meal.name}
                    </Text>
                    <Text style={[rStyles.sampleDate, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {sampleLabel(SAMPLE_RETENTIONS.find((s) => s.mealId === meal.id))}
                    </Text>
                    {meal.isMonitored && (() => {
                      const sample = SAMPLE_RETENTIONS.find((s) => s.mealId === meal.id);
                      const tag = getMonitoringTag(sample?.status);
                      if (tag === null) return null;
                      const active = tag === 'active';
                      const bg = active ? colors.safeGreenLight : colors.muted;
                      const fg = active ? colors.safeGreen : colors.mutedForeground;
                      return (
                        <View style={[rStyles.monitored, { backgroundColor: bg }]}>
                          <View style={[rStyles.monDot, { backgroundColor: fg }]} />
                          <Text style={[rStyles.monText, { color: fg }]}>
                            {active ? 'Đang theo dõi' : 'Ngưng hoạt động'}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
    </>
  );
}

const rStyles = StyleSheet.create({
  emptyBox: { alignItems: 'center', paddingVertical: 28, gap: 8, borderRadius: 14 },
  emptyTxt: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  row: { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  sessionCol: { width: 58, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 4, gap: 2 },
  sessionLabel: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  sessionCount: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  mealsCol: { flex: 1 },
  mealRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10, gap: 10 },
  mealImg: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f0f0f0', flexShrink: 0 },
  mealInfo: { flex: 1, gap: 3 },
  mealName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  sampleDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  monitored: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginTop: 2 },
  monDot: { width: 5, height: 5, borderRadius: 3 },
  monText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
});

/* ─── Main screen ─────────────────────────────────────────── */
export default function HomeScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const { width: windowWidth } = useWindowDimensions();
  const { days, todayIndex, today } = useMemo(() => getWeekInfo(), []);
  const [photosVisible, setPhotosVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Week view state
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  // Month view state
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const calCells = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth]);

  // Meals for week view
  const weekSelectedDate = days[selectedDay];
  const weekDayMeals = useMemo(() => mealsForDate(weekSelectedDate, days), [weekSelectedDate, days]);

  // Meals for month view selected date
  const monthDayMeals = useMemo(() => mealsForDate(selectedDate, days), [selectedDate, days]);

  // Summary stats
  const safetyCount = NOTIFICATIONS.filter((n) => n.type === 'safety').length;
  const pendingFeedbackCount = FEEDBACKS.filter((f) => f.status === 'pending' || f.status === 'processing').length;
  // Only count today's meals that have an active sample retention record
  const tracedMealCount = SAMPLE_RETENTIONS.filter((s) => {
    const meal = MEALS.find((m) => m.id === s.mealId);
    const isToday = meal && (meal.date ? isSameDay(parseFixedDate(meal.date), today) : meal.dayIndex === todayIndex);
    return isToday && s.status === 'active';
  }).length;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const openTrayPhotos = () => {
    setSelectedPhotoIndex(0);
    setPhotosVisible(true);
  };

  const trayPhotosButton = (mealCount: number) => mealCount > 0 ? (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Xem hình ảnh thực tế khay đồ ăn"
      onPress={openTrayPhotos}
      activeOpacity={0.8}
      style={[styles.trayPhotosButton, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Feather name="image" size={17} color={colors.primary} />
      <Text style={[styles.trayPhotosButtonText, { color: colors.primary }]}>Hình ảnh thực tế</Text>
      <View style={[styles.photoCountBadge, { backgroundColor: colors.accent }]}>
        <Text style={[styles.photoCountText, { color: colors.primary }]}>{TRAY_PHOTOS.length} ảnh</Text>
      </View>
    </TouchableOpacity>
  ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
      >
        {/* ── Title row + mode toggle ── */}
        <View style={styles.titleRow}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Thực đơn</Text>
          <View style={[styles.modePill, { backgroundColor: colors.card }]}>
            {(['week', 'month'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setViewMode(mode)}
                style={[
                  styles.modeBtn,
                  viewMode === mode && { backgroundColor: colors.primary },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.modeBtnText,
                  { color: viewMode === mode ? '#fff' : colors.mutedForeground },
                ]}>
                  {mode === 'week' ? 'Tuần' : 'Tháng'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ══════════ WEEK VIEW ══════════ */}
        {viewMode === 'week' && (
          <>
            {/* Day selector */}
            <View style={[styles.daySelector, { backgroundColor: colors.card }]}>
              {days.map((d, i) => {
                const isSelected = i === selectedDay;
                const hasMeals = mealsForDate(d, days).length > 0;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDay(i)}
                    style={[styles.dayBtn, isSelected && { backgroundColor: colors.primary }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayLabel, { color: isSelected ? '#fff' : colors.mutedForeground }]}>
                      {DAY_LABELS[i]}
                    </Text>
                    <Text style={[styles.dayNum, { color: isSelected ? '#fff' : colors.text }]}>
                      {d.getDate()}
                    </Text>
                    {hasMeals && (
                      <View style={[styles.dayDot, {
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.75)' : colors.primary,
                      }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Day header + meals immediately below */}
            <View style={styles.daySubHeader}>
              <Text style={[styles.daySubTitle, { color: colors.text }]}>
                {DAY_LABELS[selectedDay]}, {weekSelectedDate.getDate()}/{weekSelectedDate.getMonth() + 1}
              </Text>
              {weekDayMeals.length > 0 && (
                <View style={[styles.mealCountBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.mealCountText, { color: colors.primary }]}>
                    {weekDayMeals.length} món
                  </Text>
                </View>
              )}
            </View>

            {trayPhotosButton(weekDayMeals.length)}
            <SessionRows dayMeals={weekDayMeals} colors={colors} />
          </>
        )}

        {/* ══════════ MONTH VIEW ══════════ */}
        {viewMode === 'month' && (
          <>
            {/* Month navigation */}
            <View style={[styles.monthNav, { backgroundColor: colors.card }]}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
                <Feather name="chevron-left" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthNavTitle, { color: colors.text }]}>
                {VN_MONTHS[calMonth]} {calYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
                <Feather name="chevron-right" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Calendar grid */}
            <View style={[styles.calCard, { backgroundColor: colors.card }]}>
              {/* Header row */}
              <View style={styles.calHeaderRow}>
                {CAL_HEADERS.map((h) => (
                  <View key={h} style={styles.calHeaderCell}>
                    <Text style={[styles.calHeaderText, {
                      color: (h === 'T7' || h === 'CN') ? colors.primary : colors.mutedForeground
                    }]}>{h}</Text>
                  </View>
                ))}
              </View>

              {/* Day cells */}
              <View style={styles.calGrid}>
                {calCells.map((cell, idx) => {
                  if (!cell) {
                    return <View key={`empty-${idx}`} style={styles.calCell} />;
                  }
                  const isToday = isSameDay(cell, today);
                  const isSelected = isSameDay(cell, selectedDate);
                  const cellMeals = mealsForDate(cell, days);
                  const hasMeals = cellMeals.length > 0;
                  const isWeekend = cell.getDay() === 0 || cell.getDay() === 6;

                  return (
                    <TouchableOpacity
                      key={cell.toISOString()}
                      style={styles.calCell}
                      onPress={() => setSelectedDate(cell)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.calDayCircle,
                        isSelected && { backgroundColor: colors.primary },
                        isToday && !isSelected && { borderWidth: 1.5, borderColor: colors.primary },
                      ]}>
                        <Text style={[
                          styles.calDayNum,
                          { color: isSelected ? '#fff' : isWeekend ? colors.primary : colors.text },
                          isToday && !isSelected && { color: colors.primary, fontFamily: 'Inter_700Bold' },
                        ]}>
                          {cell.getDate()}
                        </Text>
                      </View>
                      {/* Meal session dots */}
                      <View style={styles.calDots}>
                        {hasMeals && cellMeals.length > 0 && (
                          <>
                            {Array.from(new Set(cellMeals.map((m) => m.session))).slice(0, 3).map((s) => {
                              const sess = SESSIONS.find((ss) => ss.key === s);
                              return (
                                <View
                                  key={s}
                                  style={[styles.calDot, { backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : (sess?.color ?? colors.primary) }]}
                                />
                              );
                            })}
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Session color legend */}
            <View style={styles.legend}>
              {SESSIONS.map((s) => (
                <View key={s.key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Selected day meals */}
            <View style={styles.daySubHeader}>
              <Text style={[styles.daySubTitle, { color: colors.text }]}>
                {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
              </Text>
              {monthDayMeals.length > 0 && (
                <View style={[styles.mealCountBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.mealCountText, { color: colors.primary }]}>
                    {monthDayMeals.length} món
                  </Text>
                </View>
              )}
            </View>
            {trayPhotosButton(monthDayMeals.length)}
            <SessionRows dayMeals={monthDayMeals} colors={colors} />
          </>
        )}

        {/* ── Summary cards ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TỔNG QUAN HÔM NAY</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="shield"
              count={safetyCount}
              label={'Thông báo'}
              iconColor="#34C759"
              iconBg="#E8F9ED"
              onPress={() => router.push('/(tabs)/notifications')}
            />
            <SummaryCard
              icon="message-circle"
              count={pendingFeedbackCount}
              label={'Phản ánh'}
              iconColor="#FF9500"
              iconBg="#FFF4E5"
              onPress={() => router.push('/(tabs)/feedback')}
            />
          </View>
          <View style={styles.summaryRow}>
            <SummaryCard
              wide
              icon="search"
              count={tracedMealCount}
              label={'Danh sách các món ăn đang theo dõi lưu mẫu'}
              iconColor="#007AFF"
              iconBg="#E5F1FF"
              onPress={() => router.push('/(tabs)/traceability')}
            />
          </View>
        </View>

      </ScrollView>
      <Modal
        visible={photosVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setPhotosVisible(false)}
      >
        <View style={styles.photoViewer}>
          <View style={styles.photoViewerHeader}>
            <View style={styles.photoViewerHeading}>
              <Text style={styles.photoViewerTitle}>Hình ảnh thực tế</Text>
              <Text style={styles.photoViewerSubtitle}>Ảnh khay đồ ăn</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Đóng hình ảnh"
              onPress={() => setPhotosVisible(false)}
              style={styles.photoViewerClose}
            >
              <Feather name="x" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
              setSelectedPhotoIndex(Math.min(Math.max(nextIndex, 0), TRAY_PHOTOS.length - 1));
            }}
          >
            {TRAY_PHOTOS.map((photo, index) => (
              <View key={photo.caption} style={[styles.photoSlide, { width: windowWidth }]}>
                <Image
                  source={photo.source}
                  resizeMode="contain"
                  style={[styles.trayPhoto, { width: windowWidth - 40, height: windowWidth - 40 }]}
                />
                <Text style={styles.photoCaption}>{photo.caption}</Text>
                <Text style={styles.photoSwipeHint}>Vuốt ngang để xem ảnh tiếp theo</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.photoPagination}>
            <Text style={styles.photoPaginationText}>
              {selectedPhotoIndex + 1} / {TRAY_PHOTOS.length}
            </Text>
            <View style={styles.photoDots}>
              {TRAY_PHOTOS.map((photo, index) => (
                <View
                  key={photo.caption}
                  style={[styles.photoDot, index === selectedPhotoIndex && styles.photoDotActive]}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },

  /* Title */
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  pageTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  modePill: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  modeBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18 },
  modeBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  /* Week day selector */
  daySelector: { flexDirection: 'row', borderRadius: 14, padding: 6, marginBottom: 12, gap: 2 },
  dayBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, gap: 2 },
  dayLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  dayNum: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  dayDot: { width: 5, height: 5, borderRadius: 3 },

  /* Day subheader */
  daySubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
  },
  daySubTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  mealCountBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  mealCountText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  trayPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  trayPhotosButtonText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  photoCountBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  photoCountText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  photoViewer: { flex: 1, backgroundColor: '#101114', justifyContent: 'space-between', paddingTop: 24, paddingBottom: 28 },
  photoViewerHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  photoViewerHeading: { flex: 1, gap: 3 },
  photoViewerTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' },
  photoViewerSubtitle: { color: '#B5B6BB', fontSize: 13, fontFamily: 'Inter_400Regular' },
  photoViewerClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  photoSlide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  trayPhoto: { maxHeight: '78%', borderRadius: 16 },
  photoCaption: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 16 },
  photoSwipeHint: { color: '#B5B6BB', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 6 },
  photoPagination: { alignItems: 'center', gap: 10 },
  photoPaginationText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_500Medium' },
  photoDots: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  photoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#66686F' },
  photoDotActive: { width: 18, backgroundColor: '#FFFFFF' },

  /* Month navigation */
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 10,
  },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthNavTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },

  /* Calendar */
  calCard: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingBottom: 12,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  calHeaderRow: { flexDirection: 'row', paddingTop: 10, paddingBottom: 4 },
  calHeaderCell: { flex: 1, alignItems: 'center' },
  calHeaderText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  calDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayNum: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  calDots: { flexDirection: 'row', gap: 2, height: 6, alignItems: 'center', marginTop: 1 },
  calDot: { width: 5, height: 5, borderRadius: 3 },

  /* Legend */
  legend: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  /* Summary */
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10, marginTop: 20 },
  summaryGrid: { gap: 8, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', gap: 8 },

});
