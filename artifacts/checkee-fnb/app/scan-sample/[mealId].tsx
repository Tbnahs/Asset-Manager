import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
import { IngredientRow, SamplerRecord, useSampler } from '@/contexts/SamplerContext';
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

function fmtNow(): string {
  const d = new Date();
  const dd  = String(d.getDate()).padStart(2, '0');
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const hh  = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
}

function getMealCode(mealId: string): string {
  const n = parseInt(mealId.replace(/\D/g, ''), 10) || 1;
  return String(1753402410000 + n * 1000 + 99);
}

// ─── constants ──────────────────────────────────────────────────────────────

const MEAL_TYPES = [
  {
    key: 'dac',
    label: 'Đặc (nấu chín)',
    desc: 'Đặc (nấu chín): Món ăn được theo dõi trong 24h từ lúc bắt đầu chế biến.',
  },
  {
    key: 'thuong',
    label: 'Thường (nấu chín)',
    desc: 'Thường (nấu chín): Món ăn được theo dõi theo quy trình tiêu chuẩn 12h.',
  },
  {
    key: 'song',
    label: 'Sống (chưa chế biến)',
    desc: 'Sống: Nguyên liệu chưa qua chế biến, bảo quản lạnh 0–4°C.',
  },
  {
    key: 'do_uong',
    label: 'Đồ uống',
    desc: 'Đồ uống: Theo dõi trong 12h, bảo quản ở nhiệt độ phòng hoặc lạnh.',
  },
  {
    key: 'trang_mieng',
    label: 'Tráng miệng',
    desc: 'Tráng miệng: Theo dõi 24h, bảo quản lạnh 4–8°C.',
  },
];

const INGREDIENT_OPTIONS = [
  'Bún tươi', 'Thịt bò', 'Thịt heo', 'Tôm sú', 'Mực ống',
  'Gạo tẻ', 'Bí đỏ', 'Rau muống', 'Cải ngọt', 'Cà chua',
  'Trứng gà', 'Đậu hũ', 'Cá hồi', 'Cá basa', 'Khoai tây',
];

const SUPPLIER_OPTIONS = [
  'Công ty TNHH Thực phẩm An Việt',
  'HTX Nông sản Lâm Đồng',
  'Công ty CP Thủy sản Minh Phú',
  'Cơ sở chế biến Hương Thảo',
  'Siêu thị BigC – phân phối',
];

const UNIT_OPTIONS = ['Gram', 'Kg', 'Lít', 'ml', 'Cái', 'Trái', 'Bó', 'Túi'];

// ─── sub-components ─────────────────────────────────────────────────────────

