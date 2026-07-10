import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, children }: Props) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
});