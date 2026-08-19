import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';

interface Props {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export const StarRating = React.memo(function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  size = 20,
  readonly = false,
}: Props) {
  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <Pressable
        key={i}
        onPress={() => !readonly && onRatingChange?.(i)}
        disabled={readonly}
      >
        <Ionicons
          name={i <= rating ? 'star' : 'star-outline'}
          size={size}
          color={i <= rating ? colors.warning : colors.gray400}
        />
      </Pressable>
    );
  }

  return <View style={styles.container}>{stars}</View>;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
