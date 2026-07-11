import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  ActionTile,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusBadge,
} from '../components/common';
import { PageHeader, ScreenContainer } from '../components/layout';
import { AppNavigation } from '../components/navigation';
import { platformModuleRegistry } from '../features/platform';
import { useAuth } from '../features/auth/auth-context';
import { getInstallationRepository } from '../services/cloud';

const quickActions = [
  { label: 'Start Service Visit', href: '/service' },
  { label: 'New Installation', href: '/installations/new' },
  { label: 'Fault Finder', href: '/fault-finder' },
  { label: 'Commissioning', href: '/commissioning-wizard' },
  { label: 'Find Installation', href: '/installations' },
  { label: 'Create Report', href: '/reports' },
] as const;

const moduleSections: Array<{ title: string; subtitle: string; category: (typeof platformModuleRegistry)[number]['category'] }> = [
  { title: 'Installations', subtitle: 'View Installations and Add Installation', category: 'installations' },
  { title: 'Service', subtitle: 'Start Service Visit, Draft Visits, Service History', category: 'service' },
  { title: 'Diagnostics', subtitle: 'Fault Finder, Equipment Knowledge Base, Performance Analysis', category: 'diagnostics' },
  { title: 'Commissioning', subtitle: 'Start Commissioning and Draft Commissioning Records', category: 'commissioning' },
  { title: 'Reports', subtitle: 'Service, commissioning, and customer reporting workflows', category: 'reports' },
  { title: 'Business Tools', subtitle: 'Customers, parts, F-Gas records, and team capabilities', category: 'business' },
];

type SummaryCard = {
  label: string;
  value: string;
  subtitle: string;
  tone: 'info' | 'success' | 'warning' | 'danger' | 'muted';
};

export default function HomeScreen() {
  const { dataMode, syncStatus, session, engineerName, companyName } = useAuth();
  const installationRepository = getInstallationRepository();
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string>('');
  const [installationCount, setInstallationCount] = useState<number>(0);

  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true);
      setSummaryError('');

      try {
        const installations = await installationRepository.listInstallations();
        setInstallationCount(installations.length);
      } catch (error) {
        setSummaryError(error instanceof Error ? error.message : 'Unable to load dashboard summary.');
      } finally {
        setLoadingSummary(false);
      }
    };

    void loadSummary();
  }, [installationRepository]);

  const summaryCards = useMemo<SummaryCard[]>(
    () => [
      { label: 'Open jobs', value: `${installationCount}`, subtitle: 'Installation records requiring field activity', tone: 'info' },
      { label: 'Draft service visits', value: '0', subtitle: 'Central draft board planned', tone: 'muted' },
      { label: 'Follow-ups required', value: '0', subtitle: 'Follow-up automation planned', tone: 'warning' },
      { label: 'Installations', value: `${installationCount}`, subtitle: 'Company-scoped records', tone: 'success' },
      { label: 'Reports awaiting completion', value: '0', subtitle: 'Reports are generated per workflow', tone: 'muted' },
      { label: 'Sync status', value: syncStatus, subtitle: `Mode: ${dataMode}`, tone: syncStatus === 'Synced' ? 'success' : 'warning' },
    ],
    [dataMode, installationCount, syncStatus],
  );

  return (
    <ScreenContainer>
      <PageHeader
        title="Engineer Workspace"
        subtitle="Modular HeatPump Pro command center for installations, service, diagnostics, commissioning, and reporting."
        rightMeta={companyName || session?.companyId || 'No company'}
      />

      <AppNavigation />

      <SectionCard title="Workspace Status" subtitle="Signed-in engineer context, cloud status, and account access.">
        <View style={styles.statusRow}>
          <StatusBadge label={session ? 'Signed in' : 'Signed out'} tone={session ? 'success' : 'warning'} />
          <StatusBadge label={`Mode: ${dataMode}`} tone="info" />
          <StatusBadge label={`Sync: ${syncStatus}`} tone={syncStatus === 'Synced' ? 'success' : 'warning'} />
        </View>
        <View style={styles.statusRow}>
          <SecondaryButton
            title={`Engineer: ${engineerName || 'Not available'}`}
            onPress={() => {
              router.push('/account' as never);
            }}
          />
        </View>
        <PrimaryButton
          title={session ? 'Open Account / Profile' : 'Sign In'}
          onPress={() => {
            router.push((session ? '/account' : '/sign-in') as never);
          }}
        />
      </SectionCard>

      <SectionCard title="Primary Quick Actions" subtitle="Fast launch actions for field engineers.">
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <View key={action.label} style={styles.actionsItem}>
              <PrimaryButton
                title={action.label}
                onPress={() => {
                  router.push(action.href as never);
                }}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Operational Summary" subtitle="Live high-level metrics for day-to-day execution.">
        {loadingSummary ? <LoadingState label="Loading dashboard metrics..." /> : null}
        {summaryError ? <ErrorState message={summaryError} /> : null}
        {!loadingSummary && !summaryError ? (
          <View style={styles.metricGrid}>
            {summaryCards.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} subtitle={item.subtitle} tone={item.tone} />
            ))}
          </View>
        ) : null}
      </SectionCard>

      {moduleSections.map((section) => {
        const modules = platformModuleRegistry.filter((module) => module.category === section.category);
        return (
          <SectionCard key={section.title} title={section.title} subtitle={section.subtitle}>
            {modules.length ? (
              modules.map((module) => (
                <ActionTile
                  key={module.key}
                  title={module.name}
                  description={module.description}
                  comingSoon={module.comingSoon}
                  onPress={() => {
                    router.push(module.route as never);
                  }}
                />
              ))
            ) : (
              <EmptyState title="Coming soon" message="This module area will be enabled in future platform releases." />
            )}
          </SectionCard>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionsItem: {
    flexBasis: '48%',
    minWidth: 170,
    flexGrow: 1,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
