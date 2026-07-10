import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  generatedAt?: string;
  children: ReactNode;
};

export function ReportCard({ title, generatedAt, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {generatedAt ? <Text style={styles.generated}>Generated: {generatedAt}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  generated: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 8,
  },
});