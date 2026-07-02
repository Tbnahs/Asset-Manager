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

import { MEALS, SAMPLE_RETENTIONS, TRACEABILITY_RECORDS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const SAFETY_CONFIG = {
  safe: { label: 'Đạt chuẩn an toàn', icon: 'check-circle', color: '#34C759', bg: '#E8F9ED' },
  warning: { label: 'Cần theo dõi', icon: 'alert-triangle', color: '#FF9500', bg: '#FFF4E5' },
  danger: { label: 'Cần kiểm tra', icon: 'x-circle', color: '#FF3B30', bg: '#FFEBEA' },
};

const SAMPLE_STATUS_CONFIG = {
  active:   { label: 'Đang bảo quản', color: '#34C759', bg: '#E8F9ED', icon: 'shield' as const },
  expired:  { label: 'Hết hạn lưu',   color: '#FF9500', bg: '#FFF4E5', icon: 'alert-triangle' as const },
  disposed: { label: 'Đã tiêu hủy',   color: '#8E8E93', bg: '#F5F6FA', icon: 'trash-2' as const },
};

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const meal = MEALS.find((m) => m.id === id);
  const traceRecord = TRACEABILITY_RECORDS.find((r) => r.mealId === id);
  const sampleRecord = SAMPLE_RETENTIONS.find((s) => s.mealId === id);

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

          {/* Nutrition — restored label "Thành phần dinh dưỡng" */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="activity" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Thành phần dinh dưỡng</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.nutritionGrid}>
              {[
                { label: 'Protein',   value: `${meal.nutrition.protein}g`,  color: '#007AFF' },
                { label: 'Carbs',     value: `${meal.nutrition.carbs}g`,    color: '#FF9500' },
                { label: 'Chất béo', value: `${meal.nutrition.fat}g`,      color: '#FF3B30' },
                { label: 'Chất xơ',  value: `${meal.nutrition.fiber}g`,    color: '#34C759' },
                { label: 'Natri',    value: `${meal.nutrition.sodium}mg`,  color: '#8B5CF6' },
                { label: 'Calo',     value: `${meal.calories}kcal`,        color: '#FF6535' },
              ].map((item) => (
                <View key={item.label} style={[styles.nutriItem, { backgroundColor: item.color + '12' }]}>
                  <Text style={[styles.nutriValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={[styles.nutriLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sample retention info */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="package" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hồ sơ lưu mẫu</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {sampleRecord ? (() => {
              const st = SAMPLE_STATUS_CONFIG[sampleRecord.status] ?? SAMPLE_STATUS_CONFIG.active;
              return (
                <>
                  {/* Status badge */}
                  <View style={[styles.sampleStatusRow, { backgroundColor: st.bg }]}>
                    <Feather name={st.icon} size={15} color={st.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sampleStatusLabel, { color: st.color }]}>Trạng thái mẫu lưu</Text>
                      <Text style={[styles.sampleStatusValue, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>

                  {/* Detail grid */}
                  <View style={styles.sampleGrid}>
                    <View style={styles.sampleItem}>
                      <View style={[styles.sampleIconWrap, { backgroundColor: colors.muted }]}>
                        <Feather name="calendar" size={12} color={colors.mutedForeground} />
                      </View>
                      <View>
                        <Text style={[styles.sampleDetailLabel, { color: colors.mutedForeground }]}>Ngày lưu mẫu</Text>
                        <Text style={[styles.sampleDetailValue, { color: colors.text }]}>{sampleRecord.storedDate}</Text>
                      </View>
                    </View>
                    <View style={styles.sampleItem}>
                      <View style={[styles.sampleIconWrap, { backgroundColor: colors.muted }]}>
                        <Feather name="clock" size={12} color={colors.mutedForeground} />
                      </View>
                      <View>
                        <Text style={[styles.sampleDetailLabel, { color: colors.mutedForeground }]}>Hạn bảo quản</Text>
                        <Text style={[styles.sampleDetailValue, { color: sampleRecord.status === 'expired' ? '#FF9500' : colors.text }]}>
                          {sampleRecord.expiryDate}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.sampleItem}>
                      <View style={[styles.sampleIconWrap, { backgroundColor: colors.muted }]}>
                        <Feather name="archive" size={12} color={colors.mutedForeground} />
                      </View>
                      <View>
                        <Text style={[styles.sampleDetailLabel, { color: colors.mutedForeground }]}>Vị trí lưu</Text>
                        <Text style={[styles.sampleDetailValue, { color: colors.text }]}>{sampleRecord.storageLocation}</Text>
                      </View>
                    </View>
                    <View style={styles.sampleItem}>
                      <View style={[styles.sampleIconWrap, { backgroundColor: colors.muted }]}>
                        <Feather name="layers" size={12} color={colors.mutedForeground} />
                      </View>
                      <View>
                        <Text style={[styles.sampleDetailLabel, { color: colors.mutedForeground }]}>Số lượng mẫu</Text>
                        <Text style={[styles.sampleDetailValue, { color: colors.text }]}>{sampleRecord.sampleCount} mẫu</Text>
                      </View>
                    </View>
                  </View>

                  {/* Regulation note */}
                  <View style={[styles.sampleNote, { backgroundColor: colors.infoLight }]}>
                    <Feather name="info" size={13} color={colors.info} />
                    <Text style={[styles.sampleNoteText, { color: colors.info }]}>
                      Mẫu lưu được bảo quản tối thiểu 72 giờ theo quy định ATTP.
                    </Text>
                  </View>

                  {/* CTA to full detail */}
                  <TouchableOpacity
                    onPress={() => router.push(`/sample-retention/${meal.id}` as any)}
                    style={[styles.sampleCta, { borderColor: colors.primary + '40', backgroundColor: colors.accent }]}
                    activeOpacity={0.75}
                  >
                    <Feather name="file-text" size={14} color={colors.primary} />
                    <Text style={[styles.sampleCtaText, { color: colors.primary }]}>Xem hồ sơ lưu mẫu đầy đủ</Text>
                    <Feather name="chevron-right" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </>
              );
            })() : (
              <View style={[styles.sampleEmpty, { backgroundColor: colors.muted }]}>
                <Feather name="package" size={18} color={colors.mutedForeground} />
                <Text style={[styles.sampleEmptyText, { color: colors.mutedForeground }]}>
                  Chưa có hồ sơ lưu mẫu cho món ăn này
                </Text>
              </View>
            )}
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
              activeOpacity={0.85}
            >
              <View style={styles.traceCtaIconWrap}>
                <Feather name="search" size={20} color={colors.primary} />
              </View>
              <Text style={styles.traceCtaText}>Xem truy xuất nguồn gốc</Text>
              <View style={styles.traceCtaArrowWrap}>
                <Feather name="chevron-right" size={18} color="#fff" />
              </View>
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
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 10 },
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

  /* Sample retention */
  sampleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  sampleStatusLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', marginBottom: 1 },
  sampleStatusValue: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  sampleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  sampleItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '46%' },
  sampleIconWrap: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sampleDetailLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  sampleDetailValue: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginTop: 1 },
  sampleNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sampleNoteText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17, flex: 1 },
  sampleCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  sampleCtaText: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  sampleEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
  },
  sampleEmptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },

  prepText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  traceCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  traceCtaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  traceCtaText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    textAlign: 'left',
  },
  traceCtaArrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backBtn: { padding: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
});
