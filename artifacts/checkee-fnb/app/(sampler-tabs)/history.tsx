import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SamplerRecord, useSampler } from '@/contexts/SamplerContext';
import { useColors } from '@/hooks/useColors';

const SESSION_LABEL: Record<string, string> = {
  sang:  'Buổi sáng',
  trua:  'Buổi trưa',
  chieu: 'Buổi chiều',
  phu:   'Bữa phụ',
};

function localDateISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fmtDate(iso: string) {
  // Parse 'yyyy-MM-dd' as local midnight to avoid UTC off-by-one
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function RecordCard({ rec, colors }: { rec: SamplerRecord; colors: ReturnType<typeof import('@/hooks/useColors').useColors> }) {
  return (
    <View style={[rStyles.card, { backgroundColor: colors.card }]}>
      <Image source={rec.photoUri ? { uri: rec.photoUri } : rec.mealImage} style={rStyles.img} resizeMode="cover" />
      <View style={rStyles.info}>
        <Text style={[rStyles.name, { color: colors.text }]} numberOfLines={2}>{rec.mealName}</Text>
        <View style={rStyles.metaRow}>
          <View style={[rStyles.badge, { backgroundColor: colors.accent }]}>
            <Feather name="clock" size={10} color={colors.primary} />
            <Text style={[rStyles.badgeText, { color: colors.primary }]}>{SESSION_LABEL[rec.session] ?? rec.session}</Text>
          </View>
          <View style={[rStyles.badge, { backgroundColor: colors.muted }]}>
            <Feather name="archive" size={10} color={colors.mutedForeground} />
            <Text style={[rStyles.badgeText, { color: colors.mutedForeground }]}>{rec.storageLocation}</Text>
          </View>
        </View>
        <View style={rStyles.footRow}>
          <Text style={[rStyles.time, { color: colors.mutedForeground }]}>{rec.recordedAt}</Text>
          <View style={[rStyles.countBadge, { backgroundColor: colors.safeGreenLight }]}>
            <Feather name="layers" size={10} color={colors.safeGreen} />
            <Text style={[rStyles.countText, { color: colors.safeGreen }]}>{rec.sampleCount} mẫu</Text>
          </View>
        </View>
        {!!rec.notes && (
          <Text style={[rStyles.notes, { color: colors.mutedForeground }]} numberOfLines={2}>
            {rec.notes}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function SamplerHistoryScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const { records } = useSampler();

  // Group by recordedDate descending
  const grouped = useMemo(() => {
    const map = new Map<string, SamplerRecord[]>();
    const sorted = [...records].sort((a, b) => b.recordedDate.localeCompare(a.recordedDate));
    for (const rec of sorted) {
      const existing = map.get(rec.recordedDate) ?? [];
      existing.push(rec);
      map.set(rec.recordedDate, existing);
    }
    return map;
  }, [records]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
      >
        {/* Page title */}
        <View style={styles.titleRow}>
          <Feather name="archive" size={20} color={colors.primary} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Lịch sử lưu mẫu</Text>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.text }]}>{records.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tổng mẫu</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.text }]}>{grouped.size}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Ngày ghi nhận</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.safeGreen }]}>
              {records.filter((r) => r.recordedDate === localDateISO()).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Hôm nay</Text>
          </View>
        </View>

        {/* List */}
        {grouped.size === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="inbox" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có mẫu nào</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Chuyển sang tab Thực đơn để bắt đầu lưu mẫu hôm nay.
            </Text>
          </View>
        ) : (
          Array.from(grouped.entries()).map(([date, recs]) => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Feather name="calendar" size={12} color={colors.mutedForeground} />
                <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>
                  {fmtDate(date)} · {recs.length} mẫu
                </Text>
              </View>
              {recs.map((r) => (
                <RecordCard key={r.id} rec={r} colors={colors} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const rStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 12, borderRadius: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  img: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#f0f0f0', flexShrink: 0 },
  info: { flex: 1, gap: 5 },
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold', lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  footRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  countText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  notes: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16, fontStyle: 'italic' },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statItem: { alignItems: 'center', gap: 2, flex: 1 },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1, height: 32 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6, marginTop: 4 },
  dateLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  emptyCard: {
    borderRadius: 16, padding: 40, alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, textAlign: 'center' },
});
