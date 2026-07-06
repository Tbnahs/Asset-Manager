import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  hasError: boolean;
  colors: ReturnType<typeof useColors>;
}

function PasswordField({
  label, value, onChangeText, show, onToggleShow, placeholder,
  returnKeyType, onSubmitEditing, hasError, colors,
}: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputRow, {
        borderColor: hasError ? colors.destructive : colors.border,
        backgroundColor: colors.background,
      }]}>
        <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          returnKeyType={returnKeyType ?? 'next'}
          onSubmitEditing={onSubmitEditing}
        />
        <TouchableOpacity onPress={onToggleShow} style={styles.eyeBtn}>
          <Feather name={show ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const colors = useColors();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setSuccess(false);
    if (!currentPassword) { setError('Vui lòng nhập mật khẩu hiện tại.'); return; }
    if (!newPassword) { setError('Vui lòng nhập mật khẩu mới.'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setError('Xác nhận mật khẩu mới không khớp.'); return; }

    setError('');
    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Đổi mật khẩu thất bại.');
      return;
    }
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
              <Feather name="lock" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Đổi mật khẩu</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
              Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản
            </Text>

            <PasswordField
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={(t) => { setCurrentPassword(t); setError(''); setSuccess(false); }}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              placeholder="••••••"
              hasError={!!error && !currentPassword}
              colors={colors}
            />
            <PasswordField
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setError(''); setSuccess(false); }}
              show={showNew}
              onToggleShow={() => setShowNew((v) => !v)}
              placeholder="Ít nhất 6 ký tự"
              hasError={!!error && !newPassword}
              colors={colors}
            />
            <PasswordField
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(''); setSuccess(false); }}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              placeholder="Nhập lại mật khẩu mới"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              hasError={!!error && !confirmPassword}
              colors={colors}
            />

            {!!error && (
              <View style={[styles.msgBox, { backgroundColor: colors.dangerLight }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.msgText, { color: colors.destructive }]}>{error}</Text>
              </View>
            )}
            {success && (
              <View style={[styles.msgBox, { backgroundColor: colors.safeGreenLight }]}>
                <Feather name="check-circle" size={14} color={colors.safeGreen} />
                <Text style={[styles.msgText, { color: colors.safeGreen }]}>
                  Đổi mật khẩu thành công.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitBtnText}>Cập nhật mật khẩu</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  card: {
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    gap: 14,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  cardTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  cardSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: -8, lineHeight: 18 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, height: 48,
    overflow: 'hidden',
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', overflow: 'hidden' },
  eyeBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  msgBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
  },
  msgText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  submitBtn: {
    height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});
