import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformRadius, PlatformSpacing, PlatformSurfaces, PlatformTypography } from '../../theme/platform-theme';

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  rightMeta?: string;
};

export function PageHeader({ kicker = 'HeatPump Pro', title, subtitle, rightMeta }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Text style={styles.kicker}>{kicker}</Text>
        {rightMeta ? <Text style={styles.rightMeta}>{rightMeta}</Text> : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: PlatformSurfaces.headerBackground,
    borderRadius: PlatformRadius.xl,
    padding: PlatformSpacing.xl,
    marginBottom: PlatformSpacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: PlatformSpacing.sm,
  },
  kicker: {
    color: '#bfdbfe',
    fontSize: PlatformTypography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  rightMeta: {
    color: '#dbeafe',
    fontSize: PlatformTypography.caption,
    fontWeight: '700',
  },
  title: {
    color: PlatformSurfaces.headerText,
    fontSize: PlatformTypography.title,
    fontWeight: '900',
    marginTop: PlatformSpacing.xs,
  },
  subtitle: {
    color: PlatformSurfaces.headerMuted,
    fontSize: PlatformTypography.body,
    lineHeight: 21,
    marginTop: PlatformSpacing.xs,
  },
});
