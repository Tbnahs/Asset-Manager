import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useSampler } from '@/contexts/SamplerContext';
import { useColors } from '@/hooks/useColors';

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function SectionCard({
  title,
  icon,
  iconColor,
  iconBg,
  children,
  action,
}: {
  title: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
  action?: { label: string; onPress: () => void };
}) {
  const colors = useColors();
  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: iconBg }]}>
          <Feather name={icon as any} size={15} color={iconColor} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {action ? (
          <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
            <Text style={[styles.sectionAction, { color: colors.primary }]}>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      {children}
    </View>
  );
}

export default function SamplerProfileScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const { user, logout, updateUser, changePassword } = useAuth();
  const { records, todayRecords } = useSampler();
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile photo
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Edit personal info
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Change password
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .slice(-2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  const openEditModal = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditEmail(user.email);
    setEditAddress(user.address);
    setShowEditModal(true);
  };

  const handlePickPhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Thiếu thông tin', 'Họ tên và số điện thoại là bắt buộc.');
      return;
    }
    const result = await updateUser({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      address: editAddress.trim(),
    });
    if (result.success) {
      setShowEditModal(false);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
    } else {
      Alert.alert('Lỗi', result.error ?? 'Không thể cập nhật.');
    }
  };

  const handleChangePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Không khớp', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    const result = await changePassword(oldPwd, newPwd);
    if (result.success) {
      setShowPwdModal(false);
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật.');
    } else {
      Alert.alert('Lỗi', result.error ?? 'Không thể cập nhật mật khẩu.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout().then(() => router.replace('/login'));
      return;
    }
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
      >
        {/* Avatar hero */}
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.8} style={styles.avatarWrap}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarPhoto} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary, borderWidth: 1 }]}
          >
            <Feather name="shield" size={12} color={colors.primary} />
            <Text style={[styles.roleText, { color: colors.primary }]}>{user.role}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[styles.statNum, { color: colors.text }]}>{todayRecords.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Hôm nay</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[styles.statNum, { color: colors.text }]}>{records.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tổng mẫu</Text>
            </View>
          </View>
        </View>

        {/* Personal info */}
        <SectionCard
          title="Thông tin cá nhân"
          icon="user"
          iconColor="#007AFF"
          iconBg="#E5F1FF"
          action={{ label: 'Chỉnh sửa', onPress: openEditModal }}
        >
          <InfoRow label="Họ và tên" value={user.name} />
          <InfoRow label="Số điện thoại" value={user.phone} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Địa chỉ" value={user.address} />
        </SectionCard>

        {/* Account settings */}
        <SectionCard title="Cài đặt tài khoản" icon="settings" iconColor="#8B5CF6" iconBg="#F3EEFF">
          <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: 'transparent' }]}
            activeOpacity={0.7}
            onPress={() => setShowPwdModal(true)}
          >
            <View style={[styles.settingsIconWrap, { backgroundColor: '#E5F1FF' }]}>
              <Feather name="lock" size={14} color="#007AFF" />
            </View>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>Đổi mật khẩu</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </SectionCard>

        {/* School info */}
        <SectionCard title="Thông tin trường học" icon="home" iconColor="#8B5CF6" iconBg="#F3EEFF">
          <InfoRow label="Trường" value={user.schoolInfo.name} />
          <InfoRow label="Địa chỉ" value={user.schoolInfo.address} />
          <InfoRow label="Phụ trách ATTP" value={user.schoolInfo.foodOfficer} />
        </SectionCard>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.border }, loggingOut && { opacity: 0.6 }]}
          activeOpacity={0.7}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Edit personal info modal ── */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowEditModal(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chỉnh sửa thông tin cá nhân</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

            {[
              { label: 'Họ và tên', value: editName, set: setEditName, icon: 'user', placeholder: 'Nhập họ tên' },
              { label: 'Số điện thoại', value: editPhone, set: setEditPhone, icon: 'phone', placeholder: 'Nhập số điện thoại', keyboard: 'phone-pad' as const },
              { label: 'Email', value: editEmail, set: setEditEmail, icon: 'mail', placeholder: 'Nhập email', keyboard: 'email-address' as const },
              { label: 'Địa chỉ', value: editAddress, set: setEditAddress, icon: 'map-pin', placeholder: 'Nhập địa chỉ' },
            ].map((field) => (
              <View key={field.label} style={styles.modalField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name={field.icon as any} size={15} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={field.value}
                    onChangeText={field.set}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType={field.keyboard}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={handleSavePersonalInfo}
            >
              <Text style={styles.modalBtnText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Change password modal ── */}
      <Modal visible={showPwdModal} transparent animationType="slide" onRequestClose={() => setShowPwdModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowPwdModal(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setShowPwdModal(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

            {[
              { label: 'Mật khẩu hiện tại', value: oldPwd, set: setOldPwd, show: showOld, toggleShow: () => setShowOld(v => !v) },
              { label: 'Mật khẩu mới', value: newPwd, set: setNewPwd, show: showNew, toggleShow: () => setShowNew(v => !v) },
              { label: 'Xác nhận mật khẩu mới', value: confirmPwd, set: setConfirmPwd, show: showConfirm, toggleShow: () => setShowConfirm(v => !v) },
            ].map((field) => (
              <View key={field.label} style={styles.modalField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="lock" size={15} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={field.value}
                    onChangeText={field.set}
                    secureTextEntry={!field.show}
                    placeholder="••••••"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <TouchableOpacity onPress={field.toggleShow}>
                    <Feather name={field.show ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={handleChangePassword}
            >
              <Text style={styles.modalBtnText}>Cập nhật mật khẩu</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  hero: {
    alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16,
    borderRadius: 16, gap: 8,
  },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarPhoto: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: '#007AFF',
  },
  avatarText: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  roleText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statItem: {
    alignItems: 'center', gap: 2, flex: 1,
    paddingVertical: 10, borderRadius: 12,
  },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  section: {
    borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sectionAction: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 6 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1.5, textAlign: 'right' },

  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, marginTop: 4, marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontFamily: 'Inter_500Medium' },

  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24, gap: 14,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 4,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  modalDivider: { height: StyleSheet.hairlineWidth },
  modalField: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, height: 46,
  },
  textInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  modalBtn: {
    height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  modalBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
