import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import { PrimaryButton } from '../../components/primary-button';
import { EquipmentRecordCard } from '../../components/equipment/equipment-record-card';
import { SectionCard } from '../../components/section-card';
import { SyncStatusBadge } from '../../components/sync-status-badge';
import { EquipmentRecord } from '../../types/equipment';
import { getInstallationRepository } from '../../services/cloud';

export default function InstallationDashboardScreen() {
  const { installationId } = useLocalSearchParams<{ installationId?: string }>();
  const [installation, setInstallation] = useState<EquipmentRecord | undefined>(undefined);
  const installationRepository = getInstallationRepository();

  useEffect(() => {
    const load = async () => {
      if (!installationId) {
        setInstallation(undefined);
        return;
      }

      const passport = await installationRepository.getEquipmentPassport(installationId);
      setInstallation(passport?.equipment);
    };

    load();
  }, [installationId]);

  if (!installation) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Installation Dashboard" subtitle="The selected installation could not be found." />
        <SectionCard title="Missing Installation" subtitle="Return to Installations and choose a recent record.">
          <Text style={styles.text}>No installation record is available for this route.</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Installation Dashboard"
        subtitle="Customer, address, equipment, warranty, and service context for the selected installation."
      />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />
      <SectionCard
        title="Start Service Visit"
        subtitle="Launch the guided service visit engine for this installation and update records automatically.">
        <PrimaryButton
          title="Start Service Visit"
          onPress={() => {
            router.push(`/installations/${installation.id}/service-visit` as never);
          }}
        />
      </SectionCard>
      <SectionCard
        title="Equipment Passport v1.0"
        subtitle="Open the permanent digital record for system health, warranty, service, faults, photos, reports, and AI guidance.">
        <PrimaryButton
          title="Open Equipment Passport"
          onPress={() => {
            router.push(`/installations/${installation.id}/equipment-passport` as never);
          }}
        />
      </SectionCard>
      <EquipmentRecordCard
        equipment={installation}
        onActionPress={(action) => {
          if (action.id === 'capture-photos') {
            router.push(`/installations/${installation.id}/photos` as never);
            return;
          }
          if (action.id === 'reports') {
            router.push(`/installations/${installation.id}/service-visit` as never);
            return;
          }
          router.push(action.href as never);
        }}
        onOpenLatestVisit={(equipment) => {
          router.push(`/installations/${equipment.id}/service-visit` as never);
        }}
      />
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
  text: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
});