function DropdownPicker({
  value,
  options,
  placeholder,
  onChange,
  colors,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={[dp.trigger, { borderColor: colors.border, backgroundColor: colors.background }]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.75}
      >
        <Text style={[dp.triggerText, { color: value ? colors.text : colors.mutedForeground }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={[dp.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[dp.option, { borderBottomColor: colors.border }]}
              onPress={() => { onChange(opt); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={[dp.optionText, { color: colors.text }]}>{opt}</Text>
              {opt === value && <Feather name="check" size={13} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const dp = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
  },
  triggerText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  menu: {
    borderWidth: 1, borderRadius: 8, marginTop: 4,
    zIndex: 99, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
    maxHeight: 220, overflow: 'scroll' as any,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
});

// ─── main screen ─────────────────────────────────────────────────────────────

export default function ScanSampleScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb  = Platform.OS === 'web';
  const { addRecord, isMealRecordedToday } = useSampler();
  const { user } = useAuth();

  // Role guard
  React.useEffect(() => {
    if (user && user.role !== 'Người lưu mẫu') {
      router.replace('/(tabs)');
    }
  }, [user]);

  const meal = MEALS.find((m) => m.id === mealId);
  const mealCode = meal ? getMealCode(meal.id) : '';
  const alreadyDone = meal ? isMealRecordedToday(meal.id) : false;

  // Form state
  const [photoUri, setPhotoUri]         = useState<string | null>(null);
  const [mealName, setMealName]         = useState(meal?.name ?? '');
  const [mealTypeKey, setMealTypeKey]   = useState('dac');
  const [temperature, setTemperature]   = useState('');
  const [weight, setWeight]             = useState('');
  const [container, setContainer]       = useState('');
  const [startProcess, setStartProcess] = useState(true);
  const [notes, setNotes]               = useState('Lorem ipsum dolor sit amet consectetur. At at sed convallis bibendum. Sapien laoreet feugiat arcu feugiat imperdiet. Nisi aliquam ut vel suspendisse. Non eget id nisi nibh quis pretium.');
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>([
    { name: '', supplier: '', unit: 'Gram', quantity: '' },
  ]);
  const [signature, setSignature]       = useState('');
  const [saving, setSaving]             = useState(false);
  const [done, setDone]                 = useState(false);

  const selectedType = MEAL_TYPES.find((t) => t.key === mealTypeKey);

  // Photo picker
  const pickPhoto = async () => {
    if (isWeb) {
      // On web: use input[type=file] simulation via expo-image-picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  // Ingredient rows helpers
  const updateRow = (idx: number, field: keyof IngredientRow, val: string) => {
    setIngredientRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  };
  const addRow = () =>
    setIngredientRows((rows) => [...rows, { name: '', supplier: '', unit: 'Gram', quantity: '' }]);
  const removeRow = (idx: number) =>
    setIngredientRows((rows) => rows.filter((_, i) => i !== idx));

  // Submit
  const handleConfirm = async () => {
    if (!meal || !user) return;
    setSaving(true);
    const record: SamplerRecord = {
      id:           `sr-${meal.id}-${Date.now()}`,
      mealId:       meal.id,
      mealName:     mealName,
      mealImage:    meal.image,
      session:      meal.session,
      recordedAt:   fmtNow(),
      recordedDate: localDateISO(),
      recordedBy:   user.name,
      photoUri:     photoUri ?? undefined,
      mealCode,
      mealTypeLabel: selectedType?.label,
      temperature:  temperature.trim() || undefined,
      weight:       weight.trim() || undefined,
      container:    container.trim() || undefined,
      startProcess,
      processCode:  'MTHS-001',
      ingredientRows: ingredientRows.filter((r) => r.name),
      signature:    signature.trim() || undefined,
      // keep legacy fields for history display
      storageLocation: '-',
      sampleCount: 1,
      notes: notes.trim(),
    };
    await addRecord(record);
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
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{mealName}</Text>
            {' '}đã được ghi nhận lúc{' '}
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>{fmtNow()}</Text>.
          </Text>
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
        {/* Already done warning */}
        {alreadyDone && (
          <View style={[styles.warnBox, { backgroundColor: '#FFF4E5' }]}>
            <Feather name="alert-triangle" size={14} color="#FF9500" />
            <Text style={[styles.warnText, { color: '#CC7700' }]}>
              Món này đã được lưu mẫu hôm nay. Bạn vẫn có thể ghi nhận thêm nếu cần.
            </Text>
          </View>
        )}

        {/* ── Photo upload ── */}
        <TouchableOpacity
          style={[styles.photoUpload, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={pickPhoto}
          activeOpacity={0.75}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Feather name="upload" size={20} color={colors.mutedForeground} />
              <Text style={[styles.photoPlaceholderText, { color: colors.mutedForeground }]}>
                Nhấn để tải ảnh thực đơn
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Basic info ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Tên món */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Tên món ăn/thực đơn <Text style={{ color: colors.danger ?? '#EF4444' }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={mealName}
              onChangeText={setMealName}
              placeholder="Tên món ăn"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Mã thực đơn */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Mã thực đơn <Text style={{ color: colors.danger ?? '#EF4444' }}>*</Text>
            </Text>
            <View style={[styles.input, styles.inputReadOnly, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Text style={[{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }]}>
                {mealCode}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Loại thực đơn */}
          <View style={[styles.fieldGroup, { zIndex: 10 }]}>
            <Text style={[styles.label, { color: colors.text }]}>
              Loại thực đơn <Text style={{ color: colors.danger ?? '#EF4444' }}>*</Text>
            </Text>
            <DropdownPicker
              value={selectedType?.label ?? ''}
              options={MEAL_TYPES.map((t) => t.label)}
              placeholder="Chọn loại thực đơn"
              onChange={(v) => {
                const t = MEAL_TYPES.find((x) => x.label === v);
                if (t) setMealTypeKey(t.key);
              }}
              colors={colors}
            />
          </View>

          {/* Type description */}
          {selectedType && (
            <View style={[styles.typeDesc, { backgroundColor: colors.accent }]}>
              <Text style={[styles.typeDescText, { color: colors.primary }]}>{selectedType.desc}</Text>
            </View>
          )}
        </View>

        {/* ── Sample details ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chi tiết mẫu lưu trữ</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nhiệt độ bảo quản mẫu</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={temperature}
              onChangeText={setTemperature}
              placeholder="Nhập nhiệt độ (°C)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Khối lượng lưu mẫu (Kg, lt,...)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="Nhập khối lượng"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Dụng cụ chứa mẫu thức ăn lưu</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={container}
              onChangeText={setContainer}
              placeholder="Nhập dụng cụ chứa mẫu thức ăn lưu"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        {/* ── Process ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setStartProcess((v) => !v)}
            activeOpacity={0.75}
          >
            <View style={[styles.checkbox, {
              backgroundColor: startProcess ? colors.primary : 'transparent',
              borderColor: startProcess ? colors.primary : colors.border,
            }]}>
              {startProcess && <Feather name="check" size={11} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>
              Bắt đầu quy trình chế biến{' '}
              <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>(lưu việt)</Text>
            </Text>
          </TouchableOpacity>

          <View style={[styles.checkNotice, { backgroundColor: colors.accent }]}>
            <Text style={[styles.checkNoticeText, { color: colors.mutedForeground }]}>
              Lưu ý: Khi bắt đầu quy trình chế biến sẽ không thể thay đổi, cập nhật thông tin thực đơn cho đến khi kết thúc qua trình theo dõi.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Process code */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Quy trình chế biến <Text style={{ color: colors.danger ?? '#EF4444' }}>*</Text>
            </Text>
            <View style={[styles.input, styles.inputReadOnly, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>
                MTHS-001
              </Text>
            </View>
          </View>

          {/* Chef card */}
          <View style={[styles.chefCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.chefRow}>
              <Text style={[styles.chefRoleLabel, { color: colors.mutedForeground }]}>Đầu bếp chính:</Text>
              <Text style={[styles.chefName, { color: colors.text }]}>Nguyễn Văn Tuấn</Text>
              <View style={[styles.checkeeTag, { backgroundColor: colors.accent }]}>
                <Text style={[styles.checkeeTagText, { color: colors.primary }]}>Đầu bếp Checkee</Text>
              </View>
            </View>
            <Text style={[styles.chefNoteLabel, { color: colors.mutedForeground }]}>Ghi chú cho quy trình này:</Text>
            <TextInput
              style={[styles.notesInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.mutedForeground}
              placeholder="Ghi chú..."
            />
          </View>
        </View>

        {/* ── Ingredients ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nguyên liệu</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {ingredientRows.map((row, idx) => (
            <View key={idx} style={[styles.ingredientRow, { borderColor: colors.border }]}>
              <View style={{ zIndex: 100 - idx }}>
                <DropdownPicker
                  value={row.name}
                  options={INGREDIENT_OPTIONS}
                  placeholder="Chọn tên nguyên liệu"
                  onChange={(v) => updateRow(idx, 'name', v)}
                  colors={colors}
                />
              </View>
              <View style={{ zIndex: 90 - idx }}>
                <DropdownPicker
                  value={row.supplier}
                  options={SUPPLIER_OPTIONS}
                  placeholder="Chọn tên nguyên liệu"
                  onChange={(v) => updateRow(idx, 'supplier', v)}
                  colors={colors}
                />
              </View>
              <View style={styles.ingredientBottom}>
                <View style={[{ flex: 1 }, { zIndex: 80 - idx }]}>
                  <DropdownPicker
                    value={row.unit}
                    options={UNIT_OPTIONS}
                    placeholder="Chọn lô"
                    onChange={(v) => updateRow(idx, 'unit', v)}
                    colors={colors}
                  />
                </View>
                <TextInput
                  style={[styles.qtyInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text, flex: 1 }]}
                  value={row.quantity}
                  onChangeText={(v) => updateRow(idx, 'quantity', v)}
                  placeholder="Nhập số lượng"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />
                {ingredientRows.length > 1 && (
                  <TouchableOpacity onPress={() => removeRow(idx)} style={styles.removeRowBtn}>
                    <Feather name="x" size={15} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addRowBtn, { borderColor: colors.primary }]}
            onPress={addRow}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={14} color={colors.primary} />
            <Text style={[styles.addRowText, { color: colors.primary }]}>Thêm nguyên liệu</Text>
          </TouchableOpacity>
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
            (saving || !mealName.trim()) && { opacity: 0.6 },
          ]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={saving || !mealName.trim()}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : (
              <>
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.confirmBtnText}>Xác nhận</Text>
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

  warnBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 12, borderRadius: 12 },
  warnText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, flex: 1 },

  /* photo */
  photoUpload: {
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, overflow: 'hidden',
    minHeight: 90, alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholder: { alignItems: 'center', gap: 6, paddingVertical: 24 },
  photoPlaceholderText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  photoPreview: { width: '100%', height: 180 },

  /* card */
  card: {
    borderRadius: 14, padding: 14, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth },

  /* field */
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  input: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  inputReadOnly: { justifyContent: 'center' },
  typeDesc: { borderRadius: 8, padding: 10 },
  typeDescText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },

  /* process */
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', flex: 1, lineHeight: 20 },
  checkNotice: { borderRadius: 8, padding: 10 },
  checkNoticeText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },

  chefCard: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  chefRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chefRoleLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  chefName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', flex: 1 },
  checkeeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  checkeeTagText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  chefNoteLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  notesInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 13, fontFamily: 'Inter_400Regular', minHeight: 80 },

  /* ingredients */
  ingredientRow: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 12, marginBottom: 4, gap: 8 },
  ingredientBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyInput: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  removeRowBtn: { padding: 8 },
  addRowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 10,
    paddingVertical: 10, marginTop: 4,
  },
  addRowText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

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
  doneBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  doneBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
