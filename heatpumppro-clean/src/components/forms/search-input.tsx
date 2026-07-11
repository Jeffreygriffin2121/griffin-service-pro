import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { PlatformRadius, PlatformSpacing } from '../../theme/platform-theme';

type Props = TextInputProps;

export function SearchInput(props: Props) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        placeholder={props.placeholder || 'Search'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: PlatformSpacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: PlatformRadius.md,
    paddingHorizontal: PlatformSpacing.md,
    paddingVertical: PlatformSpacing.sm,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
});
