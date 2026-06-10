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

import { MEALS, TRACEABILITY_RECORDS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const SAFETY_CONFIG = {
  safe: { label: 'Đạt chuẩn an toàn', icon: 'check-circle', color: '#34C759', bg: '#E8F9ED' },
  warning: { label: 'Cần theo dõi', icon: 'alert-triangle', color: '#FF9500', bg: '#FFF4E5' },
  danger: { label: 'Cần kiểm tra', icon: 'x-circle', color: '#FF3B30', bg: '#FFEBEA' },
};

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const meal = MEALS.find((m) => m.id === id);
  const traceRecord = TRACEABILITY_RECORDS.find((r) => r.mealId === id);

  if (!meal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: isWeb ? 67 : insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Không tìm thấy bữa ăn</Text>
        </View>
      </View>
    );
  }

  const safety = SAFETY_CONFIG[meal.foodSafetyStatus];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 24 }}
      >
        {/* Hero image */}
        <View style={styles.imageContainer}>
          <Image source={meal.image} style={styles.heroImage} resizeMode="cover" />
          <View
            style={[
              styles.imageOverlay,
              { paddingTop: isWeb ? 67 : insets.top },
            ]}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backCircle, { backgroundColor: 'rgba(0,0,0,0.35)' }]}
            >
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* Header */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
              <Text style={[styles.category, { color: colors.mutedForeground }]}>{meal.category}</Text>
            </View>
            <View style={[styles.calorieBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.calorieText, { color: colors.primary }]}>{meal.calories}</Text>
              <Text style={[styles.calorieUnit, { color: colors.primary }]}>KCAL</Text>
            </View>
          </View>

          {/* Safety status */}
          <View style={[styles.safetyCard, { backgroundColor: safety.bg }]}>
            <Feather name={safety.icon as any} size={20} color={safety.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.safetyTitle, { color: safety.color }]}>Tình trạng ATTP</Text>
              <Text style={[styles.safetyLabel, { color: safety.color }]}>{safety.label}</Text>
            </View>
          </View>

          {/* Monitoring badge */}
          {meal.isMonitored && (
            <View style={[styles.monitorBadge, { backgroundColor: colors.safeGreenLight }]}>
              <View style={[styles.dot, { backgroundColor: colors.safeGreen }]} />
              <Text style={[styles.monitorText, { color: colors.safeGreen }]}>
                Bữa ăn đang được theo dõi
              </Text>
            </View>
          )}

          {/* Ingredients */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="layers" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nguyên liệu</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            {meal.ingredients.map((ing, i) => (
              <View
                key={i}
                style={[
                  styles.ingRow,
                  i < meal.ingredients.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.ingLeft}>
                  <View style={[styles.ingDot, { backgroundColor: colors.primary + '40' }]} />
                  <Text style={[styles.ingName, { color: colors.text }]}>{ing.name}</Text>
                </View>
                <View style={styles.ingRight}>
                  <Text style={[styles.ingAmount, { color: colors.mutedForeground }]}>{ing.amount}</Text>
                  <View style={[styles.originBadge, { backgroundColor: colors.muted }]}>
                    <Feather name="map-pin" size={9} color={colors.mutedForeground} />
                    <Text style={[styles.originText, { color: colors.mutedForeground }]}>{ing.origin}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Nutrition */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="activity" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin dinh dưỡng</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.nutritionGrid}>
              {[
                { label: 'Protein', value: `${meal.nutrition.protein}g`, color: '#007AFF' },
                { label: 'Carbs', value: `${meal.nutrition.carbs}g`, color: '#FF9500' },
                { label: 'Chất béo', value: `${meal.nutrition.fat}g`, color: '#FF3B30' },
                { label: 'Chất xơ', value: `${meal.nutrition.fiber}g`, color: '#34C759' },
                { label: 'Natri', value: `${meal.nutrition.sodium}mg`, color: '#8B5CF6' },
                { label: 'Calo', value: `${meal.calories}kcal`, color: '#FF6535' },
              ].map((item) => (
                <View key={item.label} style={[styles.nutriItem, { backgroundColor: item.color + '12' }]}>
                  <Text style={[styles.nutriValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={[styles.nutriLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Preparation */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cách chế biến</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.prepText, { color: colors.text }]}>{meal.preparation}</Text>
          </View>

          {/* Traceability CTA */}
          {traceRecord ? (
            <TouchableOpacity
              onPress={() => router.push(`/traceability/${traceRecord.id}` as any)}
              style={[styles.traceCta, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Feather name="search" size={18} color="#fff" />
              <Text style={styles.traceCtaText}>Xem truy xuất nguồn gốc</Text>
              <Feather name="chevron-right" size={18} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 280, backgroundColor: '#f0f0f0' },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 16, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  mealName: { fontSize: 22, fontFamily: 'Inter_700Bold', lineHeight: 28, flex: 1 },
  category: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  calorieBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  calorieText: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  calorieUnit: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  safetyTitle: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  safetyLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  monitorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  monitorText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  section: {
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 8 },
  ingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  ingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  ingDot: { width: 8, height: 8, borderRadius: 4 },
  ingName: { fontSize: 14, fontFamily: 'Inter_500Medium', flex: 1 },
  ingRight: { alignItems: 'flex-end', gap: 3 },
  ingAmount: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  originBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  originText: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nutriItem: {
    width: '30%',
    flex: 1,
    minWidth: '28%',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  nutriValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  nutriLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  prepText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  traceCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },
  traceCtaText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'center' },
  backBtn: { padding: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
});
