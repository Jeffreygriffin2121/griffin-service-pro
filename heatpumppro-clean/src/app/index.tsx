import React from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';

const modules = [
  ['🔧', 'Service', 'Digital service sheets and reports'],
  ['🚀', 'Commission', 'Commissioning checklists and sign-off'],
  ['⚠️', 'Fault Find', 'Cross-brand diagnostics and fault codes'],
  ['🧮', 'Calculators', 'Flow, COP, glycol and system sizing'],
  ['📚', 'Technical Library', 'Manuals, notes and best practice'],
  ['🤖', 'AI Assistant', 'Guided technical fault support'],
  ['👥', 'Customers', 'Customer and asset database'],
  ['🛒', 'Parts & Suppliers', 'Find parts and supplier links'],
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>HEATPUMP PRO</Text>
        <Text style={styles.title}>Universal Field Assistant</Text>
        <Text style={styles.subtitle}>
          Service, commission, fault-find and manage heat pump systems across multiple brands.
        </Text>
      </View>

      <View style={styles.grid}>
        {modules.map(([icon, title, desc]) => (
          <Pressable key={title} style={styles.card}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{desc}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f7fb', padding: 18 },
  hero: {
    backgroundColor: '#003c8f',
    borderRadius: 26,
    padding: 24,
    marginBottom: 18,
  },
  kicker: { color: '#bfdbfe', fontWeight: '800', letterSpacing: 1 },
  title: { color: 'white', fontSize: 34, fontWeight: '900', marginTop: 8 },
  subtitle: { color: '#dbeafe', fontSize: 15, marginTop: 10, lineHeight: 22 },
  grid: { gap: 14, paddingBottom: 30 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  icon: { fontSize: 30 },
  cardTitle: { fontSize: 21, fontWeight: '900', color: '#0f172a', marginTop: 8 },
  cardDesc: { color: '#64748b', marginTop: 4, fontSize: 14 },
});
