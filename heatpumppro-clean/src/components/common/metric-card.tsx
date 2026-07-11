import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformRadius, PlatformShadows, PlatformSpacing, PlatformSurfaces, PlatformText } from '../../theme/platform-theme';
import { StatusBadge } from './status-badge';

type Props = {
  label: string;
  value: string;
  subtitle?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'muted';
};

export function MetricCard({ label, value, subtitle, tone = 'info' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <StatusBadge label={tone.toUpperCase()} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PlatformSurfaces.cardBackground,
    borderRadius: PlatformRadius.md,
    borderWidth: 1,
    borderColor: PlatformSurfaces.cardBorder,
    padding: PlatformSpacing.md,
    ...PlatformShadows.card,
  },
  label: {
    color: PlatformText.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  value: {
    color: PlatformText.primary,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    color: PlatformText.secondary,
    fontSize: 13,
    marginBottom: PlatformSpacing.sm,
  },
});
