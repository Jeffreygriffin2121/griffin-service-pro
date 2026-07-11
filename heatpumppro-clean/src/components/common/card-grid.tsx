import React from 'react';
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { PlatformSpacing } from '../../theme/platform-theme';

type Props = {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
};

const getColumns = (width: number, minItemWidth: number, gap: number) => {
  if (width < 560) {
    return 1;
  }

  const effectiveWidth = Math.max(width - PlatformSpacing.lg * 2, minItemWidth);
  return Math.max(1, Math.floor((effectiveWidth + gap) / (minItemWidth + gap)));
};

export function CardGrid({ children, minItemWidth = 220, gap = PlatformSpacing.sm }: Props) {
  const { width } = useWindowDimensions();
  const columns = getColumns(width, minItemWidth, gap);

  return (
    <View style={[styles.grid, { gap }]}> 
      {React.Children.map(children, (child) => {
        if (!child) {
          return null;
        }

        const basis = `${(100 / columns).toFixed(4)}%` as `${number}%`;
        const itemStyle: ViewStyle = {
          flexBasis: basis,
          maxWidth: basis,
        };

        return <View style={itemStyle}>{child}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
});