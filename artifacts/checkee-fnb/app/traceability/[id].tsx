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
      {/* Custom header */}
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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Truy xuất nguồn gốc</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isWeb ? 34 : insets.bottom + 24 },
        ]}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <Image source={record.image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroInfo}>
            <Text style={[styles.heroMeal, { color: colors.text }]}>{record.mealName}</Text>
            <View style={[styles.ingPill, { backgroundColor: colors.accent }]}>
              <Text style={[styles.ingPillText, { color: colors.primary }]}>
                Nguyên liệu: {record.ingredient}
              </Text>
            </View>
            <View style={[styles.batchRow, { backgroundColor: colors.muted }]}>
              <Feather name="hash" size={12} color={colors.mutedForeground} />
              <Text style={[styles.batchText, { color: colors.mutedForeground }]}>
                {record.productionBatch}
              </Text>
              <View style={[styles.qrBadge, { backgroundColor: colors.safeGreenLight }]}>
                <Feather name="check" size={10} color={colors.safeGreen} />
                <Text style={[styles.qrText, { color: colors.safeGreen }]}>QR OK</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Supplier info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.accent }]}>
              <Feather name="truck" size={15} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin nhà cung cấp</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {[
            { label: 'Nhà cung cấp', value: record.supplier },
            { label: 'Địa chỉ', value: record.supplierAddress },
            { label: 'Xuất xứ', value: record.origin },
          ].map((row) => (
            <View key={row.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Batch info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#E5F1FF' }]}>
              <Feather name="package" size={15} color="#007AFF" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin lô hàng</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {[
            { label: 'Mã lô hàng', value: record.productionBatch },
            { label: 'Ngày sản xuất', value: record.manufacturingDate },
            { label: 'Hạn sử dụng', value: record.expiryDate },
          ].map((row) => (
            <View key={row.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Certifications */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#E8F9ED' }]}>
              <Feather name="award" size={15} color="#34C759" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Chứng nhận</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.certGrid}>
            {record.certifications.map((cert) => (
              <View key={cert} style={[styles.certCard, { backgroundColor: '#E8F9ED' }]}>
                <Feather name="check-circle" size={14} color="#34C759" />
                <Text style={[styles.certText, { color: '#34C759' }]}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Processing timeline */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FFF4E5' }]}>
              <Feather name="git-branch" size={15} color="#FF9500" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lịch sử xử lý</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {record.processingHistory.map((step, i) => (
            <View key={step.id} style={styles.timelineItem}>
              {/* Line */}
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary, borderColor: colors.background }]} />
                {i < record.processingHistory.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineTopRow}>
                  <Text style={[styles.timelineDate, { color: colors.primary }]}>{step.date}</Text>
                </View>
                <Text style={[styles.timelineLocation, { color: colors.text }]}>
                  {step.location}
                </Text>
                <Text style={[styles.timelineAction, { color: colors.mutedForeground }]}>
                  {step.action}
                </Text>
                <View style={styles.timelinePersonRow}>
                  <Feather name="user" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.timelinePerson, { color: colors.mutedForeground }]}>
                    {step.responsible}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerBack: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, gap: 12 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  heroImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#f0f0f0' },
  heroInfo: { flex: 1, gap: 6 },
  heroMeal: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  ingPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ingPillText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  batchText: { fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 },
  qrBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  qrText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  section: {
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1.5, textAlign: 'right' },
  certGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 4 },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  certText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  timelineItem: { flexDirection: 'row', gap: 12, paddingVertical: 6 },
  timelineLeft: { alignItems: 'center', width: 18 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, flexShrink: 0, marginTop: 2 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: -4 },
  timelineContent: { flex: 1, paddingBottom: 8, gap: 3 },
  timelineTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineDate: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  timelineLocation: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  timelineAction: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  timelinePersonRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timelinePerson: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  backBtn: { paddingHorizontal: 16, paddingBottom: 12 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
});
