import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
import ZoomableImage from '@/components/ZoomableImage';
import { feedbackStore } from '@/data/feedbackStore';
import { useColors } from '@/hooks/useColors';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { FeedbackItem } from '@/types';

const STATUS_CONFIG: Record<FeedbackItem['status'], { label: string; color: string; bg: string }> = {
  pending:    { label: 'Chưa xử lý', color: '#FF9500', bg: '#FFF4E5' },
  processing: { label: 'Đang xử lý', color: '#007AFF', bg: '#E5F1FF' },
  resolved:   { label: 'Đã xử lý',   color: '#34C759', bg: '#E8F9ED' },
};

export default function FeedbackScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  const child = useSelectedChild();
  const [showForm, setShowForm] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => feedbackStore.getAll());

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
      mealName: `Bữa ăn tại trường · ${child.name} (Lớp ${child.className})`,
      description: symptoms.trim(),
      symptoms: symptoms.trim(),
      photos,
      status: 'pending',
      submittedAt:
        now.toLocaleDateString('vi-VN') +
        ' ' +
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    feedbackStore.prepend(newFeedback);
    setFeedbacks(feedbackStore.getAll());
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
                <View style={styles.sheetTitleRow}>
                  <View style={styles.sheetTitleIcon}>
                    <Feather name="message-square" size={16} color="#FF6535" />
                  </View>
                  <Text style={styles.sheetTitle}>Gửi phản ánh</Text>
                </View>
                <TouchableOpacity onPress={() => setShowForm(false)} style={styles.closeBtn} activeOpacity={0.7}>
                  <Feather name="x" size={18} color="#364153" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.sheetContent}
              >
                {/* ── Child context banner ── */}
                <View style={[styles.childBanner, { backgroundColor: child.avatarColor + '12', borderColor: child.avatarColor + '30' }]}>
                  <View style={[styles.childBannerAvatar, { backgroundColor: child.avatarColor + '25' }]}>
                    <Text style={[styles.childBannerInitial, { color: child.avatarColor }]}>{child.initial}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.childBannerName, { color: child.avatarColor }]}>{child.fullName}</Text>
                    <Text style={[styles.childBannerClass, { color: child.avatarColor + 'CC' }]}>
                      {child.grade} · Lớp {child.className} · {child.school}
                    </Text>
                  </View>
                  <Feather name="user-check" size={16} color={child.avatarColor} />
                </View>

                {/* ── Time + Date ── */}
                <View style={styles.fieldBlock}>
                  <View style={styles.fieldLabelRow}>
                    <Feather name="clock" size={13} color="#FF6535" />
                    <Text style={styles.fieldLabel}>Thời gian có triệu chứng <Text style={styles.required}>*</Text></Text>
                  </View>
                  <View style={styles.timeRow}>
                    <TouchableOpacity
                      style={[styles.timeChip, pickerMode === 'time' && styles.timeChipActive]}
                      activeOpacity={0.7}
                      onPress={() => setPickerMode(pickerMode === 'time' ? null : 'time')}
                    >
                      <Feather name="clock" size={14} color={formattedTime ? '#FF6535' : '#8E8E93'} />
                      <Text style={[styles.chipText, { color: formattedTime ? '#1E1E1E' : '#8E8E93' }]}>
                        {formattedTime || '18:30'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.dateChip, pickerMode === 'date' && styles.timeChipActive]}
                      activeOpacity={0.7}
                      onPress={() => setPickerMode(pickerMode === 'date' ? null : 'date')}
                    >
                      <Feather name="calendar" size={14} color={formattedDate ? '#FF6535' : '#8E8E93'} />
                      <Text style={[styles.chipText, { color: formattedDate ? '#1E1E1E' : '#8E8E93' }]}>
                        {formattedDate || 'Ngày / Tháng / Năm'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* DateTimePicker with visible container */}
                  {pickerMode !== null && (
                    <View style={styles.pickerContainer}>
                      <View style={styles.pickerHeader}>
                        <Text style={styles.pickerHeaderText}>
                          {pickerMode === 'time' ? 'Chọn giờ' : 'Chọn ngày'}
                        </Text>
                        <TouchableOpacity onPress={() => setPickerMode(null)} style={styles.pickerDoneBtn}>
                          <Text style={styles.pickerDoneText}>Xong</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={symptomDateTime ?? new Date()}
                        mode={pickerMode}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onPickerChange}
                        maximumDate={new Date()}
                        locale="vi-VN"
                        themeVariant="light"
                      />
                    </View>
                  )}
                </View>

                {/* ── Symptoms ── */}
                <View style={styles.fieldBlock}>
                  <View style={styles.fieldLabelRow}>
                    <Feather name="alert-circle" size={13} color="#FF6535" />
                    <Text style={styles.fieldLabel}>Triệu chứng <Text style={styles.required}>*</Text></Text>
                  </View>
                  <TextInput
                    value={symptoms}
                    onChangeText={setSymptoms}
                    placeholder="Mô tả chi tiết triệu chứng, sự cố, thời điểm phát hiện và thông tin liên quan..."
                    placeholderTextColor="#A0A8B0"
                    multiline
                    style={styles.symptomsInput}
                    textAlignVertical="top"
                  />
                </View>

                {/* ── Image upload ── */}
                <View style={styles.fieldBlock}>
                  <View style={styles.fieldLabelRow}>
                    <Feather name="image" size={13} color="#FF6535" />
                    <Text style={styles.fieldLabel}>Hình ảnh đính kèm <Text style={styles.optional}>(tuỳ chọn)</Text></Text>
                  </View>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={[styles.uploadBox, photos.length > 0 && styles.uploadBoxFilled]}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.uploadIconWrap, photos.length > 0 && styles.uploadIconWrapFilled]}>
                      <Feather name="camera" size={20} color={photos.length > 0 ? '#FF6535' : '#8E8E93'} />
                    </View>
                    <View style={styles.uploadTextCol}>
                      <Text style={[styles.uploadMainText, photos.length > 0 && { color: '#1E1E1E' }]}>
                        {photos.length > 0 ? `Đã chọn ${photos.length} ảnh` : 'Thêm hình ảnh minh hoạ'}
                      </Text>
                      <Text style={styles.uploadSubText}>PNG, JPG hoặc HEIC • Tối đa 5 ảnh</Text>
                    </View>
                    <View style={[styles.uploadBadge, photos.length > 0 && styles.uploadBadgeFilled]}>
                      <Text style={[styles.uploadBadgeText, photos.length > 0 && styles.uploadBadgeTextFilled]}>
                        Tải lên
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {photos.length > 0 && (
                    <View style={styles.thumbnailRow}>
                      {photos.map((uri) => (
                        <View key={uri} style={styles.thumbWrap}>
                          <ZoomableImage source={{ uri }} style={styles.thumb} resizeMode="cover" />
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

                {/* ── Submit ── */}
                <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} activeOpacity={0.8}>
                  <Feather name="send" size={15} color="#fff" />
                  <Text style={styles.submitText}>Gửi phản ánh</Text>
                </TouchableOpacity>
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
            const hasSymptoms = item.symptoms &&
              !['không có', 'không có triệu chứng'].includes(item.symptoms.trim().toLowerCase());
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/feedback/${item.id}` as any)}
                activeOpacity={0.75}
              >
              <View style={[styles.feedbackCard, { backgroundColor: colors.card }]}>

                {/* ── Row 1: meal name + status badge ── */}
                <View style={styles.cardHeader}>
                  <View style={styles.mealNameRow}>
                    <Feather name="package" size={13} color={colors.primary} />
                    <Text style={[styles.mealName, { color: colors.primary }]} numberOfLines={1}>
                      {item.mealName}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                {/* ── Row 2: description ── */}
                <Text style={[styles.feedbackDesc, { color: colors.text }]}>{item.description}</Text>

                {/* ── Row 3: symptoms (only if meaningful) ── */}
                {hasSymptoms ? (
                  <View style={[styles.symptomRow, { backgroundColor: colors.warningLight }]}>
                    <Feather name="alert-circle" size={13} color={colors.warning} />
                    <Text style={[styles.feedbackSymptoms, { color: colors.text }]}>{item.symptoms}</Text>
                  </View>
                ) : null}

                {/* ── Row 4: photo count ── */}
                {item.photos.length > 0 ? (
                  <View style={styles.photoCountRow}>
                    <Feather name="image" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.photoCountText, { color: colors.mutedForeground }]}>
                      {item.photos.length} ảnh đính kèm
                    </Text>
                  </View>
                ) : null}

                {/* ── Row 5: school response ── */}
                {item.response ? (
                  <View style={[styles.responseBox, {
                    backgroundColor: colors.safeGreenLight,
                    borderColor: '#B7EFC5',
                  }]}>
                    <View style={styles.responseHeader}>
                      <Feather
                        name="check-circle"
                        size={13}
                        color={colors.safeGreen}
                      />
                      <Text style={[styles.responseLabel, {
                        color: colors.safeGreen,
                      }]}>
                        Phản hồi từ nhà trường
                      </Text>
                    </View>
                    <Text style={[styles.responseText, { color: colors.text }]}>{item.response}</Text>
                  </View>
                ) : null}

                {/* ── Row 6: timeline + chevron ── */}
                <View style={styles.timelineRow}>
                  <Feather name="send" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.timelineText, { color: colors.mutedForeground }]}>
                    Gửi: {item.submittedAt}
                  </Text>
                  {item.resolvedAt ? (
                    <>
                      <Feather name="chevron-right" size={11} color={colors.mutedForeground} />
                      <Feather name="check" size={11} color={colors.safeGreen} />
                      <Text style={[styles.timelineText, { color: colors.safeGreen }]}>
                        {item.resolvedAt}
                      </Text>
                    </>
                  ) : null}
                  <View style={{ flex: 1 }} />
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                </View>

              </View>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#F7F8FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 24,
  },
  sheetHandleArea: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#C8CBD0',
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetTitleIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#FFF0EB',
    alignItems: 'center', justifyContent: 'center',
  },
  sheetTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#1C1C1E' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EBEBEF',
    alignItems: 'center', justifyContent: 'center',
  },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 16 },

  /* Field blocks */
  fieldBlock: { gap: 8 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#364153' },
  required: { color: '#FF3B30' },
  optional: { color: '#8E8E93', fontFamily: 'Inter_400Regular' },

  /* Time row */
  timeRow: { flexDirection: 'row', gap: 10 },
  timeChip: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E5EA',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dateChip: {
    flex: 2,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E5EA',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  timeChipActive: {
    borderColor: '#FF6535',
    backgroundColor: '#FFF5F2',
  },
  chipText: { fontSize: 14, fontFamily: 'Inter_500Medium', flexShrink: 1 },

  /* DateTimePicker container — ensures white bg visible on all platforms */
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF6535',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEF',
    backgroundColor: '#FFFFFF',
  },
  pickerHeaderText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1C1C1E' },
  pickerDoneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#FF6535',
    borderRadius: 8,
  },
  pickerDoneText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },

  /* Symptoms */
  symptomsInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E5EA',
    borderRadius: 12,
    padding: 14,
    minHeight: 116,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1E2939',
    lineHeight: 21,
  },

  /* Upload */
  uploadBox: {
    height: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E5EA',
    borderRadius: 12,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: '#FF6535',
    backgroundColor: '#FFF5F2',
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: '#F2F3F7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  uploadIconWrapFilled: {
    backgroundColor: '#FFEDE6',
  },
  uploadTextCol: { flex: 1, gap: 2 },
  uploadMainText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#8E8E93' },
  uploadSubText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#A0A8B0' },
  uploadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F2F3F7',
    flexShrink: 0,
  },
  uploadBadgeFilled: { backgroundColor: '#FF6535' },
  uploadBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#8E8E93' },
  uploadBadgeTextFilled: { color: '#fff' },

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
    gap: 8, paddingVertical: 15, borderRadius: 14, backgroundColor: '#FF6535',
    shadowColor: '#FF6535',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 },

  /* Child banner inside form */
  childBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  childBannerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  childBannerInitial: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  childBannerName: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  childBannerClass: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },

  /* Section label */
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },

  /* History cards */
  feedbackCard: {
    borderRadius: 16, padding: 14, marginBottom: 10, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 8,
  },
  mealNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  mealName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flexShrink: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  feedbackDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, color: '#1C1C1E' },
  symptomRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    padding: 10, borderRadius: 10,
  },
  feedbackSymptoms: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 19 },
  photoCountRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  photoCountText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  responseBox: { borderRadius: 10, padding: 12, gap: 6, borderWidth: 1 },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  responseLabel: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  responseText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  timelineText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
