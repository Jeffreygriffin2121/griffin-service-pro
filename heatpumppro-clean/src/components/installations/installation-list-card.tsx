import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InstallationRecord } from '../../services/cloud/repositories/types';

type Props = {
  installation: InstallationRecord;
  onPress: (installationId: string) => void;
};

const formatDate = (value: string) => {
  if (!value) {
    return 'Not recorded';
  }

  return value.slice(0, 10);
};

export function InstallationListCard({ installation, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => {
        onPress(installation.id);
      }}>
      <View style={styles.headerRow}>
        <Text style={styles.customerName}>{installation.customerName}</Text>
        <Text style={styles.brandPill}>{installation.manufacturer || 'Brand'}</Text>
      </View>
      <Text style={styles.detail}>{installation.manufacturer} {installation.modelFamily || installation.model}</Text>
      <Text style={styles.detail}>Serial: {installation.serialNumber || 'Not recorded'}</Text>
      <Text style={styles.detail}>Site: {installation.siteAddress || 'Not recorded'}</Text>
      <Text style={styles.detail}>Eircode: {installation.eircode || 'Not recorded'}</Text>
      <Text style={styles.meta}>Commissioned: {formatDate(installation.commissionDate)}</Text>
      <Text style={styles.meta}>Warranty expiry: {formatDate(installation.warrantyExpiry)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe7f6',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardPressed: {
    borderColor: '#0f4fb3',
    backgroundColor: '#edf4ff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  customerName: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  brandPill: {
    color: '#0f4fb3',
    backgroundColor: '#e0ecff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },
  detail: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
  },
  meta: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});