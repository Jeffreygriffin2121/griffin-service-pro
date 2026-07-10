import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EquipmentTimelineEvent } from '../../types/equipment';

type Props = {
  events: EquipmentTimelineEvent[];
};

export function EquipmentTimeline({ events }: Props) {
  return (
    <View>
      {events.map((event) => (
        <View key={event.id} style={styles.row}>
          <View style={styles.markerColumn}>
            <View style={styles.dot} />
            <View style={styles.line} />
          </View>
          <View style={styles.contentColumn}>
            <Text style={styles.type}>{event.type}</Text>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.date}>{event.date}</Text>
            <Text style={styles.summary}>{event.summary}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  markerColumn: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f4fb3',
    marginTop: 5,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#c7d6ee',
    marginTop: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 4,
  },
  type: {
    color: '#0f4fb3',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  title: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  date: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 1,
    marginBottom: 2,
  },
  summary: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
});
