import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformSpacing } from '../../theme/platform-theme';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: PlatformSpacing.md,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  message: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});
