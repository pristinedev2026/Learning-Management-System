import React from 'react';
import { View, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { spacing } from '@/theme/tokens';

/**
 * A responsive Logo component that uses the PNG asset.
 * Force refresh triggered.
 */
export function Logo({ width }: { width?: number }) {
  const { width: windowWidth } = useWindowDimensions();
  // Responsive width: 70% of screen or custom width
  const logoWidth = width || windowWidth * 0.7;

  // Aspect ratio based on the original concept (680x420)
  const logoHeight = (logoWidth * 420) / 680;

  return (
    <View style={[styles.container, { width: logoWidth, height: logoHeight }]}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
