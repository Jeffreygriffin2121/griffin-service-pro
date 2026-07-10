import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import {
  InstallationForm,
  emptyInstallationFormValues,
} from '../../components/installations/installation-form';
import { SectionCard } from '../../components/section-card';
import { SyncStatusBadge } from '../../components/sync-status-badge';
import { useAuth } from '../../features/auth/auth-context';
import { getInstallationRepository } from '../../services/cloud';
import { InstallationFormValues } from '../../services/cloud/repositories/types';

const requiredFields: Array<[keyof InstallationFormValues, string]> = [
  ['customerName', 'Customer Name'],
  ['customerPhone', 'Customer Phone'],
  ['customerEmail', 'Customer Email'],
  ['siteAddress', 'Site Address'],
  ['eircode', 'Eircode'],
  ['manufacturer', 'Manufacturer'],
  ['modelFamily', 'Model Family'],
  ['serialNumber', 'Serial Number'],
  ['indoorSerial', 'Indoor Serial'],
  ['outdoorSerial', 'Outdoor Serial'],
  ['installer', 'Installer'],
  ['commissionDate', 'Commission Date'],
  ['installationDate', 'Installation Date'],
  ['warrantyExpiry', 'Warranty Expiry'],
  ['systemType', 'System Type'],
  ['refrigerant', 'Refrigerant'],
];

export default function NewInstallationScreen() {
  const { loading: authLoading, session } = useAuth();
  const installationRepository = getInstallationRepository();
  const [formState, setFormState] = useState<InstallationFormValues>(emptyInstallationFormValues);
  const [errorText, setErrorText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const onChange = useCallback((field: keyof InstallationFormValues, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setErrorText('');
  }, []);

  const onSave = useCallback(async () => {
    const missing = requiredFields.find(([field]) => !formState[field].trim());
    if (missing) {
      setErrorText(`${missing[1]} is required.`);
      return;
    }

    setIsSaving(true);
    setErrorText('');

    try {
      const created = await installationRepository.createInstallation(formState);
      router.replace(`/installations/${created.id}` as never);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to save the installation.');
    } finally {
      setIsSaving(false);
    }
  }, [formState, installationRepository]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Add Installation" subtitle="Create a complete installation record for the authenticated company." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      {authLoading ? (
        <SectionCard title="Loading Session" subtitle="Waiting for authentication to finish before saving records.">
          <Text style={styles.loadingText}>Loading account context...</Text>
        </SectionCard>
      ) : null}

      {!session && !authLoading ? (
        <SectionCard title="No Session" subtitle="Sign in before creating an installation record.">
          <Text style={styles.loadingText}>You are not signed in.</Text>
        </SectionCard>
      ) : null}

      <InstallationForm
        values={formState}
        errorText={errorText}
        saveLabel={isSaving ? 'Saving...' : 'Save Installation'}
        isSaving={isSaving}
        onChange={onChange}
        onSave={onSave}
        onCancel={() => {
          router.replace('/installations' as never);
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
  loadingText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
});