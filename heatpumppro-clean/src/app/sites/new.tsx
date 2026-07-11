import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import { SiteForm } from '../../components/customers';
import { SyncStatusBadge } from '../../components/sync-status-badge';
import { getCustomerSiteRepository } from '../../services/cloud';
import { CustomerRecord, SiteFormValues } from '../../services/cloud/repositories/types';

const emptySiteFormValues: SiteFormValues = {
  customerId: '',
  siteName: '',
  addressLine1: '',
  addressLine2: '',
  town: '',
  county: '',
  eircode: '',
  country: 'Ireland',
  accessInstructions: '',
  parkingNotes: '',
  gateCode: '',
  keySafeCode: '',
  propertyType: '',
  occupancyType: '',
  bedrooms: '',
  floorAreaM2: '',
  constructionYear: '',
  insulationNotes: '',
  heatingDistribution: '',
  siteNotes: '',
  latitude: '',
  longitude: '',
  active: true,
};

export default function NewSiteScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const customerSiteRepository = getCustomerSiteRepository();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [formState, setFormState] = useState<SiteFormValues>({
    ...emptySiteFormValues,
    customerId: customerId || '',
  });
  const [errorText, setErrorText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadCustomers = useCallback(async () => {
    try {
      const rows = await customerSiteRepository.listCustomers();
      setCustomers(rows);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to load customers.');
    }
  }, [customerSiteRepository]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="New Site" subtitle="Create a property/site record linked to a customer." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <SiteForm
        values={formState}
        customers={customers}
        saveLabel={isSaving ? 'Saving...' : 'Save Site'}
        isSaving={isSaving}
        serverErrorText={errorText}
        onChange={(field, value) => {
          setFormState((current) => ({ ...current, [field]: value }));
          setErrorText('');
        }}
        onSave={async () => {
          setIsSaving(true);
          setErrorText('');
          try {
            const created = await customerSiteRepository.createSite(formState);
            router.replace(`/sites/${created.id}` as never);
          } catch (error) {
            setErrorText(error instanceof Error ? error.message : 'Unable to save site.');
          } finally {
            setIsSaving(false);
          }
        }}
        onCancel={() => {
          if (formState.customerId) {
            router.replace(`/customers/${formState.customerId}` as never);
            return;
          }
          router.replace('/customers' as never);
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
});
