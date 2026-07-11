import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  ActionTile,
  ButtonRow,
  CardGrid,
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
import { modulesByCategory, platformModuleRegistry } from '../features/platform';
import { useAuth } from '../features/auth/auth-context';
import { getInstallationRepository } from '../services/cloud';
import { PlatformSpacing } from '../theme/platform-theme';

const categoryDefinitions: Array<{
  key: (typeof platformModuleRegistry)[number]['category'];
  title: string;
  subtitle: string;
}> = [
  { key: 'installations', title: 'Installations', subtitle: 'View Installations and Add Installation' },
  { key: 'service', title: 'Service', subtitle: 'Start Service Visit, Draft Visits, Service History' },
  { key: 'diagnostics', title: 'Diagnostics', subtitle: 'Fault Finder, Equipment Knowledge Base, Performance Analysis' },
  { key: 'commissioning', title: 'Commissioning', subtitle: 'Start Commissioning and Draft Commissioning Records' },
  { key: 'reports', title: 'Reports', subtitle: 'Service, commissioning, and customer reporting workflows' },
  { key: 'business', title: 'Business Tools', subtitle: 'Customers, parts, F-Gas records, and team capabilities' },
];

const toComingSoonRoute = (moduleName: string) => `/coming-soon?module=${encodeURIComponent(moduleName)}`;

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

  const quickActions = useMemo(
    () =>
      platformModuleRegistry
        .filter((module) => module.enabled && !module.comingSoon)
        .filter((module) => module.key !== 'service-visits')
        .sort((left, right) => {
          if (left.key === 'customers') {
            return -1;
          }
          if (right.key === 'customers') {
            return 1;
          }
          return 0;
        })
        .slice(0, 6)
        .map((module) => ({
          label: module.name,
          route: module.route,
        })),
    [],
  );

  const moduleHealthCards = useMemo<SummaryCard[]>(
    () =>
      categoryDefinitions.map((category) => {
        const modules = modulesByCategory(category.key);
        const enabledCount = modules.filter((module) => module.enabled).length;
        const comingSoonCount = modules.filter((module) => module.comingSoon).length;

        return {
          label: category.title,
          value: `${enabledCount}/${modules.length}`,
          subtitle: `${comingSoonCount} coming soon`,
          tone: comingSoonCount ? 'warning' : 'success',
        };
      }),
    [],
  );

  const openModule = (route: string, name: string, comingSoon: boolean) => {
    const safeRoute = comingSoon ? toComingSoonRoute(name) : route;
    router.push(safeRoute as never);
  };

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
        <CardGrid minItemWidth={220}>
          {quickActions.map((action) => (
            <View key={action.label} style={styles.gridItem}>
              <PrimaryButton
                title={action.label}
                onPress={() => {
                  router.push(action.route as never);
                }}
              />
            </View>
          ))}
        </CardGrid>
      </SectionCard>

      <SectionCard title="Operational Summary" subtitle="Live high-level metrics for day-to-day execution.">
        {loadingSummary ? <LoadingState label="Loading dashboard metrics..." /> : null}
        {summaryError ? <ErrorState message={summaryError} /> : null}
        {!loadingSummary && !summaryError ? (
          <CardGrid minItemWidth={220}>
            {summaryCards.map((item) => (
              <View key={item.label} style={styles.gridItem}>
                <MetricCard label={item.label} value={item.value} subtitle={item.subtitle} tone={item.tone} />
              </View>
            ))}
          </CardGrid>
        ) : null}
      </SectionCard>

      <SectionCard title="Module Coverage" subtitle="Current enablement across all platform categories.">
        <CardGrid minItemWidth={220}>
          {moduleHealthCards.map((item) => (
            <View key={item.label} style={styles.gridItem}>
              <MetricCard label={item.label} value={item.value} subtitle={item.subtitle} tone={item.tone} />
            </View>
          ))}
        </CardGrid>
      </SectionCard>

      {categoryDefinitions.map((section) => {
        const modules = modulesByCategory(section.key);
        return (
          <SectionCard key={section.title} title={section.title} subtitle={section.subtitle}>
            {modules.length ? (
              <CardGrid minItemWidth={280}>
                {modules.map((module) => (
                  <View key={module.key} style={styles.gridItem}>
                    <ActionTile
                      title={module.name}
                      description={module.description}
                      comingSoon={module.comingSoon}
                      onPress={() => {
                        openModule(module.route, module.name, module.comingSoon);
                      }}
                    />
                  </View>
                ))}
              </CardGrid>
            ) : (
              <EmptyState title="Coming soon" message="This module area will be enabled in future platform releases." />
            )}
          </SectionCard>
        );
      })}

      <SectionCard title="Engineer Shortcuts" subtitle="Keep critical paths reachable in one tap.">
        <ButtonRow>
          <SecondaryButton
            title="Customers"
            onPress={() => {
              router.push('/customers' as never);
            }}
          />
          <SecondaryButton
            title="New Customer"
            onPress={() => {
              router.push('/customers/new' as never);
            }}
          />
          <SecondaryButton
            title="Find Customer"
            onPress={() => {
              router.push('/customers' as never);
            }}
          />
          <SecondaryButton
            title="Open Account"
            onPress={() => {
              router.push('/account' as never);
            }}
          />
          <SecondaryButton
            title="Installation List"
            onPress={() => {
              router.push('/installations' as never);
            }}
          />
        </ButtonRow>
      </SectionCard>
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
  gridItem: {
    width: '100%',
    paddingBottom: PlatformSpacing.xs,
  },
});
