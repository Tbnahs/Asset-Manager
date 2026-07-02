import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChildSelectorModal from '@/components/ChildSelectorModal';
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
              <View style={styles.childPillInner}>
                <Text style={[styles.childPillName, { color: colors.text }]} numberOfLines={1}>
                  {child.name}
                </Text>
                <View style={styles.childPillSub}>
                  <View style={[styles.classDot, { backgroundColor: child.avatarColor }]} />
                  <Text style={[styles.childPillClass, { color: colors.mutedForeground }]}>
                    {child.grade} · Lớp {child.className}
                  </Text>
                  <Feather name="chevron-down" size={12} color={colors.mutedForeground} style={{ marginLeft: 2 }} />
                </View>
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
  childPill: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  childPillInner: {
    alignItems: 'center',
    gap: 2,
  },
  childPillName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
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
