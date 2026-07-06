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

type Step = 'phone' | 'reset';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const { requestPasswordResetOtp, resetPasswordWithOtp } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại.'); return; }
    setError('');
    setLoading(true);
    const result = await requestPasswordResetOtp(phone);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Không thể gửi mã OTP.');
      return;
    }
    setDevOtp(result.otp ?? '');
    setStep('reset');
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) { setError('Vui lòng nhập mã OTP.'); return; }
    if (!newPassword) { setError('Vui lòng nhập mật khẩu mới.'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setError('Xác nhận mật khẩu mới không khớp.'); return; }

    setError('');
    setLoading(true);
    const result = await resetPasswordWithOtp(phone, otp, newPassword);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Đặt lại mật khẩu thất bại.');
      return;
    }
    setSuccess(true);
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    const result = await requestPasswordResetOtp(phone);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Không thể gửi lại mã OTP.');
      return;
    }
    setDevOtp(result.otp ?? '');
    setOtp('');
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.scroll}>
          <View style={[styles.card, styles.successCard, { backgroundColor: colors.card }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.safeGreenLight }]}>
              <Feather name="check-circle" size={26} color={colors.safeGreen} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Đặt lại mật khẩu thành công</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground, textAlign: 'center', marginTop: -4 }]}>
              Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
            </Text>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary, marginTop: 8 }]}
              onPress={() => router.replace('/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Về trang đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
              <Feather name="message-circle" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Quên mật khẩu</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
              {step === 'phone'
                ? 'Nhập số điện thoại đã đăng ký để nhận mã OTP qua SMS'
                : `Nhập mã OTP đã gửi tới số ${phone} và mật khẩu mới`}
            </Text>

            {step === 'phone' && (
              <View style={styles.fieldWrap}>
                <Text style={[styles.label, { color: colors.text }]}>Số điện thoại</Text>
                <View style={[styles.inputRow, {
                  borderColor: error && !phone.trim() ? colors.destructive : colors.border,
                  backgroundColor: colors.background,
                }]}>
                  <Feather name="phone" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="0912 345 678"
                    placeholderTextColor={colors.mutedForeground}
                    value={phone}
                    onChangeText={(t) => { setPhone(t); setError(''); }}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                  />
                </View>
              </View>
            )}

            {step === 'reset' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: colors.text }]}>Mã OTP</Text>
                  <View style={[styles.inputRow, {
                    borderColor: error && !otp.trim() ? colors.destructive : colors.border,
                    backgroundColor: colors.background,
                  }]}>
                    <Feather name="shield" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Nhập mã 6 số"
                      placeholderTextColor={colors.mutedForeground}
                      value={otp}
                      onChangeText={(t) => { setOtp(t); setError(''); }}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="next"
                    />
                  </View>
                  <TouchableOpacity onPress={handleResendOtp} disabled={loading} style={styles.resendBtn}>
                    <Text style={[styles.resendText, { color: colors.primary }]}>Gửi lại mã OTP</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: colors.text }]}>Mật khẩu mới</Text>
                  <View style={[styles.inputRow, {
                    borderColor: error && !newPassword ? colors.destructive : colors.border,
                    backgroundColor: colors.background,
                  }]}>
                    <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Ít nhất 6 ký tự"
                      placeholderTextColor={colors.mutedForeground}
                      value={newPassword}
                      onChangeText={(t) => { setNewPassword(t); setError(''); }}
                      secureTextEntry={!showNew}
                      returnKeyType="next"
                    />
                    <TouchableOpacity onPress={() => setShowNew((v) => !v)} style={styles.eyeBtn}>
                      <Feather name={showNew ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: colors.text }]}>Xác nhận mật khẩu mới</Text>
                  <View style={[styles.inputRow, {
                    borderColor: error && !confirmPassword ? colors.destructive : colors.border,
                    backgroundColor: colors.background,
                  }]}>
                    <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor={colors.mutedForeground}
                      value={confirmPassword}
                      onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                      secureTextEntry={!showConfirm}
                      returnKeyType="done"
                      onSubmitEditing={handleResetPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                      <Feather name={showConfirm ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                </View>

                {!!devOtp && (
                  <View style={[styles.msgBox, { backgroundColor: colors.accent }]}>
                    <Feather name="info" size={14} color={colors.primary} />
                    <Text style={[styles.msgText, { color: colors.primary }]}>
                      Bản demo: mã OTP vừa gửi qua SMS là {devOtp}
                    </Text>
                  </View>
                )}
              </>
            )}

            {!!error && (
              <View style={[styles.msgBox, { backgroundColor: colors.dangerLight }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.msgText, { color: colors.destructive }]}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
              onPress={step === 'phone' ? handleSendOtp : handleResetPassword}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitBtnText}>
                    {step === 'phone' ? 'Gửi mã OTP qua SMS' : 'Đặt lại mật khẩu'}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => (step === 'reset' ? setStep('phone') : router.back())}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>
                {step === 'reset' ? 'Đổi số điện thoại' : 'Huỷ'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 32, justifyContent: 'center' },
  card: {
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    gap: 14,
  },
  successCard: { alignItems: 'center', textAlign: 'center' },
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
  resendBtn: { alignSelf: 'flex-end', paddingVertical: 4 },
  resendText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
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
