import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { PlatformSpacing } from '../../theme/platform-theme';

type Props = {
  children: React.ReactNode;
};

export function ButtonRow({ children }: Props) {
  const { width } = useWindowDimensions();
  const stack = width < 640;

  return <View style={[styles.row, stack ? styles.stack : styles.inline]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    gap: PlatformSpacing.sm,
  },
  stack: {
    flexDirection: 'column',
  },
  inline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});