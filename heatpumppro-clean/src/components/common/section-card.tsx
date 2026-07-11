import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformRadius, PlatformShadows, PlatformSpacing, PlatformSurfaces, PlatformTypography } from '../../theme/platform-theme';

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, subtitle, children }: Props) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PlatformSurfaces.cardBackground,
    borderColor: PlatformSurfaces.cardBorder,
    borderWidth: 1,
    borderRadius: PlatformRadius.lg,
    padding: PlatformSpacing.md,
    marginBottom: PlatformSpacing.md,
    ...PlatformShadows.card,
  },
  title: {
    color: '#0f172a',
    fontSize: PlatformTypography.heading,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: '#64748b',
    fontSize: PlatformTypography.body,
    lineHeight: 20,
    marginBottom: PlatformSpacing.sm,
  },
});
