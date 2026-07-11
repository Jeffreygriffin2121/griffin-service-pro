import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { PrimaryButton } from '../common/primary-button';
import { SecondaryButton } from '../common/secondary-button';
import { PlatformLayout, PlatformSpacing } from '../../theme/platform-theme';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Installations', href: '/installations' },
  { label: 'Customers', href: '/customers' },
  { label: 'Service', href: '/service' },
  { label: 'Fault Finder', href: '/fault-finder' },
  { label: 'Reports', href: '/reports' },
  { label: 'Account', href: '/account' },
] as const;

export function AppNavigation() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isTablet = width >= PlatformLayout.tabletBreakpoint;
  const basis = isTablet ? '23%' : '48%';

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active = pathname === item.href;
        const Button = active ? PrimaryButton : SecondaryButton;

        return (
          <View key={item.href} style={[styles.item, { flexBasis: basis }]}>
            <Button
              title={item.label}
              onPress={() => {
                if (pathname !== item.href) {
                  router.push(item.href as never);
                }
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PlatformSpacing.sm,
    marginBottom: PlatformSpacing.md,
  },
  item: {
    minWidth: 140,
    flexGrow: 1,
  },
});
