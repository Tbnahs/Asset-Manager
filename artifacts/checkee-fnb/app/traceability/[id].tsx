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

import { TRACEABILITY_RECORDS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

export default function TraceabilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const record = TRACEABILITY_RECORDS.find((r) => r.id === id);

  if (!record) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { paddingTop: isWeb ? 67 : insets.top + 12 }]}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
            Không tìm thấy thông tin
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Orange header bar */}
      <View
        style={[
          styles.topBar,
          { paddingTop: isWeb ? 67 : insets.top, backgroundColor: colors.primary },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.topBackBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Feather name="home" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.topBarCode} numberOfLines={1}>
            {record.traceCode}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isWeb ? 34 : insets.bottom + 24 },
        ]}
      >
        {/* Centered food image */}
        <View style={styles.imageSection}>
          <Image source={record.image} style={styles.foodImage} resizeMode="cover" />
        </View>

        {/* Status + basic info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          {/* Status row */}
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Trạng thái:</Text>
            <View style={[styles.statusPill, { backgroundColor: colors.safeGreenLight }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.safeGreen }]} />
              <Text style={[styles.statusText, { color: colors.safeGreen }]}>
                {record.isMonitored ? 'Đang theo dõi' : 'Không theo dõi'}
              </Text>
            </View>
          </View>

          {/* Tên thực đơn */}
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Tên thực đơn:</Text>
            <Text style={[styles.infoValueOrange, { color: colors.primary }]} numberOfLines={1}>
              {record.mealName}
            </Text>
          </View>

          {/* Mã truy vết */}
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Mã truy vết:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{record.traceCode}</Text>
          </View>

          {/* Loại thực đơn */}
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Loại thực đơn:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{record.mealTypeCategory}</Text>
          </View>

          {/* Mô tả loại thực đơn — full width */}
          <View style={[styles.descRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Mô tả loại thực đơn:</Text>
            <Text style={[styles.descValue, { color: colors.text }]}>{record.mealTypeDesc}</Text>
          </View>
        </View>

        {/* Processing section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quy trình chế biến (lưu vết)
          </Text>

          <View style={[styles.processingBox, { backgroundColor: colors.muted }]}>
            {/* Chef */}
            <View style={[styles.processRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.processIconWrap, { backgroundColor: colors.card }]}>
                <Feather name="user" size={16} color={colors.text} />
              </View>
              <View style={styles.processContent}>
                <Text style={[styles.processLabel, { color: colors.mutedForeground }]}>Đầu bếp</Text>
                <Text style={[styles.processValue, { color: colors.text }]}>{record.chefName}</Text>
              </View>
            </View>

            {/* Process code */}
            <View style={[styles.processRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.processIconWrap, { backgroundColor: colors.card }]}>
                <Feather name="shopping-cart" size={16} color={colors.text} />
              </View>
              <View style={styles.processContent}>
                <Text style={[styles.processLabel, { color: colors.mutedForeground }]}>Mã quy trình</Text>
                <Text style={[styles.processValue, { color: colors.text }]}>{record.processCode}</Text>
              </View>
            </View>

            {/* Cook time */}
            <View style={styles.processRow}>
              <View style={[styles.processIconWrap, { backgroundColor: colors.card }]}>
                <Feather name="clock" size={16} color={colors.text} />
              </View>
              <View style={styles.processContent}>
                <Text style={[styles.processLabel, { color: colors.mutedForeground }]}>Chế biến lúc</Text>
                <Text style={[styles.processValue, { color: colors.text }]}>{record.cookTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ingredients table */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          {/* Table header */}
          <View style={[styles.tableHeader, { backgroundColor: colors.muted, borderBottomColor: colors.border }]}>
            <Text style={[styles.thNguyenLieu, { color: colors.mutedForeground }]}>Nguyên liệu</Text>
            <Text style={[styles.thNguonCung, { color: colors.mutedForeground }]}>Nguồn cung cấp</Text>
            <Text style={[styles.thSoLo, { color: colors.mutedForeground }]}>Số lô/mẻ</Text>
            <Text style={[styles.thDonVi, { color: colors.mutedForeground }]}>Đơn vị tính</Text>
          </View>

          {/* Table rows */}
          {record.traceIngredients.map((ing, i) => (
            <View
              key={i}
              style={[
                styles.tableRow,
                i < record.traceIngredients.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.tdNguyenLieu, { color: colors.text }]}>{ing.name}</Text>
              <Text style={[styles.tdNguonCung, { color: colors.mutedForeground }]} numberOfLines={3}>
                {ing.supplier}
              </Text>
              <Text style={[styles.tdSoLo, { color: colors.text }]}>{ing.batchNo}</Text>
              <Text style={[styles.tdDonVi, { color: colors.text }]}>{ing.unit}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer stats bar */}
      <View style={[styles.footer, { backgroundColor: colors.primary, paddingBottom: isWeb ? 8 : insets.bottom + 8 }]}>
        <View style={styles.footerItem}>
          <Text style={styles.footerNum}>{record.totalScans}</Text>
          <Text style={styles.footerLabel}>Tổng số lượt quét</Text>
        </View>
        <View style={[styles.footerDivider]} />
        <View style={styles.footerItem}>
          <Text style={styles.footerNum}>{record.todayScans}</Text>
          <Text style={styles.footerLabel}>Số lượt quét hôm nay</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 16, paddingBottom: 12 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontFamily: 'Inter_400Regular' },

  /* Orange top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  topBackBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  topBarCode: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },

  /* Scroll content */
  content: { padding: 16, gap: 12 },

  /* Centered image */
  imageSection: { alignItems: 'center', paddingVertical: 8 },
  foodImage: {
    width: 130,
    height: 130,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },

  /* Info card */
  infoCard: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  descRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0,
    gap: 4,
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flexShrink: 0 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1, textAlign: 'right' },
  infoValueOrange: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'right' },
  descValue: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, color: '#333' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  /* Sections */
  sectionCard: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },

  /* Processing box */
  processingBox: { marginHorizontal: 14, marginBottom: 14, borderRadius: 10, overflow: 'hidden' },
  processRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  processIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  processContent: { flex: 1 },
  processLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 1 },
  processValue: { fontSize: 14, fontFamily: 'Inter_700Bold' },

  /* Table */
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    alignItems: 'flex-start',
  },
  thNguyenLieu: { width: 70, fontSize: 10, fontFamily: 'Inter_600SemiBold', flexShrink: 0 },
  thNguonCung: { flex: 1, fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  thSoLo: { width: 76, fontSize: 10, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  thDonVi: { width: 48, fontSize: 10, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  tdNguyenLieu: { width: 70, fontSize: 12, fontFamily: 'Inter_500Medium', flexShrink: 0 },
  tdNguonCung: { flex: 1, fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  tdSoLo: { width: 76, fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'right' },
  tdDonVi: { width: 48, fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'right' },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    gap: 0,
  },
  footerItem: { flex: 1, alignItems: 'center', gap: 2, paddingBottom: 4 },
  footerDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' },
  footerNum: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
  footerLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
});
