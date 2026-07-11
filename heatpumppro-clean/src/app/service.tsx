import React from 'react';
import { router } from 'expo-router';
import { EmptyState, PrimaryButton, SectionCard } from '../components/common';
import { PageHeader, ScreenContainer } from '../components/layout';
import { AppNavigation } from '../components/navigation';

export default function ServiceScreen() {
  return (
    <ScreenContainer>
      <PageHeader
        title="Service"
        subtitle="Service Visit operations are being modularized. Existing service workflows remain accessible from installation records."
      />

      <AppNavigation />

      <SectionCard title="Service Workspace" subtitle="Use the existing Service Checklist workflow or open installations to start a site-specific service visit.">
        <PrimaryButton
          title="Open Service Checklist"
          onPress={() => {
            router.push('/service-checklist' as never);
          }}
        />
      </SectionCard>

      <SectionCard title="Draft Visits" subtitle="A centralized draft list module is planned and will be enabled here.">
        <EmptyState title="Coming soon" message="Draft service visit board will appear in a future module release." />
      </SectionCard>
    </ScreenContainer>
  );
}
