import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '@/components/Header';
import { TRACEABILITY_RECORDS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

export default function TraceabilityScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

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
        <Text style={[styles.pageTitle, { color: colors.text }]}>Truy xuất nguồn gốc</Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          Thông tin nguồn gốc nguyên liệu thực phẩm
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          DANH SÁCH TRUY XUẤT
        </Text>

        {TRACEABILITY_RECORDS.map((record) => (
          <TouchableOpacity
            key={record.id}
            onPress={() => router.push(`/traceability/${record.id}` as any)}
            style={[styles.card, { backgroundColor: colors.card }]}
            activeOpacity={0.72}
          >
            <View style={styles.cardTop}>
              <Image source={record.image} style={styles.mealImage} resizeMode="cover" />
              <View style={styles.cardMain}>
                <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
                  {record.mealName}
                </Text>
                <View style={[styles.ingredientBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.ingredientText, { color: colors.primary }]}>
                    {record.ingredient}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Nhà cung cấp</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                  {record.supplier}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Mã lô hàng</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                  {record.productionBatch}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Sản xuất</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {record.manufacturingDate}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Hết hạn</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {record.expiryDate}
                </Text>
              </View>
            </View>

            <View style={styles.certs}>
              {record.certifications.slice(0, 3).map((cert) => (
                <View key={cert} style={[styles.certBadge, { backgroundColor: colors.safeGreenLight }]}>
                  <Text style={[styles.certText, { color: colors.safeGreen }]}>{cert}</Text>
                </View>
              ))}
              {record.certifications.length > 3 && (
                <View style={[styles.certBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.certText, { color: colors.mutedForeground }]}>
                    +{record.certifications.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  pageTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cardMain: { flex: 1, gap: 4 },
  mealName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  ingredientBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ingredientText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: { width: '47%' },
  infoLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  certs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  certBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  certText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
});
