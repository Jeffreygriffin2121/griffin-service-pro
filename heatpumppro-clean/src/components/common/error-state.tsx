import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformSpacing, PlatformStatusColors } from '../../theme/platform-theme';

type Props = {
  title?: string;
  message: string;
};

export function ErrorState({ title = 'Something went wrong', message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: PlatformSpacing.sm,
  },
  title: {
    color: PlatformStatusColors.danger,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  message: {
    color: '#7f1d1d',
    fontSize: 14,
    lineHeight: 20,
  },
});
