import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { FormSelect } from '../components/form-select';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { SyncStatusBadge } from '../components/sync-status-badge';
import { AppNavigation } from '../components/navigation';
import { getCustomerSiteRepository, getInstallationRepository } from '../services/cloud';
import { CustomerRecord, InstallationRecord, SiteRecord } from '../services/cloud/repositories/types';
import { toCustomerSearchEntity, unifiedSearchMatch } from '../utils/unified-customer-site-search';

type ActivityFilter = 'all' | 'active' | 'inactive';

const formatDate = (value?: string) => (value ? value.slice(0, 10) : 'No visits yet');

export default function CustomersScreen() {
  const customerSiteRepository = getCustomerSiteRepository();
  const installationRepository = getInstallationRepository();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [installations, setInstallations] = useState<InstallationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText('');

    try {
      const [customerRows, siteRows, installationRows] = await Promise.all([
        customerSiteRepository.listCustomers(),
        customerSiteRepository.listSites(),
        installationRepository.listInstallations(),
      ]);

      setCustomers(customerRows);
      setSites(siteRows);
      setInstallations(installationRows);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to load customers.');
    } finally {
      setLoading(false);
    }
  }, [customerSiteRepository, installationRepository]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredCustomers = useMemo(() => {
    const query = searchText.trim();

    return customers
      .filter((customer) => {
        if (activityFilter === 'active') {
          return customer.active;
        }

        if (activityFilter === 'inactive') {
          return !customer.active;
        }

        return true;
      })
      .filter((customer) => {
        if (!query) {
          return true;
        }
        return unifiedSearchMatch(query, toCustomerSearchEntity(customer));
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }, [activityFilter, customers, searchText]);

  const countsByCustomer = useMemo(() => {
    const next = new Map<string, { siteCount: number; installationCount: number; latestVisitDate?: string }>();

    customers.forEach((customer) => {
      const customerSites = sites.filter((site) => site.customerId === customer.id);
      const customerInstallations = installations.filter((installation) => installation.customerId === customer.id);

      const latestVisitDate = customerInstallations
        .map((item) => item.updatedAt || item.createdAt)
        .sort((left, right) => right.localeCompare(left))[0];

      next.set(customer.id, {
        siteCount: customerSites.length,
        installationCount: customerInstallations.length,
        latestVisitDate,
      });
    });

    return next;
  }, [customers, installations, sites]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Customers" subtitle="Customer and property database with linked installations." />
      <AppNavigation />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <SectionCard title="Find Customers" subtitle="Search by name, business, phone, email, or Eircode.">
        <FormInput
          label="Search"
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search name, company, phone, email, eircode"
        />
        <FormSelect
          label="Status"
          value={activityFilter}
          placeholder="Select status"
          options={['all', 'active', 'inactive']}
          isOpen={filterOpen}
          onToggleOpen={() => setFilterOpen((value) => !value)}
          onSelect={(value) => {
            setActivityFilter(value as ActivityFilter);
            setFilterOpen(false);
          }}
        />
        <PrimaryButton
          title="New Customer"
          onPress={() => {
            router.push('/customers/new' as never);
          }}
        />
      </SectionCard>

      {loading ? (
        <SectionCard title="Loading" subtitle="Fetching customer records for your company.">
          <Text style={styles.mutedText}>Loading customers...</Text>
        </SectionCard>
      ) : null}

      {errorText ? (
        <SectionCard title="Error" subtitle="Unable to load customer records.">
          <Text style={styles.errorText}>{errorText}</Text>
          <PrimaryButton
            title="Retry"
            onPress={() => {
              void load();
            }}
          />
        </SectionCard>
      ) : null}

      {!loading && !errorText && !filteredCustomers.length ? (
        <SectionCard title="No Customers" subtitle="Create a customer to begin linking sites and installations.">
          <Text style={styles.mutedText}>No customer records match the current search and filter settings.</Text>
        </SectionCard>
      ) : null}

      {!loading && !errorText ? (
        <SectionCard title="Customer Records" subtitle="Tap a card to view full customer and site relationships.">
          <View>
            {filteredCustomers.map((customer) => {
              const counts = countsByCustomer.get(customer.id) || {
                siteCount: 0,
                installationCount: 0,
                latestVisitDate: undefined,
              };

              return (
                <View key={customer.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{customer.customerName}</Text>
                  <Text style={styles.cardLine}>Phone: {customer.primaryPhone || 'Not provided'}</Text>
                  <Text style={styles.cardLine}>Email: {customer.primaryEmail || 'Not provided'}</Text>
                  <Text style={styles.cardLine}>Sites: {counts.siteCount}</Text>
                  <Text style={styles.cardLine}>Installations: {counts.installationCount}</Text>
                  <Text style={styles.cardLine}>Latest visit: {formatDate(counts.latestVisitDate)}</Text>
                  <PrimaryButton
                    title="Open Customer"
                    onPress={() => {
                      router.push(`/customers/${customer.id}` as never);
                    }}
                    style={styles.openButton}
                  />
                </View>
              );
            })}
          </View>
        </SectionCard>
      ) : null}
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
  card: {
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardLine: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  openButton: {
    marginTop: 10,
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
