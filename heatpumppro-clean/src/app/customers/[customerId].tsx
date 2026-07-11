import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import { PrimaryButton } from '../../components/primary-button';
import { SectionCard } from '../../components/section-card';
import { SyncStatusBadge } from '../../components/sync-status-badge';
import { getCustomerSiteRepository, getInstallationRepository } from '../../services/cloud';
import { CustomerRecord, InstallationRecord, SiteRecord } from '../../services/cloud/repositories/types';

const field = (label: string, value: string) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
  </View>
);

export default function CustomerDetailScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const customerSiteRepository = getCustomerSiteRepository();
  const installationRepository = getInstallationRepository();

  const [customer, setCustomer] = useState<CustomerRecord | undefined>(undefined);
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [installations, setInstallations] = useState<InstallationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');

  const load = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorText('');
    try {
      const [customerRow, siteRows, installationRows] = await Promise.all([
        customerSiteRepository.getCustomerById(customerId),
        customerSiteRepository.listSitesByCustomer(customerId),
        installationRepository.listInstallations(),
      ]);

      setCustomer(customerRow);
      setSites(siteRows);
      setInstallations(installationRows.filter((installation) => installation.customerId === customerId));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to load customer details.');
      setCustomer(undefined);
    } finally {
      setLoading(false);
    }
  }, [customerId, customerSiteRepository, installationRepository]);

  useEffect(() => {
    void load();
  }, [load]);

  const servicePlaceholder = useMemo(() => {
    if (!installations.length) {
      return 'No linked installation service history available yet.';
    }
    return 'Service history summary will aggregate linked site and installation visits.';
  }, [installations.length]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Customer" subtitle="Loading customer details." />
        <SectionCard title="Loading" subtitle="Fetching customer profile.">
          <Text style={styles.mutedText}>Loading customer data...</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  if (!customer) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Customer" subtitle="Customer record unavailable." />
        <SectionCard title="Not Found" subtitle="This customer record could not be loaded.">
          <Text style={styles.errorText}>{errorText || 'No customer found for this route.'}</Text>
          <PrimaryButton title="Back to Customers" onPress={() => router.replace('/customers' as never)} />
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title={customer.customerName} subtitle="Customer profile, linked sites, and linked installations." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <SectionCard title="Contact Information" subtitle="Primary and secondary contact channels.">
        {field('Primary Phone', customer.primaryPhone)}
        {field('Secondary Phone', customer.secondaryPhone)}
        {field('Primary Email', customer.primaryEmail)}
        {field('Secondary Email', customer.secondaryEmail)}
        {field('Preferred Contact', customer.preferredContactMethod)}
      </SectionCard>

      <SectionCard title="Billing Address" subtitle="Customer billing contact address.">
        {field('Address Line 1', customer.billingAddressLine1)}
        {field('Address Line 2', customer.billingAddressLine2)}
        {field('Town', customer.billingTown)}
        {field('County', customer.billingCounty)}
        {field('Eircode', customer.billingEircode)}
      </SectionCard>

      <SectionCard title="Notes" subtitle="Operational and account notes.">
        <Text style={styles.noteText}>{customer.notes || 'No notes yet.'}</Text>
      </SectionCard>

      <SectionCard title="Linked Sites" subtitle="Properties associated with this customer.">
        {sites.length ? (
          sites.map((site) => (
            <View key={site.id} style={styles.card}>
              <Text style={styles.cardTitle}>{site.siteName || 'Site'}</Text>
              <Text style={styles.cardLine}>{site.addressLine1}</Text>
              <Text style={styles.cardLine}>{site.eircode || 'No Eircode'}</Text>
              <PrimaryButton
                title="Open Site"
                onPress={() => {
                  router.push(`/sites/${site.id}` as never);
                }}
                style={styles.inlineButton}
              />
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>No linked sites yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="Linked Installations" subtitle="Installations linked to this customer.">
        {installations.length ? (
          installations.map((installation) => (
            <View key={installation.id} style={styles.card}>
              <Text style={styles.cardTitle}>{installation.siteAddress || installation.customerName}</Text>
              <Text style={styles.cardLine}>{installation.manufacturer} {installation.modelFamily}</Text>
              <Text style={styles.cardLine}>Serial: {installation.serialNumber || 'Not recorded'}</Text>
              <PrimaryButton
                title="Open Installation"
                onPress={() => {
                  router.push(`/installations/${installation.id}` as never);
                }}
                style={styles.inlineButton}
              />
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>No linked installations yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="Service History" subtitle="Summary placeholder for service activity timeline.">
        <Text style={styles.mutedText}>{servicePlaceholder}</Text>
      </SectionCard>

      <SectionCard title="Actions" subtitle="Customer and site management shortcuts.">
        <PrimaryButton
          title="Add Site"
          onPress={() => {
            router.push(`/sites/new?customerId=${customer.id}` as never);
          }}
          style={styles.inlineButton}
        />
        <PrimaryButton
          title="Add Installation"
          onPress={() => {
            router.push(`/installations/new?customerId=${customer.id}` as never);
          }}
          style={styles.inlineButton}
        />
        <PrimaryButton
          title="Edit Customer"
          onPress={() => {
            router.push(`/customers/${customer.id}/edit` as never);
          }}
        />
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
  field: {
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  fieldValue: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
  },
  noteText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 4,
  },
  cardLine: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  inlineButton: {
    marginTop: 8,
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
    marginBottom: 10,
  },
});
