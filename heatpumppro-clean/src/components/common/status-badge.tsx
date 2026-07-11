import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformRadius, PlatformSpacing, PlatformStatusColors } from '../../theme/platform-theme';

type StatusTone = 'info' | 'success' | 'warning' | 'danger' | 'muted';

type Props = {
  label: string;
  tone?: StatusTone;
};

const tones = {
  info: { background: '#dbeafe', text: PlatformStatusColors.info },
  success: { background: '#dcfce7', text: PlatformStatusColors.success },
  warning: { background: '#fef3c7', text: PlatformStatusColors.warning },
  danger: { background: '#fee2e2', text: PlatformStatusColors.danger },
  muted: { background: '#e2e8f0', text: PlatformStatusColors.muted },
} as const;

export function StatusBadge({ label, tone = 'info' }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: tones[tone].background }]}>
      <Text style={[styles.label, { color: tones[tone].text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: PlatformRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: PlatformSpacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
  },
});
