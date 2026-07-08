import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { Href, useRouter } from 'expo-router';

type DashboardItem = {
  title: string;
  description: string;
  icon: string;
  accent: string;
  href?: Href;
  isAvailable?: boolean;
};

function getWebRoutePath(path: string, useStaticHtml = false) {
  if (typeof window === 'undefined') {
    return path;
  }

  const currentPath = window.location.pathname;
  const hasRepoBasePath = currentPath.includes('/griffin-service-pro/');
  const prefixedPath = hasRepoBasePath ? `/griffin-service-pro${path}` : path;

  if (!useStaticHtml || prefixedPath === '/') {
    return prefixedPath;
  }

  return prefixedPath.endsWith('.html') ? prefixedPath : `${prefixedPath}.html`;
}

const dashboardItems: DashboardItem[] = [
  {
    title: 'Fault Finder',
    description: 'Start a guided diagnostic workflow for common heat pump faults.',
    icon: '🛠️',
    accent: '#2563eb',
    href: '/fault-finder',
    isAvailable: true,
  },
  {
    title: 'Service Checklist',
    description: 'Use a structured inspection flow on every visit.',
    icon: '✅',
    accent: '#0f766e',
    isAvailable: false,
  },
  {
    title: 'Calculators',
    description: 'Open COP, flow and sizing tools when you need them.',
    icon: '🧮',
    accent: '#7c3aed',
    isAvailable: false,
  },
  {
    title: 'AI Diagnostics',
    description: 'Get guided support for faster triage and escalation.',
    icon: '🤖',
    accent: '#ea580c',
    isAvailable: false,
  },
  {
    title: 'Manuals & Wiring',
    description: 'Find manufacturer guidance and installation references quickly.',
    icon: '📚',
    accent: '#0369a1',
    isAvailable: false,
  },
  {
    title: 'Parts Finder',
    description: 'Locate the right parts without leaving the app.',
    icon: '📦',
    accent: '#be185d',
    isAvailable: false,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (item: DashboardItem) => {
    if (!item.href || !item.isAvailable) {
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const webPath = getWebRoutePath(item.href as string, true);
      window.location.assign(webPath);
      return;
    }

    router.push(item.href);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>HeatPump Pro</Text>
        <Text style={styles.title}>Field service dashboard</Text>
        <Text style={styles.subtitle}>
          Keep your daily workflow organised with fast access to diagnostics, checklists and support tools.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Core tools</Text>
        <Text style={styles.sectionHint}>Tap a card to continue</Text>
      </View>

      <View style={styles.cardList}>
        {dashboardItems.map((item) => {
          const isAvailable = Boolean(item.isAvailable);

          return (
            <Pressable
              key={item.title}
              onPress={() => handlePress(item)}
              disabled={!isAvailable}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.card,
                !isAvailable && styles.cardDisabled,
                pressed && isAvailable && styles.cardPressed,
              ]}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.accent}16` }]}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.badgeWrap}>
                  <Text style={[styles.badge, !isAvailable && styles.badgeMuted]}>
                    {isAvailable ? 'Open' : 'Soon'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#0f4fb3',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
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
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
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
  sectionHint: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  cardList: {
    gap: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    minHeight: 108,
  },
  cardDisabled: {
    opacity: 0.75,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  badgeWrap: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#f3f7fb',
  },
  badge: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  badgeMuted: {
    color: '#64748b',
  },
  cardTextContainer: {
    gap: 4,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
});
