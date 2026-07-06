import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại.'); return; }
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }
    setError('');
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Đăng nhập thất bại.');
    } else {
      router.replace('/(tabs)');
    }
  };

  const fillDemo = () => {
    setError('');
    setPhone('0912 345 678');
    setPassword('123456');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/app-logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>

          {/* Form */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Đăng nhập</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
              Dành cho phụ huynh học sinh
            </Text>

            {/* Phone */}
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
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Mật khẩu</Text>
              <View style={[styles.inputRow, {
                borderColor: error && !password ? colors.destructive : colors.border,
                backgroundColor: colors.background,
              }]}>
                <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/forgot-password')}
                style={styles.forgotBtn}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Error */}
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
              </View>
            )}

            {/* Button */}
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.loginBtnText}>Đăng nhập</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Demo account */}
          <TouchableOpacity
            style={[styles.demoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={fillDemo}
            activeOpacity={0.75}
          >
            <View style={styles.demoLeft}>
              <View style={[styles.demoAvatar, { backgroundColor: colors.accent }]}>
                <Text style={[styles.demoAvatarText, { color: colors.primary }]}>H</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.demoTopRow}>
                  <Feather name="info" size={12} color={colors.info} />
                  <Text style={[styles.demoHint, { color: colors.info }]}>Tài khoản demo</Text>
                </View>
                <Text style={[styles.demoName, { color: colors.text }]}>Nguyễn Thị Hương</Text>
                <Text style={[styles.demoCreds, { color: colors.mutedForeground }]}>
                  0912 345 678 · Mật khẩu: 123456
                </Text>
                <Text style={[styles.demoChildren, { color: colors.mutedForeground }]}>
                  2 học sinh: Bé An (2A) · Bé Bình (3B)
                </Text>
              </View>
            </View>
            <View style={[styles.fillBtn, { backgroundColor: colors.accent }]}>
              <Text style={[styles.fillBtnText, { color: colors.primary }]}>Dùng thử</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            ISCHOOL F&B © 2024 · Bảo mật thông tin học sinh
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 32, gap: 16 },
  header: { alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  logoImg: {
    width: '100%',
    maxWidth: 440,
    height: 200,
    alignSelf: 'center',
    marginBottom: 8,
  },
  tagline: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  card: {
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    gap: 14,
  },
  cardTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  cardSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: -6 },
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
  forgotBtn: { alignSelf: 'flex-end', paddingTop: 2 },
  forgotText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  loginBtn: {
    height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  demoCard: {
    borderRadius: 16, padding: 14, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  demoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  demoAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  demoAvatarText: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  demoTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  demoHint: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  demoName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  demoCreds: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  demoChildren: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  fillBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, flexShrink: 0,
  },
  fillBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  footer: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
});
