import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { PlatformLayout, PlatformSpacing, PlatformSurfaces } from '../../theme/platform-theme';

type Props = ScrollViewProps & {
  children: React.ReactNode;
};

export function ScreenContainer({ children, contentContainerStyle, ...props }: Props) {
  return (
    <ScrollView
      {...props}
      style={[styles.screen, props.style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}>
      <View style={styles.maxWidth}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PlatformSurfaces.appBackground,
  },
  contentContainer: {
    paddingHorizontal: PlatformSpacing.lg,
    paddingTop: PlatformSpacing.xl,
    paddingBottom: PlatformSpacing.xxl,
  },
  maxWidth: {
    width: '100%',
    maxWidth: PlatformLayout.maxContentWidth,
    alignSelf: 'center',
  },
});
