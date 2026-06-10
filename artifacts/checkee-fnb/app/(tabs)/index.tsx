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

import Header from '@/components/Header';
import MealCard from '@/components/MealCard';
import SummaryCard from '@/components/SummaryCard';
import { FEEDBACKS, MEALS, NOTIFICATIONS, SAMPLE_RETENTIONS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6'];

function getWeekInfo() {
  const today = new Date();
  const dow = today.getDay();
  const daysFromMon = dow === 0 ? 6 : dow - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMon);
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const todayIndex = dow === 0 || dow === 6 ? 4 : dow - 1;
  return { days, todayIndex: Math.min(Math.max(todayIndex, 0), 4) };
}

const SHORTCUTS = [
  { key: 'sample', icon: 'archive', label: 'Mẫu lưu', color: '#007AFF', bg: '#E5F1FF', route: '/sample-retention' as const },
  { key: 'trace', icon: 'search', label: 'Truy xuất', color: '#34C759', bg: '#E8F9ED', route: '/(tabs)/traceability' as const },
  { key: 'feedback', icon: 'message-circle', label: 'Phản ánh', color: '#FF9500', bg: '#FFF4E5', route: '/(tabs)/feedback' as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const { days, todayIndex } = useMemo(() => getWeekInfo(), []);
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const isWeb = Platform.OS === 'web';

  const monthLabel = `THÁNG ${days[0].getMonth() + 1}`;
  const dayMeals = MEALS.filter((m) => m.dayIndex === selectedDay);

  const monitoredCount = MEALS.filter((m) => m.isMonitored).length;
  const sampleCount = SAMPLE_RETENTIONS.filter((s) => s.status === 'active').length;
  const safetyCount = NOTIFICATIONS.filter((n) => n.type === 'safety').length;
  const feedbackCount = FEEDBACKS.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isWeb ? 118 : 120 },
        ]}
      >
        {/* Week title */}
        <View style={styles.weekRow}>
          <Text style={[styles.weekTitle, { color: colors.text }]}>Thực đơn tuần</Text>
          <View style={[styles.monthBadge, { backgroundColor: colors.muted }]}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.monthText, { color: colors.mutedForeground }]}>
              {monthLabel}
            </Text>
          </View>
        </View>

        {/* Day selector */}
        <View style={[styles.daySelector, { backgroundColor: colors.card }]}>
          {days.map((d, i) => {
            const isSelected = i === selectedDay;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDay(i)}
                style={[
                  styles.dayBtn,
                  isSelected && { backgroundColor: colors.primary },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: isSelected ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  {DAY_LABELS[i]}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    { color: isSelected ? '#fff' : colors.text },
                  ]}
                >
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary cards */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          TỔNG QUAN
        </Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="eye"
              count={monitoredCount}
              label="Bữa ăn đang theo dõi"
              iconColor="#FF6535"
              iconBg="#FFF0EB"
              onPress={() => {}}
            />
            <SummaryCard
              icon="archive"
              count={sampleCount}
              label="Mẫu lưu đang bảo quản"
              iconColor="#007AFF"
              iconBg="#E5F1FF"
              onPress={() => router.push('/sample-retention')}
            />
          </View>
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="shield"
              count={safetyCount}
              label="Thông báo ATTP"
              iconColor="#34C759"
              iconBg="#E8F9ED"
              onPress={() => router.push('/(tabs)/notifications')}
            />
            <SummaryCard
              icon="message-circle"
              count={feedbackCount}
              label="Phản ánh đã gửi"
              iconColor="#FF9500"
              iconBg="#FFF4E5"
              onPress={() => router.push('/(tabs)/feedback')}
            />
          </View>
        </View>

        {/* Quick shortcuts */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          TRUY CẬP NHANH
        </Text>
        <View style={styles.shortcuts}>
          {SHORTCUTS.map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={() => router.push(s.route as any)}
              style={[styles.shortcut, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: s.bg }]}>
                <Feather name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.shortcutLabel, { color: colors.text }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal list */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          THỰC ĐƠN HÔM NAY
        </Text>
        {dayMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="coffee" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Chưa có thực đơn cho ngày này
            </Text>
          </View>
        ) : (
          dayMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() => router.push(`/meal/${meal.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  monthText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  daySelector: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 6,
    marginBottom: 20,
    gap: 2,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  dayNum: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  summaryGrid: { gap: 8, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  shortcuts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
