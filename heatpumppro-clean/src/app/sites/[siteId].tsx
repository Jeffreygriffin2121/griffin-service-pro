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

export default function SiteDetailScreen() {
  const { siteId } = useLocalSearchParams<{ siteId?: string }>();
  const customerSiteRepository = getCustomerSiteRepository();
  const installationRepository = getInstallationRepository();

  const [site, setSite] = useState<SiteRecord | undefined>(undefined);
  const [customer, setCustomer] = useState<CustomerRecord | undefined>(undefined);
  const [installations, setInstallations] = useState<InstallationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');

  const load = useCallback(async () => {
    if (!siteId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      const siteRow = await customerSiteRepository.getSiteById(siteId);
      if (!siteRow) {
        setSite(undefined);
        setLoading(false);
        return;
      }

      const [customerRow, installationRows] = await Promise.all([
        customerSiteRepository.getCustomerById(siteRow.customerId),
        installationRepository.listInstallations(),
      ]);

      setSite(siteRow);
      setCustomer(customerRow);
      setInstallations(installationRows.filter((installation) => installation.siteId === siteRow.id));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to load site details.');
      setSite(undefined);
    } finally {
      setLoading(false);
    }
  }, [customerSiteRepository, installationRepository, siteId]);

  useEffect(() => {
    void load();
  }, [load]);

  const servicePlaceholder = useMemo(() => {
    if (!installations.length) {
      return 'No site-level service history available yet.';
    }
    return 'Service history summary will be shown here when service visit links are expanded.';
  }, [installations.length]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Site" subtitle="Loading site details." />
        <SectionCard title="Loading" subtitle="Fetching site record.">
          <Text style={styles.mutedText}>Loading site details...</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  if (!site) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Site" subtitle="Site record unavailable." />
        <SectionCard title="Not Found" subtitle="The site record could not be loaded.">
          <Text style={styles.errorText}>{errorText || 'No site found for this route.'}</Text>
          <PrimaryButton title="Back to Customers" onPress={() => router.replace('/customers' as never)} />
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title={site.siteName || 'Site'} subtitle="Property details, access notes, and linked installations." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <SectionCard title="Address" subtitle="Full site location details.">
        {field('Address Line 1', site.addressLine1)}
        {field('Address Line 2', site.addressLine2)}
        {field('Town', site.town)}
        {field('County', site.county)}
        {field('Eircode', site.eircode)}
        {field('Country', site.country)}
      </SectionCard>

      <SectionCard title="Customer Link" subtitle="Customer associated with this site.">
        <Text style={styles.fieldValue}>{customer?.customerName || 'Customer unavailable'}</Text>
        {customer ? (
          <PrimaryButton
            title="Open Customer"
            onPress={() => {
              router.push(`/customers/${customer.id}` as never);
            }}
            style={styles.inlineButton}
          />
        ) : null}
      </SectionCard>

      <SectionCard title="Access Instructions" subtitle="On-site access and practical notes.">
        {field('Access Instructions', site.accessInstructions)}
        {field('Parking Notes', site.parkingNotes)}
        {field('Gate Code', site.gateCode)}
        {field('Key Safe Code', site.keySafeCode)}
      </SectionCard>

      <SectionCard title="Property Information" subtitle="Property context for engineering planning.">
        {field('Property Type', site.propertyType)}
        {field('Occupancy Type', site.occupancyType)}
        {field('Bedrooms', site.bedrooms)}
        {field('Floor Area (m2)', site.floorAreaM2)}
        {field('Construction Year', site.constructionYear)}
        {field('Insulation Notes', site.insulationNotes)}
        {field('Heating Distribution', site.heatingDistribution)}
      </SectionCard>

      <SectionCard title="Site Notes" subtitle="General notes for future visits.">
        <Text style={styles.mutedText}>{site.siteNotes || 'No site notes yet.'}</Text>
      </SectionCard>

      <SectionCard title="Map / Location" subtitle="Location module placeholder.">
        <Text style={styles.mutedText}>Map integration placeholder. Latitude: {site.latitude || 'N/A'}, Longitude: {site.longitude || 'N/A'}</Text>
      </SectionCard>

      <SectionCard title="Linked Installations" subtitle="Installations mapped to this site.">
        {installations.length ? (
          installations.map((installation) => (
            <View key={installation.id} style={styles.card}>
              <Text style={styles.cardTitle}>{installation.manufacturer} {installation.modelFamily}</Text>
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
          <Text style={styles.mutedText}>No installations linked to this site yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="Service History" subtitle="Summary placeholder for service activity at this site.">
        <Text style={styles.mutedText}>{servicePlaceholder}</Text>
      </SectionCard>

      <SectionCard title="Actions" subtitle="Site management shortcuts.">
        <PrimaryButton
          title="Add Installation"
          onPress={() => {
            router.push(`/installations/new?customerId=${site.customerId}&siteId=${site.id}` as never);
          }}
          style={styles.inlineButton}
        />
        <PrimaryButton
          title="Edit Site"
          onPress={() => {
            router.push(`/sites/${site.id}/edit` as never);
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
