import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlatformRadius, PlatformShadows, PlatformSpacing, PlatformSurfaces, PlatformTouch } from '../../theme/platform-theme';
import { StatusBadge } from './status-badge';

type Props = {
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
};

export function ActionTile({ title, description, onPress, disabled = false, comingSoon = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [styles.tile, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
      onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {comingSoon ? <StatusBadge tone="warning" label="Coming soon" /> : null}
      </View>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: PlatformTouch.targetMinHeight,
    backgroundColor: PlatformSurfaces.cardBackground,
    borderWidth: 1,
    borderColor: PlatformSurfaces.cardBorder,
    borderRadius: PlatformRadius.md,
    padding: PlatformSpacing.md,
    marginBottom: PlatformSpacing.sm,
    ...PlatformShadows.card,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.75,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: PlatformSpacing.sm,
    marginBottom: 4,
  },
  title: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  description: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
