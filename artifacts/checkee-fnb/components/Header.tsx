import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChildSelectorModal from '@/components/ChildSelectorModal';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useColors } from '@/hooks/useColors';
import { useSelectedChild } from '@/hooks/useSelectedChild';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  rightAction?: React.ReactNode;
}

export default function Header({ showBack = false, title, rightAction }: HeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const child = useSelectedChild();
  const [showSelector, setShowSelector] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: isWeb ? 67 : insets.top,
          },
        ]}
      >
        <View style={styles.inner}>
          {/* Left: back button OR avatar */}
          {showBack ? (
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Feather name="arrow-left" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowSelector(true)}
              activeOpacity={0.75}
              style={[styles.avatar, { backgroundColor: child.avatarColor + '20', borderColor: child.avatarColor }]}
            >
              <Text style={[styles.avatarInitial, { color: child.avatarColor }]}>{child.initial}</Text>
            </TouchableOpacity>
          )}

          {/* Center: child selector pill (or custom title) */}
          {title ? (
            <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
          ) : (
            <TouchableOpacity
              onPress={() => setShowSelector(true)}
              activeOpacity={0.75}
              style={styles.childPill}
            >
              {/* Logo */}
              <Image
                source={require('@/assets/images/logo-ischool.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              {/* Child sub-label */}
              <View style={styles.childPillSub}>
                <View style={[styles.classDot, { backgroundColor: child.avatarColor }]} />
                <Text style={[styles.childPillClass, { color: colors.mutedForeground }]}>
                  {child.name} · {child.grade} · Lớp {child.className}
                </Text>
                <Feather name="chevron-down" size={11} color={colors.mutedForeground} style={{ marginLeft: 1 }} />
              </View>
            </TouchableOpacity>
          )}

          {/* Right: bell or custom action */}
          {rightAction ?? (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/notifications')}
              style={styles.iconBtn}
            >
              <Feather name="bell" size={22} color={colors.text} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.destructive, borderColor: colors.card }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ChildSelectorModal visible={showSelector} onClose={() => setShowSelector(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    lineHeight: 11,
  },
  logo: {
    width: 150,
    height: 42,
  },
  childPill: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 2,
  },
  childPillSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  childPillClass: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
});
