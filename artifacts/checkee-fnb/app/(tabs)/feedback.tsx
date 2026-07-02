import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { FEEDBACKS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { FeedbackItem } from '@/types';

const COMPLAINT_TYPES: { key: FeedbackItem['complaintType']; label: string; icon: string; color: string }[] = [
  { key: 'quality',  label: 'Chất lượng',  icon: 'alert-triangle',  color: '#FF9500' },
  { key: 'safety',   label: 'An toàn TP',  icon: 'shield-off',      color: '#FF3B30' },
  { key: 'quantity', label: 'Khẩu phần',   icon: 'package',         color: '#007AFF' },
  { key: 'hygiene',  label: 'Vệ sinh',     icon: 'droplet',         color: '#34C759' },
  { key: 'other',    label: 'Khác',        icon: 'more-horizontal', color: '#8E8E93' },
];

const STATUS_CONFIG: Record<FeedbackItem['status'], { label: string; color: string; bg: string }> = {
  pending:    { label: 'Chờ xử lý',     color: '#FF9500', bg: '#FFF4E5' },
  processing: { label: 'Đang xử lý',    color: '#007AFF', bg: '#E5F1FF' },
  resolved:   { label: 'Đã giải quyết', color: '#34C759', bg: '#E8F9ED' },
  rejected:   { label: 'Từ chối',       color: '#FF3B30', bg: '#FFEBEA' },
};

export default function FeedbackScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  const [showForm, setShowForm] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(FEEDBACKS);
  const [complaintType, setComplaintType] = useState<FeedbackItem['complaintType']>('quality');
  const [symptoms, setSymptoms] = useState('');
  const [symptomTime, setSymptomTime] = useState('');
  const [symptomDate, setSymptomDate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải ảnh lên.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  const handleSubmit = () => {
    if (!symptoms.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng mô tả triệu chứng hoặc sự cố.');
      return;
    }
    const now = new Date();
    const newFeedback: FeedbackItem = {
      id: `f${Date.now()}`,
      mealId: '',
      mealName: 'Bữa ăn tại trường',
      complaintType,
      description: symptoms.trim(),
      symptoms: symptoms.trim(),
      photos,
      status: 'pending',
      submittedAt:
        now.toLocaleDateString('vi-VN') +
        ' ' +
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    setSymptoms('');
    setSymptomTime('');
    setSymptomDate('');
    setComplaintType('quality');
    setPhotos([]);
    setShowForm(false);
    Alert.alert('Đã gửi', 'Phản ánh của bạn đã được gửi thành công. Nhà trường sẽ xem xét và phản hồi sớm nhất.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>Phản ánh & Khiếu nại</Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          Gửi phản ánh về chất lượng bữa ăn tại trường
        </Text>

        {/* Toggle button */}
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.newBtnText}>Gửi phản ánh mới</Text>
        </TouchableOpacity>

        {/* ── Form Modal ── */}
        <Modal
          visible={showForm}
          animationType="slide"
          transparent
          onRequestClose={() => setShowForm(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowForm(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalWrapper}
            pointerEvents="box-none"
          >
            <View style={[styles.sheet, { paddingBottom: isWeb ? 16 : insets.bottom + 8 }]}>
              {/* Sheet handle */}
              <View style={styles.sheetHandle} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Gửi phản ánh</Text>
                <TouchableOpacity onPress={() => setShowForm(false)} style={styles.closeBtn} activeOpacity={0.7}>
                  <Feather name="x" size={18} color="#364153" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.sheetContent}
              >
                {/* Inner gradient card */}
                <View style={styles.innerCard}>
                  {/* Title */}
                  <Text style={styles.formTitle}>Phản ánh sự cố món ăn (nếu có)</Text>

                  {/* Complaint type chips */}
                  <View style={styles.typeGrid}>
                    {COMPLAINT_TYPES.map((t) => {
                      const active = complaintType === t.key;
                      return (
                        <TouchableOpacity
                          key={t.key}
                          onPress={() => setComplaintType(t.key)}
                          style={[
                            styles.typeChip,
                            {
                              backgroundColor: active ? t.color + '20' : '#fff',
                              borderColor: active ? t.color : '#D3D3D3',
                            },
                          ]}
                        >
                          <Feather name={t.icon as any} size={13} color={active ? t.color : '#8E8E93'} />
                          <Text style={[styles.typeText, { color: active ? t.color : '#364153' }]}>
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Time + Date row */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Thời gian có triệu chứng *</Text>
                    <View style={styles.timeRow}>
                      <TextInput
                        value={symptomTime}
                        onChangeText={setSymptomTime}
                        placeholder="18:30"
                        placeholderTextColor="#B0B0B0"
                        style={styles.timeInput}
                      />
                      <TextInput
                        value={symptomDate}
                        onChangeText={setSymptomDate}
                        placeholder="Ngày/tháng/năm"
                        placeholderTextColor="#B0B0B0"
                        style={styles.dateInput}
                      />
                    </View>
                  </View>

                  {/* Symptoms textarea */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Triệu chứng *</Text>
                    <TextInput
                      value={symptoms}
                      onChangeText={setSymptoms}
                      placeholder="Mô tả chi tiết triệu chứng, sự cố, thời điểm phát hiện và thông tin liên quan..."
                      placeholderTextColor="#6A7282"
                      multiline
                      style={styles.symptomsInput}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Image upload */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.uploadLabel}>Tải ảnh lên (tuỳ chọn)</Text>
                    <TouchableOpacity
                      onPress={pickImage}
                      style={[styles.uploadBox, photos.length > 0 && { borderColor: '#FF6535' }]}
                      activeOpacity={0.75}
                    >
                      <View style={styles.uploadInner}>
                        <View style={styles.cameraBox}>
                          <Text style={styles.cameraEmoji}>📷</Text>
                        </View>
                        <View style={styles.uploadTextCol}>
                          <Text style={styles.uploadMainText}>
                            {photos.length > 0 ? `Đã chọn ${photos.length} ảnh` : 'Thêm hình ảnh minh hoạ'}
                          </Text>
                          <Text style={styles.uploadSubText}>PNG, JPG hoặc HEIC • Tối đa 5 ảnh</Text>
                        </View>
                        <Text style={styles.uploadLink}>Tải lên</Text>
                      </View>
                    </TouchableOpacity>

                    {photos.length > 0 && (
                      <View style={styles.thumbnailRow}>
                        {photos.map((uri) => (
                          <View key={uri} style={styles.thumbWrap}>
                            <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                            <TouchableOpacity
                              onPress={() => removePhoto(uri)}
                              style={styles.thumbRemove}
                              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                              <Feather name="x" size={10} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        ))}
                        {photos.length < 5 && (
                          <TouchableOpacity onPress={pickImage} style={styles.thumbAdd} activeOpacity={0.7}>
                            <Feather name="plus" size={20} color="#B0B0B0" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Submit */}
                  <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} activeOpacity={0.8}>
                    <Feather name="send" size={15} color="#fff" />
                    <Text style={styles.submitText}>Gửi phản ánh</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ── History ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          LỊCH SỬ PHẢN ÁNH ({feedbacks.length})
        </Text>

        {feedbacks.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Chưa có phản ánh nào
            </Text>
          </View>
        ) : (
          feedbacks.map((item) => {
            const status = STATUS_CONFIG[item.status];
            const typeInfo = COMPLAINT_TYPES.find((t) => t.key === item.complaintType);
            return (
              <View key={item.id} style={[styles.feedbackCard, { backgroundColor: colors.card }]}>
                <View style={styles.feedbackTop}>
                  <View style={[styles.typePill, { backgroundColor: (typeInfo?.color ?? '#888') + '18' }]}>
                    <Feather name={typeInfo?.icon as any} size={11} color={typeInfo?.color ?? colors.mutedForeground} />
                    <Text style={[styles.typePillText, { color: typeInfo?.color ?? colors.mutedForeground }]}>
                      {typeInfo?.label}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                <Text style={[styles.feedbackDesc, { color: colors.text }]}>{item.description}</Text>

                {item.symptoms ? (
                  <View style={[styles.symptomRow, { backgroundColor: colors.muted }]}>
                    <Feather name="activity" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.feedbackSymptoms, { color: colors.mutedForeground }]}>{item.symptoms}</Text>
                  </View>
                ) : null}

                {item.response ? (
                  <View style={[styles.responseBox, { backgroundColor: colors.safeGreenLight }]}>
                    <Text style={[styles.responseLabel, { color: colors.safeGreen }]}>Phản hồi từ nhà trường:</Text>
                    <Text style={[styles.responseText, { color: colors.text }]}>{item.response}</Text>
                  </View>
                ) : null}

                <Text style={[styles.feedbackDate, { color: colors.mutedForeground }]}>{item.submittedAt}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  pageTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 16 },

  newBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12, marginBottom: 16,
  },
  newBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },

  /* Modal */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#D1D5DC',
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EBEBEF',
  },
  sheetTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#1C1C1E' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F5F6FA',
    alignItems: 'center', justifyContent: 'center',
  },
  sheetContent: { padding: 16, gap: 0 },

  /* Inner gradient card */
  innerCard: {
    backgroundColor: '#FFF7F2',
    borderWidth: 1,
    borderColor: '#FFEDD4',
    borderRadius: 14,
    padding: 19,
    gap: 14,
  },

  /* Form title */
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000000',
    lineHeight: 24,
  },

  /* Complaint type chips */
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1,
  },
  typeText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  /* Field group */
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#364153', lineHeight: 20 },

  /* Time + Date row */
  timeRow: { flexDirection: 'row', gap: 10 },
  timeInput: {
    width: 94,
    height: 47,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1E1E1E',
  },
  dateInput: {
    flex: 1,
    height: 47,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1E1E1E',
  },

  /* Symptoms textarea */
  symptomsInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DC',
    borderRadius: 12,
    padding: 14,
    minHeight: 116,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1E2939',
    lineHeight: 21,
  },

  /* Upload */
  uploadLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#364153', lineHeight: 20 },
  uploadBox: {
    height: 90,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#D1D5DC',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  uploadInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cameraBox: {
    width: 37,
    height: 40,
    backgroundColor: '#FFEDD4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cameraEmoji: { fontSize: 17 },
  uploadTextCol: { flex: 1, gap: 2 },
  uploadMainText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#1E2939', lineHeight: 21 },
  uploadSubText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6A7282', lineHeight: 18 },
  uploadLink: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#F15D22' },

  thumbnailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 68, height: 68, borderRadius: 10, backgroundColor: '#f0f0f0' },
  thumbRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbAdd: {
    width: 68, height: 68, borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5, borderColor: '#D1D5DC', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Submit */
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 10, backgroundColor: '#FF6535',
  },
  submitText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },

  /* Section label */
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },

  /* History cards */
  feedbackCard: {
    borderRadius: 14, padding: 14, marginBottom: 10, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  feedbackTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  typePill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
  },
  typePillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  feedbackDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  symptomRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 8, borderRadius: 8 },
  feedbackSymptoms: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  responseBox: { borderRadius: 8, padding: 10, gap: 4 },
  responseLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  responseText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  feedbackDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
