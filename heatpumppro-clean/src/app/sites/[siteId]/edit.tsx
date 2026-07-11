import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../../components/app-header';
import { SiteForm } from '../../../components/customers';
import { SectionCard } from '../../../components/section-card';
import { SyncStatusBadge } from '../../../components/sync-status-badge';
import { getCustomerSiteRepository } from '../../../services/cloud';
import { CustomerRecord, SiteFormValues, SiteRecord } from '../../../services/cloud/repositories/types';

const toFormValues = (site: SiteRecord): SiteFormValues => ({
  customerId: site.customerId,
  siteName: site.siteName,
  addressLine1: site.addressLine1,
  addressLine2: site.addressLine2,
  town: site.town,
  county: site.county,
  eircode: site.eircode,
  country: site.country,
  accessInstructions: site.accessInstructions,
  parkingNotes: site.parkingNotes,
  gateCode: site.gateCode,
  keySafeCode: site.keySafeCode,
  propertyType: site.propertyType,
  occupancyType: site.occupancyType,
  bedrooms: site.bedrooms,
  floorAreaM2: site.floorAreaM2,
  constructionYear: site.constructionYear,
  insulationNotes: site.insulationNotes,
  heatingDistribution: site.heatingDistribution,
  siteNotes: site.siteNotes,
  latitude: site.latitude,
  longitude: site.longitude,
  active: site.active,
});

export default function EditSiteScreen() {
  const { siteId } = useLocalSearchParams<{ siteId?: string }>();
  const customerSiteRepository = getCustomerSiteRepository();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [site, setSite] = useState<SiteRecord | undefined>(undefined);
  const [formState, setFormState] = useState<SiteFormValues | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const load = useCallback(async () => {
    if (!siteId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      const [siteRow, customerRows] = await Promise.all([
        customerSiteRepository.getSiteById(siteId),
        customerSiteRepository.listCustomers(),
      ]);

      setCustomers(customerRows);
      setSite(siteRow);
      setFormState(siteRow ? toFormValues(siteRow) : undefined);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to load site.');
      setSite(undefined);
    } finally {
      setLoading(false);
    }
  }, [customerSiteRepository, siteId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Edit Site" subtitle="Loading site details." />
        <SectionCard title="Loading" subtitle="Fetching site profile.">
          <Text style={styles.mutedText}>Loading site...</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  if (!site || !formState) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Edit Site" subtitle="Site record unavailable." />
        <SectionCard title="Not Found" subtitle="The site record could not be loaded.">
          <Text style={styles.errorText}>{errorText || 'Site record is unavailable.'}</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Edit Site" subtitle="Update address, access, and property details." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <SiteForm
        values={formState}
        customers={customers}
        saveLabel={isSaving ? 'Saving...' : 'Save Site'}
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
            const updated = await customerSiteRepository.updateSite(site.id, formState);
            if (!updated) {
              setErrorText('Unable to update site.');
              return;
            }
            router.replace(`/sites/${updated.id}` as never);
          } catch (error) {
            setErrorText(error instanceof Error ? error.message : 'Unable to save site changes.');
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
