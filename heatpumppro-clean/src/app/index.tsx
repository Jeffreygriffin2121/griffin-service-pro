import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { useAuth } from '../features/auth/auth-context';

const installationActions = [
  { label: 'Installations', href: '/installations' },
  { label: 'Fault Finder', href: '/fault-finder' },
  { label: 'Commissioning Wizard', href: '/commissioning-wizard' },
  { label: 'Verified Field Fixes', href: '/verified-field-fixes' },
] as const;

const supportActions = [
  { label: 'Service Checklist', href: '/service-checklist' },
  { label: 'AI Diagnostics', href: '/ai-diagnostics' },
  { label: 'Photos', href: '/photos' },
  { label: 'Reports', href: '/reports' },
] as const;

export default function HomeScreen() {
  const { dataMode, syncStatus, session } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <AppHeader title="HeatPump Pro" subtitle="Start from Installations, then launch the right workflow for the site." />

      <SectionCard title="Account and Sync" subtitle="Cloud foundation status and account management.">
        <PrimaryButton
          style={styles.actionButton}
          onPress={() => {
            router.push('/account');
          }}
          title={session ? 'Open Account' : 'Sign In'}
          accessibilityLabel={session ? 'Open Account' : 'Sign In'}
        />
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <PrimaryButton
              title={`Mode: ${dataMode}`}
              onPress={() => {
                router.push('/account');
              }}
              style={styles.metaButton}
            />
          </View>
          <View style={styles.metaPill}>
            <PrimaryButton
              title={`Sync: ${syncStatus}`}
              onPress={() => {
                router.push('/account');
              }}
              style={styles.metaButton}
            />
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Installations" subtitle="Primary entry point for customer, equipment, service history, and linked actions.">
        {installationActions.map((action) => (
          <PrimaryButton
            key={action.label}
            style={styles.actionButton}
            onPress={() => {
              router.push(action.href);
            }}
            title={action.label}
            accessibilityLabel={action.label}
          />
        ))}
      </SectionCard>

      <SectionCard title="Supporting Actions" subtitle="Standalone access to the same modules surfaced inside each installation dashboard.">
        {supportActions.map((action) => (
          <PrimaryButton
            key={action.label}
            style={styles.actionButton}
            onPress={() => {
              router.push(action.href);
            }}
            title={action.label}
            accessibilityLabel={action.label}
          />
        ))}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef4f8',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 18,
  },
  actionButton: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flex: 1,
  },
  metaButton: {
    minHeight: 42,
    backgroundColor: '#1f2937',
  },
});
