import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import { CustomerForm } from '../../components/customers';
import { SyncStatusBadge } from '../../components/sync-status-badge';
import { getCustomerSiteRepository } from '../../services/cloud';
import { CustomerFormValues } from '../../services/cloud/repositories/types';

const emptyCustomerFormValues: CustomerFormValues = {
  customerType: 'domestic',
  title: '',
  firstName: '',
  lastName: '',
  companyName: '',
  primaryEmail: '',
  secondaryEmail: '',
  primaryPhone: '',
  secondaryPhone: '',
  billingAddressLine1: '',
  billingAddressLine2: '',
  billingTown: '',
  billingCounty: '',
  billingEircode: '',
  notes: '',
  preferredContactMethod: 'phone',
  marketingConsent: false,
  active: true,
};

export default function NewCustomerScreen() {
  const customerSiteRepository = getCustomerSiteRepository();
  const [formState, setFormState] = useState<CustomerFormValues>(emptyCustomerFormValues);
  const [errorText, setErrorText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="New Customer" subtitle="Create a customer profile to link sites and installations." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <CustomerForm
        values={formState}
        saveLabel={isSaving ? 'Saving...' : 'Save Customer'}
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
            const created = await customerSiteRepository.createCustomer(formState);
            router.replace(`/customers/${created.id}` as never);
          } catch (error) {
            setErrorText(error instanceof Error ? error.message : 'Unable to save customer.');
          } finally {
            setIsSaving(false);
          }
        }}
        onCancel={() => {
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
