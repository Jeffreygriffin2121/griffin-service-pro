import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ButtonRow, EmptyState, PrimaryButton, SecondaryButton, SectionCard } from '../components/common';
import { PageHeader, ScreenContainer } from '../components/layout';
import { AppNavigation } from '../components/navigation';

export default function ComingSoonScreen() {
  const { module } = useLocalSearchParams<{ module?: string }>();
  const moduleName = module?.trim() || 'This module';

  return (
    <ScreenContainer>
      <PageHeader title="Coming Soon" subtitle="Planned HeatPump Pro module." />
      <AppNavigation />

      <SectionCard title={moduleName} subtitle="This module is part of the platform roadmap and is not enabled in this release.">
        <EmptyState
          title="Coming soon"
          message="The module card is intentionally non-breaking and routes here until implementation begins."
        />
        <ButtonRow>
          <PrimaryButton
            title="Back to Dashboard"
            onPress={() => {
              router.push('/' as never);
            }}
          />
          <SecondaryButton
            title="Open Installations"
            onPress={() => {
              router.push('/installations' as never);
            }}
          />
        </ButtonRow>
      </SectionCard>
    </ScreenContainer>
  );
}
