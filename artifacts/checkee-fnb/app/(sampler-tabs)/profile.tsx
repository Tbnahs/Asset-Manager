import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function SamplerProfileScreen() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';
  const { user, logout } = useAuth();
  const { records, todayRecords } = useSampler();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .slice(-2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

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
      ],
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
          <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary, borderWidth: 1 }]}>
            <Feather name="shield" size={12} color={colors.primary} />
            <Text style={[styles.roleText, { color: colors.primary }]}>{user.role}</Text>
          </View>

          {/* Quick stats */}
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
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#E5F1FF' }]}>
              <Feather name="user" size={15} color="#007AFF" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin cá nhân</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Họ và tên" value={user.name} />
          <InfoRow label="Số điện thoại" value={user.phone} />
          <InfoRow label="Email" value={user.email} />
        </View>

        {/* School info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#F3EEFF' }]}>
              <Feather name="home" size={15} color="#8B5CF6" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin trường học</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Trường" value={user.schoolInfo.name} />
          <InfoRow label="Địa chỉ" value={user.schoolInfo.address} />
          <InfoRow label="Phụ trách ATTP" value={user.schoolInfo.foodOfficer} />
        </View>

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
  avatar: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  avatarText: { fontSize: 28, fontFamily: 'Inter_700Bold' },
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
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 6 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1.5, textAlign: 'right' },

  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  settingsText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, marginTop: 4, marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
