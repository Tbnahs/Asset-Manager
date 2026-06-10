import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Header from '@/components/Header';
import { FEEDBACKS, MEALS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { FeedbackItem } from '@/types';

const COMPLAINT_TYPES: { key: FeedbackItem['complaintType']; label: string; icon: string; color: string }[] = [
  { key: 'quality', label: 'Chất lượng', icon: 'alert-triangle', color: '#FF9500' },
  { key: 'safety', label: 'An toàn TP', icon: 'shield-off', color: '#FF3B30' },
  { key: 'quantity', label: 'Khẩu phần', icon: 'package', color: '#007AFF' },
  { key: 'hygiene', label: 'Vệ sinh', icon: 'droplet', color: '#34C759' },
  { key: 'other', label: 'Khác', icon: 'more-horizontal', color: '#8E8E93' },
];

const STATUS_CONFIG: Record<FeedbackItem['status'], { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xử lý', color: '#FF9500', bg: '#FFF4E5' },
  processing: { label: 'Đang xử lý', color: '#007AFF', bg: '#E5F1FF' },
  resolved: { label: 'Đã giải quyết', color: '#34C759', bg: '#E8F9ED' },
  rejected: { label: 'Từ chối', color: '#FF3B30', bg: '#FFEBEA' },
};

export default function FeedbackScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const [showForm, setShowForm] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(FEEDBACKS);
  const [selectedMealId, setSelectedMealId] = useState('');
  const [complaintType, setComplaintType] = useState<FeedbackItem['complaintType']>('quality');
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = () => {
    if (!selectedMealId || !description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn bữa ăn và nhập mô tả phản ánh.');
      return;
    }
    const meal = MEALS.find((m) => m.id === selectedMealId);
    const newFeedback: FeedbackItem = {
      id: `f${Date.now()}`,
      mealId: selectedMealId,
      mealName: meal?.name ?? '',
      complaintType,
      description: description.trim(),
      symptoms: symptoms.trim(),
      photos: [],
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    setSelectedMealId('');
    setDescription('');
    setSymptoms('');
    setComplaintType('quality');
    setShowForm(false);
    Alert.alert('Đã gửi', 'Phản ánh của bạn đã được gửi thành công. Nhà trường sẽ xem xét và phản hồi sớm nhất.');
  };

  const uniqueMeals = MEALS.filter(
    (m, i, arr) => arr.findIndex((x) => x.name === m.name) === i
  );

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
          Gửi phản ánh về chất lượng bữa ăn
        </Text>

        {/* New feedback button */}
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Feather name={showForm ? 'x' : 'plus'} size={18} color="#fff" />
          <Text style={styles.newBtnText}>
            {showForm ? 'Đóng form' : 'Gửi phản ánh mới'}
          </Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={[styles.form, { backgroundColor: colors.card }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Thông tin phản ánh</Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Chọn bữa ăn *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealScroll}>
              {uniqueMeals.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setSelectedMealId(m.id)}
                  style={[
                    styles.mealChip,
                    {
                      backgroundColor: selectedMealId === m.id ? colors.primary : colors.muted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.mealChipText,
                      { color: selectedMealId === m.id ? '#fff' : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Loại phản ánh *</Text>
            <View style={styles.typeGrid}>
              {COMPLAINT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setComplaintType(t.key)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor:
                        complaintType === t.key ? t.color + '20' : colors.muted,
                      borderColor: complaintType === t.key ? t.color : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Feather name={t.icon as any} size={14} color={complaintType === t.key ? t.color : colors.mutedForeground} />
                  <Text
                    style={[
                      styles.typeText,
                      { color: complaintType === t.key ? t.color : colors.mutedForeground },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Mô tả vấn đề *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[
                styles.textArea,
                { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Triệu chứng (nếu có)</Text>
            <TextInput
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Mô tả triệu chứng nếu có (buồn nôn, đau bụng...)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={2}
              style={[
                styles.textArea,
                { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border },
              ]}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.submitText}>Gửi phản ánh</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* History */}
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
                  <View style={styles.feedbackMeta}>
                    <Text style={[styles.feedbackMeal, { color: colors.text }]}>
                      {item.mealName}
                    </Text>
                    <View style={[styles.typePill, { backgroundColor: (typeInfo?.color ?? '#888') + '18' }]}>
                      <Text style={[styles.typePillText, { color: typeInfo?.color ?? colors.mutedForeground }]}>
                        {typeInfo?.label}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={[styles.feedbackDesc, { color: colors.text }]}>
                  {item.description}
                </Text>
                {item.symptoms ? (
                  <Text style={[styles.feedbackSymptoms, { color: colors.mutedForeground }]}>
                    Triệu chứng: {item.symptoms}
                  </Text>
                ) : null}
                {item.response ? (
                  <View style={[styles.responseBox, { backgroundColor: colors.safeGreenLight }]}>
                    <Text style={[styles.responseLabel, { color: colors.safeGreen }]}>Phản hồi từ nhà trường:</Text>
                    <Text style={[styles.responseText, { color: colors.text }]}>{item.response}</Text>
                  </View>
                ) : null}
                <Text style={[styles.feedbackDate, { color: colors.mutedForeground }]}>
                  {item.submittedAt}
                </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  newBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  form: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 8 },
  mealScroll: { marginVertical: 6 },
  mealChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 160,
  },
  mealChipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  textArea: {
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    marginVertical: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 8,
  },
  submitText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  feedbackCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  feedbackTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  feedbackMeta: { flex: 1, gap: 4 },
  feedbackMeal: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  typePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typePillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  feedbackDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  feedbackSymptoms: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  responseBox: { borderRadius: 8, padding: 10, gap: 4 },
  responseLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  responseText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  feedbackDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
