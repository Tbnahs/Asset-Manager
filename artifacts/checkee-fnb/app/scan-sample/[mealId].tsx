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
import { SamplerRecord, useSampler } from '@/contexts/SamplerContext';
import { MEALS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

function localDateISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const SESSION_LABEL: Record<string, string> = {
  sang: 'Buổi sáng',
  trua: 'Buổi trưa',
  chieu: 'Buổi chiều',
  phu: 'Bữa phụ',
};

const STORAGE_LOCATIONS = [
  'Tủ lạnh A - Ngăn 1',
  'Tủ lạnh A - Ngăn 2',
  'Tủ lạnh B - Ngăn 1',
  'Tủ lạnh B - Ngăn 2',
];

const SESSION_DEFAULT_STORAGE: Record<string, string> = {
  sang:  'Tủ lạnh A - Ngăn 1',
  trua:  'Tủ lạnh A - Ngăn 2',
  chieu: 'Tủ lạnh B - Ngăn 1',
  phu:   'Tủ lạnh B - Ngăn 2',
};

function fmtNow() {
  const d = new Date();
  const dd  = String(d.getDate()).padStart(2, '0');
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const hh  = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
}

export default function ScanSampleScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb  = Platform.OS === 'web';
  const { addRecord, isMealRecordedToday } = useSampler();
  const { user } = useAuth();

  // Role guard — redirect non-sampler users away
  React.useEffect(() => {
    if (user && user.role !== 'Người lưu mẫu') {
      router.replace('/(tabs)');
    }
  }, [user]);

  const meal = MEALS.find((m) => m.id === mealId);

  const [location, setLocation] = useState(
    meal ? (SESSION_DEFAULT_STORAGE[meal.session] ?? STORAGE_LOCATIONS[0]) : STORAGE_LOCATIONS[0],
  );
  const [count, setCount]   = useState(3);
  const [notes, setNotes]   = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  const alreadyDone = meal ? isMealRecordedToday(meal.id) : false;

  const handleConfirm = async () => {
    if (!meal || !user) return;
    setSaving(true);
    const today = localDateISO();
    const record: SamplerRecord = {
      id:              `sr-${meal.id}-${Date.now()}`,
      mealId:          meal.id,
      mealName:        meal.name,
      mealImage:       meal.image,
      session:         meal.session,
      recordedAt:      fmtNow(),
      recordedDate:    today,
      storageLocation: location,
      sampleCount:     count,
      notes:           notes.trim(),
      recordedBy:      user.name,
    };
    await addRecord(record);
    setSaving(false);
    setDone(true);
  };

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

  /* ── Success state ── */
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
            <Feather name="check-circle" size={48} color={colors.safeGreen} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Lưu mẫu thành công!</Text>
          <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
            Mẫu của{' '}
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{meal.name}</Text>
            {' '}đã được ghi nhận tại{' '}
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{location}</Text>.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.safeGreen }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Quay lại thực đơn</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 34 : insets.bottom + 24 }]}
      >
        {/* Meal info */}
        <View style={[styles.mealCard, { backgroundColor: colors.card }]}>
          <Image source={meal.image} style={styles.mealImg} resizeMode="cover" />
          <View style={styles.mealInfo}>
            <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Feather name="clock" size={10} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {SESSION_LABEL[meal.session] ?? meal.session}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                <Feather name="tag" size={10} color={colors.mutedForeground} />
                <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{meal.category}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Already recorded warning */}
        {alreadyDone && (
          <View style={[styles.warnBox, { backgroundColor: '#FFF4E5' }]}>
            <Feather name="alert-triangle" size={14} color="#FF9500" />
            <Text style={[styles.warnText, { color: '#CC7700' }]}>
              Món này đã được lưu mẫu hôm nay. Bạn vẫn có thể ghi nhận thêm nếu cần.
            </Text>
          </View>
        )}

        {/* ── Form ── */}
        {/* Storage location */}
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.formSectionTitle, { color: colors.text }]}>
            <Feather name="archive" size={14} color={colors.primary} />
            {'  '}Vị trí lưu mẫu
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {STORAGE_LOCATIONS.map((loc) => {
            const active = location === loc;
            return (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.locRow,
                  {
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setLocation(loc)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {active && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.locText, { color: active ? colors.primary : colors.text }]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sample count */}
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.formSectionTitle, { color: colors.text }]}>
            <Feather name="layers" size={14} color={colors.primary} />
            {'  '}Số lượng mẫu lưu
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepBtn, { borderColor: colors.border, opacity: count <= 1 ? 0.4 : 1 }]}
              onPress={() => setCount((c) => Math.max(1, c - 1))}
              activeOpacity={0.7}
              disabled={count <= 1}
            >
              <Feather name="minus" size={18} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.countDisplay, { backgroundColor: colors.accent }]}>
              <Text style={[styles.countNum, { color: colors.primary }]}>{count}</Text>
              <Text style={[styles.countUnit, { color: colors.primary }]}>mẫu</Text>
            </View>
            <TouchableOpacity
              style={[styles.stepBtn, { borderColor: colors.border, opacity: count >= 10 ? 0.4 : 1 }]}
              onPress={() => setCount((c) => Math.min(10, c + 1))}
              activeOpacity={0.7}
              disabled={count >= 10}
            >
              <Feather name="plus" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.stepperHint, { color: colors.mutedForeground }]}>
            Tối thiểu 1, tối đa 10 mẫu
          </Text>
        </View>

        {/* Notes */}
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.formSectionTitle, { color: colors.text }]}>
            <Feather name="edit-3" size={14} color={colors.primary} />
            {'  '}Ghi chú (tuỳ chọn)
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TextInput
            style={[styles.notesInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Ví dụ: mẫu được lấy lúc 10:30, suất ăn số 47..."
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.safeGreen }, saving && { opacity: 0.7 }]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : (
              <>
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.confirmBtnText}>Xác nhận lưu mẫu</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },

  content: { padding: 16, gap: 12 },

  mealCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  mealImg: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#f0f0f0', flexShrink: 0 },
  mealInfo: { flex: 1, gap: 8 },
  mealName: { fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_500Medium' },

  warnBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 12, borderRadius: 12 },
  warnText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, flex: 1 },

  formCard: {
    borderRadius: 16, padding: 14, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  formSectionTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth },

  locRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  locText: { fontSize: 14, fontFamily: 'Inter_500Medium', flex: 1 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  countDisplay: {
    flexDirection: 'row', alignItems: 'baseline', gap: 4,
    paddingHorizontal: 28, paddingVertical: 10, borderRadius: 14,
  },
  countNum: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  countUnit: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  stepperHint: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  notesInput: {
    borderWidth: 1, borderRadius: 12, padding: 12,
    fontSize: 14, fontFamily: 'Inter_400Regular',
    minHeight: 80,
  },

  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 54, borderRadius: 16, marginTop: 4,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },

  /* Success */
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  successTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  successDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, textAlign: 'center' },
  doneBtn: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 8,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
