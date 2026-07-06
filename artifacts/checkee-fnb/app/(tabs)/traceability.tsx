import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '@/components/Header';
import ZoomableImage from '@/components/ZoomableImage';
import { SAMPLE_RETENTIONS, TRACEABILITY_RECORDS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { getMonitoringTag } from '@/utils/monitoring';

export default function TraceabilityScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

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

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          DANH SÁCH TRUY XUẤT ({TRACEABILITY_RECORDS.length})
        </Text>

        {TRACEABILITY_RECORDS.map((record) => (
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
                if (!record.isMonitored) {
                  return (
                    <View style={[styles.monitoredBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <View style={[styles.monitoredDot, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
                      <Text style={styles.monitoredText}>Ngưng hoạt động</Text>
                    </View>
                  );
                }
                const sample = SAMPLE_RETENTIONS.find((s) => s.mealId === record.mealId);
                const tag = getMonitoringTag(sample?.status);
                const label = tag === 'active' ? 'Đang theo dõi' : tag === 'inactive' ? 'Ngưng hoạt động' : 'Chưa lấy mẫu';
                const dotColor = tag === 'active' ? '#34C759' : 'rgba(255,255,255,0.5)';
                return (
                  <View style={[styles.monitoredBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <View style={[styles.monitoredDot, { backgroundColor: dotColor }]} />
                    <Text style={styles.monitoredText}>{label}</Text>
                  </View>
                );
              })()}
            </View>

            {/* Card body */}
            <View style={styles.cardBody}>
              <ZoomableImage source={record.image} style={styles.mealImage} resizeMode="cover" />
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

        {TRACEABILITY_RECORDS.length === 0 && (
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
