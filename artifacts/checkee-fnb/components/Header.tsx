import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  rightAction?: React.ReactNode;
}

export default function Header({ showBack = false, title, rightAction }: HeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return (
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
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
            <Feather name="user" size={17} color={colors.primary} />
          </View>
        )}

        <Text style={[styles.title, { color: colors.primary }]}>
          {title ?? 'CHECKEE F\u0026B'}
        </Text>

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
    paddingVertical: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
});
