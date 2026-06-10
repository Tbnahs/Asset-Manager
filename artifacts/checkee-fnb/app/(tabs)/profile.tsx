import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '@/components/Header';
import { useColors } from '@/hooks/useColors';

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
}

function SectionCard({ title, icon, iconColor, iconBg, children }: SectionCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
          <Feather name={icon as any} size={16} color={iconColor} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 118 : 120 }]}
      >
        {/* Avatar + name */}
        <View style={[styles.profileHero, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
            <Feather name="user" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.parentName, { color: colors.text }]}>Nguyễn Thị Hương</Text>
          <Text style={[styles.parentRole, { color: colors.mutedForeground }]}>Phụ huynh học sinh</Text>
          <View style={[styles.verifiedBadge, { backgroundColor: colors.safeGreenLight }]}>
            <Feather name="check-circle" size={12} color={colors.safeGreen} />
            <Text style={[styles.verifiedText, { color: colors.safeGreen }]}>Đã xác minh</Text>
          </View>
        </View>

        {/* Parent info */}
        <SectionCard title="Thông tin phụ huynh" icon="user" iconColor="#007AFF" iconBg="#E5F1FF">
          <InfoRow label="Họ và tên" value="Nguyễn Thị Hương" />
          <InfoRow label="Số điện thoại" value="0912 345 678" />
          <InfoRow label="Email" value="huong.nguyen@gmail.com" />
          <InfoRow label="Địa chỉ" value="123 Nguyễn Trãi, Q.5, TP.HCM" />
        </SectionCard>

        {/* Student info */}
        <SectionCard title="Thông tin học sinh" icon="book" iconColor="#FF9500" iconBg="#FFF4E5">
          <InfoRow label="Họ và tên" value="Nguyễn Minh Khoa" />
          <InfoRow label="Ngày sinh" value="15/03/2019" />
          <InfoRow label="Mã học sinh" value="HS2024-00234" />
          <InfoRow label="Dị ứng" value="Không có" />
        </SectionCard>

        {/* Class info */}
        <SectionCard title="Thông tin lớp học" icon="users" iconColor="#34C759" iconBg="#E8F9ED">
          <InfoRow label="Lớp" value="3A" />
          <InfoRow label="Giáo viên chủ nhiệm" value="Trần Thị Mai" />
          <InfoRow label="Phòng học" value="Phòng 301, Tòa A" />
          <InfoRow label="Sĩ số" value="32 học sinh" />
        </SectionCard>

        {/* School info */}
        <SectionCard title="Thông tin trường học" icon="home" iconColor="#8B5CF6" iconBg="#F3EEFF">
          <InfoRow label="Tên trường" value="Tiểu học Nguyễn Du" />
          <InfoRow label="Địa chỉ" value="45 Nguyễn Du, Q.1, TP.HCM" />
          <InfoRow label="Điện thoại" value="028 3822 1122" />
          <InfoRow label="Phụ trách ATTP" value="Nguyễn Văn Tuấn" />
        </SectionCard>

        {/* App info */}
        <View style={[styles.appInfo, { backgroundColor: colors.card }]}>
          <View style={[styles.appLogoWrap, { backgroundColor: colors.accent }]}>
            <Feather name="shield" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.appName, { color: colors.text }]}>CHECKEE F&B</Text>
            <Text style={[styles.appVersion, { color: colors.mutedForeground }]}>Phiên bản 1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.border }]} activeOpacity={0.7}>
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  profileHero: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  parentName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  parentRole: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  verifiedText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  sectionCard: {
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sectionDivider: { height: StyleSheet.hairlineWidth, marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1.5, textAlign: 'right' },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  appLogoWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  appVersion: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
