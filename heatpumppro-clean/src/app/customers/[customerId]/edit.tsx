import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../../components/app-header';
import { CustomerForm } from '../../../components/customers';
import { SectionCard } from '../../../components/section-card';
import { SyncStatusBadge } from '../../../components/sync-status-badge';
import { getCustomerSiteRepository } from '../../../services/cloud';
import { CustomerFormValues, CustomerRecord } from '../../../services/cloud/repositories/types';

const toFormValues = (customer: CustomerRecord): CustomerFormValues => ({
  customerType: customer.customerType,
  title: customer.title,
  firstName: customer.firstName,
  lastName: customer.lastName,
  companyName: customer.companyName,
  primaryEmail: customer.primaryEmail,
  secondaryEmail: customer.secondaryEmail,
  primaryPhone: customer.primaryPhone,
  secondaryPhone: customer.secondaryPhone,
  billingAddressLine1: customer.billingAddressLine1,
  billingAddressLine2: customer.billingAddressLine2,
  billingTown: customer.billingTown,
  billingCounty: customer.billingCounty,
  billingEircode: customer.billingEircode,
  notes: customer.notes,
  preferredContactMethod: customer.preferredContactMethod,
  marketingConsent: customer.marketingConsent,
  active: customer.active,
});

export default function EditCustomerScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const customerSiteRepository = getCustomerSiteRepository();

  const [customer, setCustomer] = useState<CustomerRecord | undefined>(undefined);
  const [formState, setFormState] = useState<CustomerFormValues | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const load = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      const record = await customerSiteRepository.getCustomerById(customerId);
      setCustomer(record);
      setFormState(record ? toFormValues(record) : undefined);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to load customer.');
      setCustomer(undefined);
    } finally {
      setLoading(false);
    }
  }, [customerId, customerSiteRepository]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Edit Customer" subtitle="Loading customer profile." />
        <SectionCard title="Loading" subtitle="Fetching customer details.">
          <Text style={styles.mutedText}>Loading customer...</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  if (!customer || !formState) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Edit Customer" subtitle="Customer profile unavailable." />
        <SectionCard title="Not Found" subtitle="The customer record could not be loaded.">
          <Text style={styles.errorText}>{errorText || 'Customer record is unavailable.'}</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Edit Customer" subtitle="Update contact, billing, and operational details." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <CustomerForm
        values={formState}
        saveLabel={isSaving ? 'Saving...' : 'Save Customer'}
        isSaving={isSaving}
        serverErrorText={errorText}
        onChange={(field, value) => {
          setFormState((current) => (current ? { ...current, [field]: value } : current));
          setErrorText('');
        }}
        onSave={async () => {
          setIsSaving(true);
          setErrorText('');
          try {
            const updated = await customerSiteRepository.updateCustomer(customer.id, formState);
            if (!updated) {
              setErrorText('Unable to update customer.');
              return;
            }
            router.replace(`/customers/${updated.id}` as never);
          } catch (error) {
            setErrorText(error instanceof Error ? error.message : 'Unable to save customer changes.');
          } finally {
            setIsSaving(false);
          }
        }}
        onCancel={() => {
          router.back();
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
  mutedText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
  },
});
