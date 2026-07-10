import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EquipmentDashboardCard } from '../../types/equipment';

type Props = {
  card: EquipmentDashboardCard;
};

export function EquipmentDashboardCardView({ card }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{card.title}</Text>
      <Text style={styles.value}>{card.value}</Text>
      <Text style={styles.subtitle}>{card.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe7f6',
    padding: 12,
    marginBottom: 10,
  },
  title: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  value: {
    color: '#0f4fb3',
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
});
