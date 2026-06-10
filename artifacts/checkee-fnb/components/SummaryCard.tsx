import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface SummaryCardProps {
  icon: string;
  count: number;
  label: string;
  iconColor: string;
  iconBg: string;
  onPress?: () => void;
}

export default function SummaryCard({ icon, count, label, iconColor, iconBg, onPress }: SummaryCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={17} color={iconColor} />
      </View>
      <Text style={[styles.count, { color: colors.text }]}>{count}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    minHeight: 104,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
  },
});
