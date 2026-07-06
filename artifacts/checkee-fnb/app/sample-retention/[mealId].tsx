import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
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
import { MEALS, SAMPLE_RETENTIONS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const STATUS_CONFIG = {
  active: {
    label: 'Đang bảo quản',
    color: '#34C759',
    bg: '#E8F9ED',
    icon: 'shield' as const,
  },
  expired: {
    label: 'Hết hạn lưu',
    color: '#FF9500',
    bg: '#FFF4E5',
    icon: 'alert-triangle' as const,
  },
  disposed: {
    label: 'Đã tiêu hủy',
    color: '#8E8E93',
    bg: '#F5F6FA',
    icon: 'trash-2' as const,
  },
  future: {
    label: 'Chưa lấy mẫu',
    color: '#8E8E93',
    bg: '#F5F6FA',
    icon: 'clock' as const,
  },
};

const SESSION_LABEL: Record<string, string> = {
  sang: 'Buổi sáng',
  trua: 'Buổi trưa',
  chieu: 'Buổi chiều',
  phu: 'Phụ',
};

export default function SampleRetentionDetailScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const meal = MEALS.find((m) => m.id === mealId);
  const sample = SAMPLE_RETENTIONS.find((s) => s.mealId === mealId);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin lưu mẫu</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isWeb ? 34 : insets.bottom + 24 },
        ]}
      >
        {/* ── Meal card ── */}
        {meal ? (
          <View style={[styles.mealCard, { backgroundColor: colors.card }]}>
            <ZoomableImage source={meal.image} style={styles.mealImage} resizeMode="cover" />
            <View style={styles.mealInfo}>
              <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
              <View style={styles.mealMeta}>
                <View style={[styles.metaBadge, { backgroundColor: colors.accent }]}>
                  <Feather name="clock" size={11} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    {SESSION_LABEL[meal.session] ?? meal.session}
                  </Text>
                </View>
                <View style={[styles.metaBadge, { backgroundColor: colors.muted }]}>
                  <Feather name="tag" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {meal.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Quy định box ── */}
        <View style={[styles.infoBox, { backgroundColor: colors.infoLight }]}>
          <Feather name="info" size={15} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.info }]}>
            Tất cả món ăn (kể cả món phụ, tráng miệng) đều phải lưu mẫu theo dõi.
            Mẫu được bảo quản tối thiểu{' '}
            <Text style={{ fontFamily: 'Inter_700Bold' }}>24–72 giờ</Text> sau khi phục
            vụ theo quy định an toàn thực phẩm của nhà trường.
          </Text>
        </View>

        {/* ── Sample retention detail ── */}
        {sample ? (
          sample.status === 'future' ? (
            /* ── Future: meal not served yet ── */
            <View style={[styles.futureCard, { backgroundColor: colors.card }]}>
              <View style={[styles.futureIconWrap, { backgroundColor: colors.muted }]}>
                <Feather name="calendar" size={26} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.futureTitle, { color: colors.mutedForeground }]}>
                Chưa đến ngày phục vụ
              </Text>
              <Text style={[styles.futureDesc, { color: colors.mutedForeground }]}>
                Món ăn này chưa được phục vụ. Mẫu lưu sẽ được lấy và cập nhật vào ngày hôm đó.
              </Text>
            </View>
          ) : (
            /* ── Active / Expired ── */
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Status banner */}
              {(() => {
                const st = STATUS_CONFIG[sample.status];
                return (
                  <View style={[styles.statusRow, { backgroundColor: st.bg }]}>
                    <Feather name={st.icon} size={18} color={st.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.statusLabel, { color: st.color }]}>Trạng thái mẫu lưu</Text>
                      <Text style={[styles.statusValue, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                );
              })()}

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Detail grid */}
              <View style={styles.detailsGrid}>
                <DetailItem
                  icon="calendar"
                  label="Ngày lưu mẫu"
                  value={sample.storedDate}
                  colors={colors}
                />
                <DetailItem
                  icon="clock"
                  label="Hạn bảo quản (72 h)"
                  value={sample.expiryDate}
                  colors={colors}
                  valueColor={sample.status === 'expired' ? '#FF9500' : undefined}
                />
                <DetailItem
                  icon="archive"
                  label="Vị trí lưu"
                  value={sample.storageLocation}
                  colors={colors}
                />
                <DetailItem
                  icon="layers"
                  label="Số lượng mẫu"
                  value={`${sample.sampleCount} mẫu`}
                  colors={colors}
                />
              </View>

              {sample.status === 'expired' && (
                <>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={[styles.warningBox, { backgroundColor: '#FFF4E5' }]}>
                    <Feather name="alert-triangle" size={14} color="#FF9500" />
                    <Text style={[styles.warningText, { color: '#CC7700' }]}>
                      Mẫu lưu đã hết hạn 72 giờ bảo quản. Nhà trường sẽ xử lý theo quy trình tiêu hủy an toàn.
                    </Text>
                  </View>
                </>
              )}
            </View>
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ── Sub-component ── */
function DetailItem({
  icon,
  label,
  value,
  colors,
  valueColor,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailItem}>
      <View style={[styles.detailIconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={13} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: valueColor ?? colors.text }]}>{value}</Text>
      </View>
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

  /* Meal card */
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mealImage: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#f0f0f0', flexShrink: 0 },
  mealInfo: { flex: 1, gap: 8 },
  mealName: { fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 22 },
  mealMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  metaText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  /* Info box */
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
  },
  infoText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, flex: 1 },

  /* Main card */
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  statusLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  statusValue: { fontSize: 15, fontFamily: 'Inter_700Bold' },

  divider: { height: StyleSheet.hairlineWidth },

  detailsGrid: { gap: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  warningText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, flex: 1 },

  /* Future state */
  futureCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  futureIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  futureTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  futureDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
    textAlign: 'center',
  },

  /* Empty state (kept for safety) */
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
    textAlign: 'center',
  },
});
