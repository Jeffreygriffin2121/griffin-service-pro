import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const brands = [
  'Daikin',
  'Mitsubishi Electric',
  'Samsung',
  'Panasonic',
  'LG',
  'NIBE',
  'Viessmann',
  'Vaillant',
  'Grant',
  'Hitachi',
  'Stiebel Eltron',
];

export default function FaultFinderScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>HeatPump Pro</Text>
        <Text style={styles.title}>Fault Finder</Text>
        <Text style={styles.subtitle}>Select a brand to open troubleshooting guidance.</Text>
      </View>

      <View style={styles.buttonGrid}>
        {brands.map((brand) => (
          <Pressable key={brand} style={styles.brandButton}>
            <Text style={styles.brandText}>{brand}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#f3f7fb',
  },
  header: {
    backgroundColor: '#003c8f',
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },
  kicker: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  brandButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
    minHeight: 76,
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  brandText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});
