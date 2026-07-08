import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { RetentionHours, SamplerRecord, useSampler } from '@/contexts/SamplerContext';
import { MEALS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

// ─── helpers ────────────────────────────────────────────────────────────────

function localDateISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fmt(d: Date): string {
  const dd  = String(d.getDate()).padStart(2, '0');
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const hh  = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
}

const SESSION_LABEL: Record<string, string> = {
  sang:  'Buổi sáng',
  trua:  'Buổi trưa',
  chieu: 'Buổi chiều',
  phu:   'Bữa phụ',
};

const RETENTION_OPTIONS: { hours: RetentionHours; label: string; desc: string }[] = [
  { hours: 24, label: '24 giờ', desc: 'Lưu tối thiểu 24 giờ rồi tự động gỡ bỏ' },
  { hours: 72, label: '72 giờ', desc: 'Lưu tối đa 72 giờ theo quy định ATTP' },
];

// ─── main screen ─────────────────────────────────────────────────────────────

export default function ScanSampleScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb  = Platform.OS === 'web';
  const { addRecord } = useSampler();
  const { user } = useAuth();

  // Role guard
  React.useEffect(() => {
    if (user && user.role !== 'Người lưu mẫu') {
      router.replace('/(tabs)');
    }
  }, [user]);

  const meal = MEALS.find((m) => m.id === mealId);

  const [retentionHours, setRetentionHours] = useState<RetentionHours>(72);
  const [signature, setSignature] = useState('');
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  // Submit
  const handleConfirm = async () => {
    if (!meal || !user) return;
    setSaving(true);
    const now = new Date();
    const expiry = now.getTime() + retentionHours * 3_600_000;
    const record: SamplerRecord = {
      id:           `sr-${meal.id}-${Date.now()}`,
      mealId:       meal.id,
      mealName:     meal.name,
      mealImage:    meal.image,
      session:      meal.session,
      recordedAt:   fmt(now),
      recordedDate: localDateISO(),
      recordedBy:   user.name,
      signature:    signature.trim() || undefined,
      retentionHours,
      expiresAt:    expiry,
      // keep legacy fields for history display
      storageLocation: '-',
      sampleCount: 1,
    };
    await addRecord(record);
    setExpiresAt(expiry);
    setSaving(false);
    setDone(true);
  };

  // ── Not found ──
  if (!meal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lưu mẫu</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Text style={{ color: colors.mutedForeground }}>Không tìm thấy món ăn.</Text>
        </View>
      </View>
    );
  }

  // ── Success ──
  if (done) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lưu mẫu</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <View style={[styles.successIcon, { backgroundColor: colors.safeGreenLight }]}>
            <Feather name="check-circle" size={52} color={colors.safeGreen} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Lưu mẫu thành công!</Text>
          <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
            Mẫu của{' '}
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{meal.name}</Text>
            {' '}đã được ghi nhận lúc{' '}
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{fmt(new Date())}</Text>.
          </Text>
          <View style={[styles.expiryPill, { backgroundColor: colors.accent }]}>
            <Feather name="clock" size={13} color={colors.primary} />
            <Text style={[styles.expiryPillText, { color: colors.primary }]}>
              Tự động gỡ bỏ sau {retentionHours}h — lúc {expiresAt ? fmt(new Date(expiresAt)) : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.safeGreen }]}
            onPress={() => router.replace('/(sampler-tabs)' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Quay lại thực đơn</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main form ──
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lưu mẫu thức ăn</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 40 : insets.bottom + 24 }]}
      >
        {/* ── Meal card (from scanned QR) ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.mealRow}>
            <Image source={meal.image} style={styles.mealImage} resizeMode="cover" />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={2}>{meal.name}</Text>
              <View style={[styles.metaBadge, { backgroundColor: colors.accent, alignSelf: 'flex-start' }]}>
                <Feather name="clock" size={11} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.primary }]}>
                  {SESSION_LABEL[meal.session] ?? meal.session}
                </Text>
              </View>
            </View>
            <View style={[styles.scannedTag, { backgroundColor: colors.safeGreenLight }]}>
              <Feather name="check" size={12} color={colors.safeGreen} />
              <Text style={[styles.scannedTagText, { color: colors.safeGreen }]}>Đã quét</Text>
            </View>
          </View>
        </View>

        {/* ── Retention choice ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thời gian lưu mẫu <Text style={{ color: colors.danger ?? '#EF4444' }}>*</Text>
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.retentionRow}>
            {RETENTION_OPTIONS.map((opt) => {
              const selected = retentionHours === opt.hours;
              return (
                <TouchableOpacity
                  key={opt.hours}
                  style={[
                    styles.retentionOption,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.accent : colors.background,
                    },
                  ]}
                  onPress={() => setRetentionHours(opt.hours)}
                  activeOpacity={0.8}
                >
                  <View style={styles.retentionTop}>
                    <View style={[
                      styles.radio,
                      { borderColor: selected ? colors.primary : colors.border },
                    ]}>
                      {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.retentionLabel, { color: selected ? colors.primary : colors.text }]}>
                      {opt.label}
                    </Text>
                  </View>
                  <Text style={[styles.retentionDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Signature ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Chữ ký người lưu mẫu <Text style={{ color: colors.danger ?? '#EF4444' }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.signatureBox, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => {}} activeOpacity={1}
          >
            <TextInput
              style={[styles.signatureInput, { color: colors.text }]}
              value={signature}
              onChangeText={setSignature}
              placeholder="Ký tên vùng này"
              placeholderTextColor={colors.mutedForeground}
              textAlign="center"
              multiline
            />
          </TouchableOpacity>
        </View>

        {/* ── Confirm ── */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: colors.primary },
            (saving || !signature.trim()) && { opacity: 0.6 },
          ]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={saving || !signature.trim()}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : (
              <>
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.confirmBtnText}>Kết thúc lưu mẫu</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },

  content: { padding: 16, gap: 12 },

  /* card */
  card: {
    borderRadius: 14, padding: 14, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth },

  /* meal card */
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#f0f0f0', flexShrink: 0 },
  mealName: { fontSize: 15, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  metaText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  scannedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, flexShrink: 0 },
  scannedTagText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },

  /* retention */
  retentionRow: { flexDirection: 'row', gap: 10 },
  retentionOption: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 12, gap: 6 },
  retentionTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 9, height: 9, borderRadius: 5 },
  retentionLabel: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  retentionDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 15 },

  /* field */
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  /* signature */
  signatureBox: { borderWidth: 1, borderRadius: 10, minHeight: 80, overflow: 'hidden' },
  signatureInput: { flex: 1, padding: 16, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 80 },

  /* confirm */
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 54, borderRadius: 16, marginTop: 4,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },

  /* success */
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  successTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  successDesc:  { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, textAlign: 'center' },
  expiryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  expiryPillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  doneBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  doneBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
