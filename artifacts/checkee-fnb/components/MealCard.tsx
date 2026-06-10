import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { Meal } from '@/types';

interface MealCardProps {
  meal: Meal;
  onPress: () => void;
}

export default function MealCard({ meal, onPress }: MealCardProps) {
  const colors = useColors();

  const badgeLabel =
    meal.mealType === 'dessert'
      ? 'TRÁNG MIỆNG'
      : meal.mealType === 'drink'
      ? 'ĐỒ UỐNG'
      : 'ĐANG THEO DÕI';

  const dotColor =
    meal.mealType === 'dessert' || meal.mealType === 'drink'
      ? colors.mutedForeground
      : colors.safeGreen;

  const textColor =
    meal.mealType === 'dessert' || meal.mealType === 'drink'
      ? colors.mutedForeground
      : colors.safeGreen;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <Image source={meal.image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {meal.name}
        </Text>
        <View style={styles.badgeRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={[styles.badgeText, { color: textColor }]}>{badgeLabel}</Text>
        </View>
        {meal.calories > 0 && (
          <Text style={[styles.calories, { color: colors.mutedForeground }]}>
            {meal.calories} KCAL
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  calories: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
