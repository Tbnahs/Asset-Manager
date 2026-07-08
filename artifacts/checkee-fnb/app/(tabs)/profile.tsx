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

import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useSelectedChild } from '@/hooks/useSelectedChild';

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

interface SectionCardProps {
  title: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
  action?: { label: string; onPress: () => void };
}

function SectionCard({ title, icon, iconColor, iconBg, children, action }: SectionCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
          <Feather name={icon as any} size={16} color={iconColor} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {action ? (
          <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
            <Text style={[styles.sectionAction, { color: colors.primary }]}>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const { user, logout, updateUser, changePassword } = useAuth();
  const selectedChild = useSelectedChild();
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile photo
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Edit personal info modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Change password modal
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openEditModal = () => {
    if (!user) return;
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
      'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
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

  if (!user) return null;

  const childDetail = user.children.find((c) => c.childId === selectedChild.id) ?? user.children[0];
  const initials = user.name
    .split(' ')
    .slice(-2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
      >
        {/* Avatar + name */}
        <View style={[styles.profileHero, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.8} style={styles.avatarWrap}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarPhoto} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
                <Text style={[styles.avatarInitials, { color: colors.primary }]}>{initials}</Text>
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.parentName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.parentRole, { color: colors.mutedForeground }]}>{user.role}</Text>
          <View style={[styles.verifiedBadge, { backgroundColor: colors.safeGreenLight }]}>
            <Feather name="check-circle" size={12} color={colors.safeGreen} />
            <Text style={[styles.verifiedText, { color: colors.safeGreen }]}>Đã xác minh</Text>
          </View>

          <View style={styles.childrenRow}>
            {user.children.map((c) => {
              const isActive = c.childId === selectedChild.id;
              const color = c.childId === 'child_1' ? colors.primary : colors.info;
              return (
                <View
                  key={c.childId}
                  style={[
                    styles.childChip,
                    {
                      backgroundColor: isActive ? color + '18' : colors.background,
                      borderColor: isActive ? color : colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={[styles.childChipText, { color: isActive ? color : colors.mutedForeground }]}>
                    {c.fullName.split(' ').pop()} · {c.className}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Account settings */}
        <SectionCard
          title="Cài đặt tài khoản"
          icon="settings"
          iconColor="#8B5CF6"
          iconBg="#F3EEFF"
          action={{ label: 'Chỉnh sửa', onPress: openEditModal }}
        >
          <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}
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

        {/* Parent info */}
        <SectionCard
          title="Thông tin phụ huynh"
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

        {/* Student info — read-only for parents */}
        <SectionCard
          title={`Thông tin học sinh — ${childDetail?.fullName.split(' ').pop() ?? ''}`}
          icon="book"
          iconColor="#FF9500"
          iconBg="#FFF4E5"
        >
          <InfoRow label="Họ và tên" value={childDetail?.fullName ?? ''} />
          <InfoRow label="Ngày sinh" value={childDetail?.dob ?? ''} />
          <InfoRow label="Mã học sinh" value={childDetail?.studentId ?? ''} />
          <InfoRow label="Dị ứng" value={childDetail?.allergies ?? ''} />
        </SectionCard>

        {/* Class info */}
        <SectionCard title="Thông tin lớp học" icon="users" iconColor="#34C759" iconBg="#E8F9ED">
          <InfoRow label="Lớp" value={`${childDetail?.grade ?? ''} · ${childDetail?.className ?? ''}`} />
          <InfoRow label="Giáo viên chủ nhiệm" value={childDetail?.teacher ?? ''} />
          <InfoRow label="Phòng học" value={childDetail?.room ?? ''} />
          <InfoRow label="Sĩ số" value={childDetail?.classSize ?? ''} />
        </SectionCard>

        {/* School info */}
        <SectionCard title="Thông tin trường học" icon="home" iconColor="#8B5CF6" iconBg="#F3EEFF">
          <InfoRow label="Tên trường" value={user.schoolInfo.name} />
          <InfoRow label="Địa chỉ" value={user.schoolInfo.address} />
          <InfoRow label="Điện thoại" value={user.schoolInfo.phone} />
          <InfoRow label="Phụ trách ATTP" value={user.schoolInfo.foodOfficer} />
        </SectionCard>

        {/* App info */}
        <View style={[styles.appInfo, { backgroundColor: colors.card }]}>
          <View style={[styles.appLogoWrap, { backgroundColor: colors.accent }]}>
            <Feather name="shield" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.appName, { color: colors.text }]}>ISCHOOL F&B</Text>
            <Text style={[styles.appVersion, { color: colors.mutedForeground }]}>Phiên bản 1.0.0</Text>
          </View>
        </View>

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

      {/* ── Change Password Modal ── */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  /* Hero */
  profileHero: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarPhoto: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: '#007AFF',
  },
  avatarInitials: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  parentName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  parentRole: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginTop: 4,
  },
  verifiedText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  childrenRow: {
    flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center',
  },
  childChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  childChipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  /* Section card */
  sectionCard: {
    borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sectionAction: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  sectionDivider: { height: StyleSheet.hairlineWidth, marginBottom: 8 },

  /* Info rows */
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1.5, textAlign: 'right' },

  /* Settings rows */
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },

  /* App info */
  appInfo: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 14, gap: 12,
  },
  appLogoWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  appVersion: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, marginTop: 4, marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontFamily: 'Inter_500Medium' },

  /* Modals */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 14,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#D1D5DB', alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
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
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  modalBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
