import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label: string;
};

export function FormInput({ label, style, ...props }: Props) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={[styles.input, props.multiline && styles.textArea, style]} />
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
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
});