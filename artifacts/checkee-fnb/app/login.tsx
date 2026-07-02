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

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setError('Vui lòng nhập email.'); return; }
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Đăng nhập thất bại.');
    } else {
      router.replace('/(tabs)');
    }
  };

  const fillDemo = (which: 1 | 2) => {
    setError('');
    if (which === 1) { setEmail('huong.nguyen@gmail.com'); setPassword('123456'); }
    else { setEmail('minh.tran@gmail.com'); setPassword('123456'); }
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
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoWrap, { backgroundColor: colors.accent }]}>
              <Feather name="shield" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>CHECKEE F&B</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              Hệ thống giám sát dinh dưỡng trường học
            </Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Đăng nhập</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
              Nhập thông tin tài khoản phụ huynh
            </Text>

            {/* Email field */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View style={[styles.inputRow, { borderColor: error && !email ? colors.destructive : colors.border, backgroundColor: colors.background }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="example@gmail.com"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Mật khẩu</Text>
              <View style={[styles.inputRow, { borderColor: error && !password ? colors.destructive : colors.border, backgroundColor: colors.background }]}>
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
            </View>

            {/* Error */}
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
              </View>
            )}

            {/* Login button */}
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

          {/* Demo accounts */}
          <View style={[styles.demoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.demoHeader}>
              <Feather name="info" size={14} color={colors.info} />
              <Text style={[styles.demoTitle, { color: colors.info }]}>Tài khoản demo</Text>
            </View>
            <TouchableOpacity style={[styles.demoRow, { borderColor: colors.border }]} onPress={() => fillDemo(1)} activeOpacity={0.7}>
              <View style={[styles.demoAvatar, { backgroundColor: colors.accent }]}>
                <Text style={[styles.demoAvatarText, { color: colors.primary }]}>H</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.demoName, { color: colors.text }]}>Nguyễn Thị Hương</Text>
                <Text style={[styles.demoEmail, { color: colors.mutedForeground }]}>huong.nguyen@gmail.com · 123456</Text>
              </View>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.demoRow, { borderColor: 'transparent' }]} onPress={() => fillDemo(2)} activeOpacity={0.7}>
              <View style={[styles.demoAvatar, { backgroundColor: '#E5F1FF' }]}>
                <Text style={[styles.demoAvatarText, { color: '#007AFF' }]}>M</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.demoName, { color: colors.text }]}>Trần Văn Minh</Text>
                <Text style={[styles.demoEmail, { color: colors.mutedForeground }]}>minh.tran@gmail.com · 123456</Text>
              </View>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            CHECKEE F&B © 2024 · Bảo mật thông tin học sinh
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 32, gap: 16 },
  header: { alignItems: 'center', gap: 8, marginBottom: 8 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  appName: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
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
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  eyeBtn: { padding: 4 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  loginBtn: {
    height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  demoCard: {
    borderRadius: 16, padding: 14,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  demoTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  demoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  demoAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  demoAvatarText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  demoName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  demoEmail: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  footer: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
});
