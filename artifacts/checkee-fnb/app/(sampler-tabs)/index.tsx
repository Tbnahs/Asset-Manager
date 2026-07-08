import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSampler } from '@/contexts/SamplerContext';
import { MEALS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { MealSession } from '@/types';

const SESSION_LABEL: Record<MealSession, string> = {
  sang:  'Buổi sáng',
  trua:  'Buổi trưa',
  chieu: 'Buổi chiều',
  phu:   'Bữa phụ',
};

const SESSION_ORDER: MealSession[] = ['sang', 'trua', 'chieu', 'phu'];

function todayDayIndex(): number | null {
  const dow = new Date().getDay(); // 0 Sun … 6 Sat
  if (dow === 0 || dow === 6) return null;
  return dow - 1; // Mon=0 … Fri=4
}

function fmtToday() {
  const d = new Date();
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function SamplerHomeScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const { isMealRecordedToday, todayRecords } = useSampler();

  const dayIndex = todayDayIndex();

  const todayMeals = useMemo(
    () => (dayIndex === null ? [] : MEALS.filter((m) => m.dayIndex === dayIndex)),
    [dayIndex],
  );

  const totalMeals = todayMeals.length;
  const doneMeals  = todayMeals.filter((m) => isMealRecordedToday(m.id)).length;
  const allDone    = totalMeals > 0 && doneMeals === totalMeals;
  const hasPending = todayMeals.some((m) => !isMealRecordedToday(m.id));

  const grouped = useMemo(() => {
    const map = new Map<MealSession, typeof todayMeals>();
    for (const s of SESSION_ORDER) {
      const list = todayMeals.filter((m) => m.session === s);
      if (list.length) map.set(s, list);
    }
    return map;
  }, [todayMeals]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={[styles.logoWrap, { backgroundColor: colors.accent }]}>
            <Feather name="shield" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Lưu mẫu thức ăn</Text>
            <Text style={[styles.pageDate, { color: colors.mutedForeground }]}>{fmtToday()}</Text>
          </View>
        </View>

        {/* Progress card */}
        {totalMeals > 0 && (
          <View style={[styles.progressCard, { backgroundColor: allDone ? colors.safeGreenLight : colors.card }]}>
            <View style={styles.progressTop}>
              <Feather
                name={allDone ? 'check-circle' : 'clock'}
                size={22}
                color={allDone ? colors.safeGreen : colors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.progressLabel, { color: allDone ? colors.safeGreen : colors.mutedForeground }]}>
                  {allDone ? 'Đã hoàn thành tất cả mẫu hôm nay' : 'Tiến độ lưu mẫu hôm nay'}
                </Text>
                <Text style={[styles.progressCount, { color: allDone ? colors.safeGreen : colors.text }]}>
                  {doneMeals} / {totalMeals} món
                </Text>
              </View>
            </View>
            {/* Bar */}
            <View style={[styles.progressBarBg, { backgroundColor: allDone ? '#B7EFC5' : colors.muted }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: allDone ? colors.safeGreen : colors.primary,
                    width: totalMeals > 0 ? `${(doneMeals / totalMeals) * 100}%` : '0%',
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Single global scan button */}
        {hasPending && (
          <TouchableOpacity
            style={[styles.scanCta, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/qr-scanner' as any)}
            activeOpacity={0.85}
          >
            <View style={styles.scanCtaIconWrap}>
              <Feather name="camera" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scanCtaTitle}>Quét mã QR</Text>
              <Text style={styles.scanCtaDesc}>Quét mã trên khay cơm để lưu mẫu</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Meals by session */}
        {dayIndex === null ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="calendar" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Hôm nay là cuối tuần</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Không có thực đơn vào thứ bảy và chủ nhật.
            </Text>
          </View>
        ) : todayMeals.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Không có thực đơn</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Chưa có dữ liệu thực đơn cho hôm nay.
            </Text>
          </View>
        ) : (
          Array.from(grouped.entries()).map(([session, meals]) => (
            <View key={session}>
              {/* Session header */}
              <View style={styles.sessionRow}>
                <View style={[styles.sessionDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.sessionLabel, { color: colors.mutedForeground }]}>
                  {SESSION_LABEL[session].toUpperCase()}
                </Text>
              </View>

              {meals.map((meal) => {
                const done = isMealRecordedToday(meal.id);
                return (
                  <View
                    key={meal.id}
                    style={[styles.mealCard, { backgroundColor: colors.card }]}
                  >
                    <Image source={meal.image} style={styles.mealImage} resizeMode="cover" />
                    <View style={styles.mealInfo}>
                      <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={2}>
                        {meal.name}
                      </Text>
                      <View style={styles.mealMeta}>
                        <View style={[styles.metaBadge, { backgroundColor: colors.accent }]}>
                          <Feather name="tag" size={10} color={colors.primary} />
                          <Text style={[styles.metaText, { color: colors.primary }]}>
                            {meal.category}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {done ? (
                      <View style={[styles.doneBadge, { backgroundColor: colors.safeGreenLight }]}>
                        <Feather name="check" size={14} color={colors.safeGreen} />
                        <Text style={[styles.doneBadgeText, { color: colors.safeGreen }]}>Đã lưu</Text>
                      </View>
                    ) : (
                      <View style={[styles.pendingBadge, { backgroundColor: colors.muted }]}>
                        <Feather name="clock" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.pendingBadgeText, { color: colors.mutedForeground }]}>Chưa lưu</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}

        {/* Info box */}
        <View style={[styles.infoBox, { backgroundColor: colors.infoLight }]}>
          <Feather name="info" size={14} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.info }]}>
            Tất cả các món ăn trong ngày đều phải được lưu mẫu. Mẫu bảo quản tối thiểu{' '}
            <Text style={{ fontFamily: 'Inter_700Bold' }}>24–72 giờ</Text> theo quy định ATTP.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  logoWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  pageDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },

  progressCard: {
    borderRadius: 14, padding: 14, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  progressTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  progressCount: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 1 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },

  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 6 },
  sessionDot: { width: 6, height: 6, borderRadius: 3 },
  sessionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },

  mealCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  mealImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#f0f0f0', flexShrink: 0 },
  mealInfo: { flex: 1, gap: 6 },
  mealName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', lineHeight: 19 },
  mealMeta: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  metaText: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  doneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, flexShrink: 0,
  },
  doneBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  pendingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, flexShrink: 0,
  },
  pendingBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  scanCta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  scanCtaIconWrap: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scanCtaTitle: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  scanCtaDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },

  emptyCard: {
    borderRadius: 16, padding: 32, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, textAlign: 'center' },

  infoBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    padding: 12, borderRadius: 12,
  },
  infoText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, flex: 1 },
});
