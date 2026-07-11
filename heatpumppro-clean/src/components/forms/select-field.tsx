import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlatformRadius, PlatformSpacing } from '../../theme/platform-theme';

type Props = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelect: (value: string) => void;
  helperText?: string;
  emptyText?: string;
  disabled?: boolean;
};

export function SelectField({
  label,
  value,
  placeholder,
  options,
  isOpen,
  onToggleOpen,
  onSelect,
  helperText,
  emptyText = 'No options available.',
  disabled = false,
}: Props) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={() => {
          if (!disabled) {
            onToggleOpen();
          }
        }}>
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>{value || placeholder}</Text>
        <Text style={styles.dropdownArrow}>{isOpen ? '▴' : '▾'}</Text>
      </Pressable>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      {isOpen ? (
        <View style={styles.dropdownMenu}>
          {options.length ? (
            options.map((option) => (
              <Pressable key={option} style={styles.dropdownOption} onPress={() => onSelect(option)}>
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </Pressable>
            ))
          ) : (
            <View style={styles.dropdownOption}>
              <Text style={styles.dropdownOptionMuted}>{emptyText}</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 2,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: PlatformRadius.md,
    paddingHorizontal: PlatformSpacing.md,
    paddingVertical: PlatformSpacing.sm,
    marginBottom: PlatformSpacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dropdownDisabled: {
    opacity: 0.7,
  },
  dropdownText: {
    color: '#0f172a',
    fontSize: 15,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#64748b',
  },
  dropdownArrow: {
    color: '#0f4fb3',
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: PlatformRadius.md,
    marginBottom: PlatformSpacing.sm,
    backgroundColor: '#ffffff',
  },
  dropdownOption: {
    paddingHorizontal: PlatformSpacing.md,
    paddingVertical: PlatformSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownOptionText: {
    color: '#0f172a',
    fontSize: 14,
  },
  dropdownOptionMuted: {
    color: '#64748b',
    fontSize: 13,
  },
  helperText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: -2,
    marginBottom: PlatformSpacing.sm,
  },
});
