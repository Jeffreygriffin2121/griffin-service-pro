import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import {
  InstallationForm,
  emptyInstallationFormValues,
} from '../../components/installations/installation-form';
import { SectionCard } from '../../components/section-card';
import { SyncStatusBadge } from '../../components/sync-status-badge';
import { useAuth } from '../../features/auth/auth-context';
import { getCustomerSiteRepository, getInstallationRepository } from '../../services/cloud';
import {
  CustomerFormValues,
  CustomerRecord,
  InstallationFormValues,
  SiteFormValues,
  SiteRecord,
} from '../../services/cloud/repositories/types';

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
  const { customerId, siteId } = useLocalSearchParams<{ customerId?: string; siteId?: string }>();
  const { loading: authLoading, session } = useAuth();
  const installationRepository = getInstallationRepository();
  const customerSiteRepository = getCustomerSiteRepository();
  const [formState, setFormState] = useState<InstallationFormValues>({
    ...emptyInstallationFormValues,
    linkedCustomerId: customerId || '',
    linkedSiteId: siteId || '',
  });
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [loadingCustomerSite, setLoadingCustomerSite] = useState<boolean>(true);
  const [customerSiteError, setCustomerSiteError] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadCustomerSiteData = useCallback(async () => {
    setLoadingCustomerSite(true);
    setCustomerSiteError('');

    try {
      const [customerRows, siteRows] = await Promise.all([
        customerSiteRepository.listCustomers(),
        customerSiteRepository.listSites(),
      ]);
      setCustomers(customerRows);
      setSites(siteRows);
    } catch (error) {
      setCustomerSiteError(error instanceof Error ? error.message : 'Unable to load customers and sites.');
    } finally {
      setLoadingCustomerSite(false);
    }
  }, [customerSiteRepository]);

  useEffect(() => {
    void loadCustomerSiteData();
  }, [loadCustomerSiteData]);

  useEffect(() => {
    if (!formState.linkedCustomerId) {
      return;
    }

    const customer = customers.find((item) => item.id === formState.linkedCustomerId);
    if (customer) {
      setFormState((current) => ({
        ...current,
        customerName: current.customerName || customer.customerName,
        customerPhone: current.customerPhone || customer.primaryPhone,
        customerEmail: current.customerEmail || customer.primaryEmail,
        siteAddress: current.siteAddress || customer.billingAddressLine1,
        eircode: current.eircode || customer.billingEircode,
      }));
    }

    if (!formState.linkedSiteId) {
      return;
    }

    const site = sites.find((item) => item.id === formState.linkedSiteId);
    if (site) {
      setFormState((current) => ({
        ...current,
        siteAddress: current.siteAddress || site.addressLine1,
        addressLine1: current.addressLine1 || site.addressLine1,
        addressLine2: current.addressLine2 || site.addressLine2,
        townCity: current.townCity || site.town,
        county: current.county || site.county,
        eircode: current.eircode || site.eircode,
      }));
    }
  }, [customers, formState.linkedCustomerId, formState.linkedSiteId, sites]);

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
      const created = await installationRepository.createInstallation({
        ...formState,
        customerId: formState.linkedCustomerId || undefined,
        siteId: formState.linkedSiteId || undefined,
      });
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
        customers={customers}
        sites={sites}
        isCustomerSiteLoading={loadingCustomerSite}
        customerSiteErrorText={customerSiteError}
        errorText={errorText}
        saveLabel={isSaving ? 'Saving...' : 'Save Installation'}
        isSaving={isSaving}
        onChange={onChange}
        onCreateCustomer={async (values: CustomerFormValues) => {
          const created = await customerSiteRepository.createCustomer(values);
          await loadCustomerSiteData();
          return created;
        }}
        onCreateSite={async (values: SiteFormValues) => {
          const created = await customerSiteRepository.createSite(values);
          await loadCustomerSiteData();
          return created;
        }}
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