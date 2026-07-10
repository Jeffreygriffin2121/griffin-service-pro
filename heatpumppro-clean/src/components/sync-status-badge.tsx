import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../features/auth/auth-context';

type Props = {
  compact?: boolean;
  onPress?: () => void;
};

const getTone = (status: string) => {
  if (status === 'Synced') {
    return { bg: '#dcfce7', text: '#166534', dot: '#16a34a' };
  }

  if (status === 'Syncing') {
    return { bg: '#dbeafe', text: '#1d4ed8', dot: '#2563eb' };
  }

  if (status === 'Failed') {
    return { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' };
  }

  return { bg: '#e2e8f0', text: '#334155', dot: '#64748b' };
};

export function SyncStatusBadge({ compact, onPress }: Props) {
  const { dataMode, syncStatus } = useAuth();
  const tone = getTone(syncStatus);

  const content = (
    <View style={[styles.badge, compact && styles.badgeCompact, { backgroundColor: tone.bg }]}> 
      <View style={[styles.dot, { backgroundColor: tone.dot }]} />
      <Text style={[styles.text, compact && styles.textCompact, { color: tone.text }]}>Mode: {dataMode}</Text>
      <Text style={[styles.text, compact && styles.textCompact, { color: tone.text }]}>Sync: {syncStatus}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 11,
  },
});
