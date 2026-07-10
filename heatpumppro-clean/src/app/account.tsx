import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { SyncStatusBadge } from '../components/sync-status-badge';
import { useAuth } from '../features/auth/auth-context';

export default function AccountScreen() {
  const {
    session,
    loading,
    engineerName,
    companyName,
    dataMode,
    availableDataModes,
    canUseCloud,
    syncStatus,
    migrationPreview,
    signOut,
    setDataMode,
    refreshMigrationPreview,
    retrySync,
  } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Account" subtitle="Engineer profile, company scope, and cloud foundation status." />

      <SectionCard title="Session" subtitle="Authentication and company isolation context.">
        <SyncStatusBadge compact />
        <Text style={styles.row}>Signed in: {session ? 'Yes' : 'No'}</Text>
        <Text style={styles.row}>Engineer: {engineerName || 'Not available'}</Text>
        <Text style={styles.row}>Company: {companyName || 'Not available'}</Text>
        <Text style={styles.row}>Company ID: {session?.companyId || 'Not available'}</Text>
        <Text style={styles.row}>Data Mode: {dataMode}</Text>
        <Text style={styles.row}>Sync Status: {loading ? 'Loading...' : syncStatus}</Text>
        {!session ? (
          <PrimaryButton
            title="Sign In"
            onPress={() => {
              router.push('/sign-in' as never);
            }}
            style={styles.buttonSpacing}
          />
        ) : null}
        {session ? (
          <PrimaryButton
            title="Sign Out"
            onPress={async () => {
              await signOut();
            }}
            style={[styles.buttonSpacing, styles.signOut]}
          />
        ) : null}
        <PrimaryButton
          title="Retry Sync"
          onPress={async () => {
            await retrySync();
          }}
        />
      </SectionCard>

      <SectionCard title="Data Mode Selector" subtitle="Switch between local demo and cloud provider mode.">
        <Text style={styles.row}>Current Mode: {dataMode}</Text>
        <Text style={styles.row}>Cloud Available: {canUseCloud ? 'Yes' : 'No (set env config)'}</Text>
        <Text style={styles.row}>Available Modes: {availableDataModes.join(', ')}</Text>
        <PrimaryButton
          title="Use Local Demo Mode"
          onPress={async () => {
            await setDataMode('local-demo');
          }}
          style={styles.buttonSpacing}
        />
        <PrimaryButton
          title="Use Cloud Mode"
          onPress={async () => {
            await setDataMode('cloud');
          }}
          style={styles.cloudButton}
        />
      </SectionCard>

      <SectionCard title="Migration Preview" subtitle="Safe local-to-cloud migration hooks for existing records.">
        <Text style={styles.row}>Installations: {migrationPreview?.totalInstallations ?? 0}</Text>
        <Text style={styles.row}>Photos: {migrationPreview?.totalPhotos ?? 0}</Text>
        <Text style={styles.row}>Documents: {migrationPreview?.totalDocuments ?? 0}</Text>
        <Text style={styles.row}>Preview Mode: {migrationPreview?.mode || dataMode}</Text>
        <PrimaryButton
          title="Refresh Migration Preview"
          onPress={async () => {
            await refreshMigrationPreview();
          }}
        />
      </SectionCard>

      <SectionCard title="Privacy and Security" subtitle="Cloud foundation rules active in v1.">
        <Text style={styles.row}>Private engineer notes are excluded from customer-facing report saves.</Text>
        <Text style={styles.row}>Repository operations are company-scoped to block cross-company access.</Text>
        <Text style={styles.row}>No customer data is logged in cloud migration scaffolding or provider defaults.</Text>
      </SectionCard>
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
  row: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  buttonSpacing: {
    marginTop: 10,
    marginBottom: 10,
  },
  signOut: {
    backgroundColor: '#b91c1c',
  },
  cloudButton: {
    backgroundColor: '#1e3a8a',
  },
});
