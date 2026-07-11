import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PlatformSpacing, PlatformStatusColors } from '../../theme/platform-theme';

type Props = {
  label?: string;
};

export function LoadingState({ label = 'Loading...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={PlatformStatusColors.info} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PlatformSpacing.sm,
    paddingVertical: PlatformSpacing.sm,
  },
  label: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
