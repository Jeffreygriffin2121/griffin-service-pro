import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EquipmentRecord } from '../../types/equipment';

type Props = {
  equipment: EquipmentRecord;
  isSelected: boolean;
  onPress: (equipmentId: string) => void;
};

export function EquipmentListCard({ equipment, isSelected, onPress }: Props) {
  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => {
        onPress(equipment.id);
      }}>
      <View style={styles.headerRow}>
        <Text style={styles.customerName}>{equipment.customer.customerName}</Text>
        <Text style={[styles.statusPill, isSelected && styles.statusPillSelected]}>{equipment.status}</Text>
      </View>
      <Text style={styles.detail}>{equipment.equipment.manufacturer} {equipment.equipment.model}</Text>
      <Text style={styles.detail}>Serial: {equipment.equipment.serialNumber}</Text>
      <Text style={styles.detail}>Eircode / Postcode: {equipment.customer.eircodePostcode || 'Not recorded'}</Text>
      <Text style={styles.detail}>Address: {equipment.customer.propertyAddress}</Text>
    </Pressable>
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
  cardSelected: {
    borderColor: '#0f4fb3',
    backgroundColor: '#edf4ff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  customerName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  statusPill: {
    color: '#0f4fb3',
    backgroundColor: '#e0ecff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '800',
  },
  statusPillSelected: {
    backgroundColor: '#d8e9ff',
  },
  detail: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
});
