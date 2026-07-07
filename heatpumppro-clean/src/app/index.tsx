import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

type QuickAction = {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  path?: '/coming-soon' | '/fault-finder';
};

const summaryCards = [
  { label: 'Customers', value: '128', trend: '+12%' },
  { label: 'Heat Pumps', value: '84', trend: '+4%' },
  { label: 'Service Visits', value: '36', trend: '+8%' },
  { label: 'Avg Health', value: '92%', trend: 'Excellent' },
];

const quickActions: QuickAction[] = [
  {
    title: '🛠 Fault Finder',
    subtitle: 'Cross-brand diagnostics',
    icon: '🛠️',
    accent: '#2563eb',
    path: '/fault-finder',
  },
  {
    title: 'Service Checklist',
    subtitle: 'Step-by-step inspection',
    icon: '✅',
    accent: '#0f766e',
    path: '/coming-soon',
  },
  {
    title: 'Calculators',
    subtitle: 'COP, flow and sizing',
    icon: '🧮',
    accent: '#7c3aed',
    path: '/coming-soon',
  },
  {
    title: 'AI Diagnostics',
    subtitle: 'Guided support',
    icon: '🤖',
    accent: '#ea580c',
    path: '/coming-soon',
  },
  {
    title: 'Manuals & Wiring',
    subtitle: 'Reference library',
    icon: '📚',
    accent: '#0369a1',
    path: '/coming-soon',
  },
  {
    title: 'Parts Finder',
    subtitle: 'Supplier lookup',
    icon: '📦',
    accent: '#be185d',
    path: '/coming-soon',
  },
  {
    title: 'Service Reports',
    subtitle: 'Digital job packs',
    icon: '📄',
    accent: '#475569',
    path: '/coming-soon',
  },
  {
    title: 'Commissioning',
    subtitle: 'Install sign-off',
    icon: '🚀',
    accent: '#0891b2',
    path: '/coming-soon',
  },
  {
    title: 'Recent Jobs',
    subtitle: 'Latest visits',
    icon: '🕒',
    accent: '#64748b',
    path: '/coming-soon',
  },
];

const timelineEntries = [
  {
    title: 'Annual service completed',
    location: 'River House, Manchester',
    time: '20 mins ago',
    status: 'Completed',
  },
  {
    title: 'Fault diagnosis escalated',
    location: 'Harbor View, Liverpool',
    time: '1 hr ago',
    status: 'In review',
  },
  {
    title: 'Commissioning checklist sent',
    location: 'North Point, Leeds',
    time: '3 hrs ago',
    status: 'Pending',
  },
];

function DashboardTile({ action, path }: { action: QuickAction; path?: '/coming-soon' | '/fault-finder' }) {
  const isEnabled = Boolean(path);

  return (
    <Pressable
      style={[styles.tile, !isEnabled && styles.tileDisabled]}
      onPress={() => {
        if (path) {
          router.push(path);
        }
      }}>
      <View style={[styles.tileIconWrap, { backgroundColor: `${action.accent}14` }]}>
        <Text style={styles.tileEmoji}>{action.icon}</Text>
      </View>
      <Text style={styles.tileTitle}>{action.title}</Text>
      <Text style={styles.tileSubtitle}>{action.subtitle}</Text>
      {!isEnabled ? <Text style={styles.tileBadge}>Coming soon</Text> : null}
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.kicker}>Passport Dashboard</Text>
            <Text style={styles.title}>HeatPump Pro</Text>
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>Live</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Service, commission, fault-find and manage heat pump systems with premium field visibility.
        </Text>

        <View style={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <View key={card.label} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{card.label}</Text>
              <Text style={styles.summaryValue}>{card.value}</Text>
              <Text style={styles.summaryTrend}>{card.trend}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action) => (
            <DashboardTile key={action.title} action={action} path={action.path} />
          ))}
        </View>
      </View>

      <View style={styles.timelineCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Service Timeline</Text>
          <Text style={styles.sectionLink}>View all</Text>
        </View>

        {timelineEntries.map((entry) => (
          <View key={entry.title} style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{entry.title}</Text>
              <Text style={styles.timelineMeta}>{entry.location}</Text>
              <View style={styles.timelineFooter}>
                <Text style={styles.timelineTime}>{entry.time}</Text>
                <Text style={styles.timelineStatus}>{entry.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f8ff',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#0f4fb3',
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  liveBadge: {
    backgroundColor: '#ffffff22',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: '47%',
    flexGrow: 1,
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryTrend: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLink: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  tile: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    width: '31%',
    minWidth: 108,
    minHeight: 118,
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tileDisabled: {
    opacity: 0.8,
  },
  tileIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileEmoji: {
    fontSize: 20,
  },
  tileTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  tileSubtitle: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  tileBadge: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    marginTop: 6,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  timelineTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  timelineMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  timelineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timelineTime: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  timelineStatus: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '700',
  },
});
