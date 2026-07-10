import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { getInstallationRepository } from '../services/cloud';

export default function PhotosScreen() {
  const installationRepository = getInstallationRepository();
  const [installations, setInstallations] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await installationRepository.listInstallations();
      setInstallations(rows.map((item) => ({
        id: item.id,
        label: `${item.customerName} - ${item.manufacturer} ${item.model}`,
      })));
    };

    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Photo Library"
        subtitle="Open an installation to capture photos with camera/gallery and manage service visit evidence."
      />

      <SectionCard title="Installations" subtitle="Choose an installation to open its photo library.">
        <View>
          {installations.map((installation) => (
            <PrimaryButton
              key={installation.id}
              title={installation.label}
              style={styles.installationButton}
              onPress={() => {
                router.push(`/installations/${installation.id}/photos` as never);
              }}
            />
          ))}
          {!installations.length ? <Text style={styles.emptyState}>No installations available yet.</Text> : null}
        </View>
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
  installationButton: {
    marginBottom: 10,
  },
  emptyState: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});