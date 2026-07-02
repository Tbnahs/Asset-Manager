import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
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

  // Swipe-to-dismiss
  const slideY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (showForm) slideY.setValue(0);
  }, [showForm]);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          Animated.timing(slideY, { toValue: 600, duration: 220, useNativeDriver: true }).start(() =>
            setShowForm(false)
          );
        } else {
          Animated.spring(slideY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;
  const [symptoms, setSymptoms] = useState('');
  const [symptomDateTime, setSymptomDateTime] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const formattedTime = symptomDateTime
    ? symptomDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const formattedDate = symptomDateTime
    ? symptomDateTime.toLocaleDateString('vi-VN')
    : '';

  const onPickerChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setPickerMode(null);
    if (selected) setSymptomDateTime(selected);
  };

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
      complaintType: 'other',
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
    setSymptomDateTime(null);
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
            <Animated.View style={[styles.sheet, { paddingBottom: isWeb ? 16 : insets.bottom + 8, transform: [{ translateY: slideY }] }]}>
              {/* Sheet handle — drag target */}
              <View style={styles.sheetHandleArea} {...panResponder.panHandlers}>
                <View style={styles.sheetHandle} />
              </View>

              {/* Header — also draggable */}
              <View style={styles.sheetHeader} {...panResponder.panHandlers}>
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
                  {/* Time + Date row */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Thời gian có triệu chứng *</Text>
                    <View style={styles.timeRow}>
                      {/* Time picker button */}
                      <TouchableOpacity
                        style={styles.timeInput}
                        activeOpacity={0.7}
                        onPress={() => setPickerMode('time')}
                      >
                        <Feather name="clock" size={15} color={formattedTime ? '#1E1E1E' : '#B0B0B0'} />
                        <Text style={[styles.pickerBtnText, { color: formattedTime ? '#1E1E1E' : '#B0B0B0' }]}>
                          {formattedTime || '18:30'}
                        </Text>
                      </TouchableOpacity>
                      {/* Date picker button */}
                      <TouchableOpacity
                        style={styles.dateInput}
                        activeOpacity={0.7}
                        onPress={() => setPickerMode('date')}
                      >
                        <Feather name="calendar" size={15} color={formattedDate ? '#1E1E1E' : '#B0B0B0'} />
                        <Text style={[styles.pickerBtnText, { color: formattedDate ? '#1E1E1E' : '#B0B0B0' }]}>
                          {formattedDate || 'Ngày/tháng/năm'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* DateTimePicker — iOS: inline below, Android: modal on open */}
                    {pickerMode !== null && (
                      <DateTimePicker
                        value={symptomDateTime ?? new Date()}
                        mode={pickerMode}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onPickerChange}
                        maximumDate={new Date()}
                        locale="vi-VN"
                      />
                    )}
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
            </Animated.View>
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
            return (
              <View key={item.id} style={[styles.feedbackCard, { backgroundColor: colors.card }]}>
                <View style={styles.feedbackTop}>
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
  sheetHandleArea: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#D1D5DC',
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

  /* Field group */
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#364153', lineHeight: 20 },

  /* Time + Date row */
  timeRow: { flexDirection: 'row', gap: 10, overflow: 'hidden' },
  timeInput: {
    flex: 1,
    height: 47,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateInput: {
    flex: 2,
    height: 47,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickerBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flexShrink: 1,
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
  uploadInner: { flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
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
  uploadLink: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#F15D22', flexShrink: 0 },

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
