import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { PrimaryButton } from '../common/primary-button';
import { SecondaryButton } from '../common/secondary-button';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Installations', href: '/installations' },
  { label: 'Service', href: '/service' },
  { label: 'Fault Finder', href: '/fault-finder' },
  { label: 'Reports', href: '/reports' },
  { label: 'Account', href: '/account' },
] as const;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active = pathname === item.href;
        const Button = active ? PrimaryButton : SecondaryButton;

        return (
          <View key={item.href} style={styles.item}>
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
    gap: 8,
    marginBottom: 12,
  },
  item: {
    flexBasis: '31%',
    minWidth: 110,
    flexGrow: 1,
  },
});
