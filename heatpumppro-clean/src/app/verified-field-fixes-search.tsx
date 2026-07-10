import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { manufacturers } from '../data';
import {
  listVerifiedFieldFixRecords,
  searchVerifiedFieldFixes,
} from '../services/verified-field-fixes-service';
import {
  VerifiedFieldFixRecord,
  VerifiedFieldFixSearchFilters,
} from '../types/verified-field-fixes';

const initialFilters: VerifiedFieldFixSearchFilters = {
  manufacturer: '',
  model: '',
  faultCode: '',
  keywords: '',
};

export default function VerifiedFieldFixesSearchScreen() {
  const [filters, setFilters] = useState<VerifiedFieldFixSearchFilters>(initialFilters);
  const [results, setResults] = useState<VerifiedFieldFixRecord[]>([]);
  const [isManufacturerDropdownOpen, setIsManufacturerDropdownOpen] = useState(false);

  useEffect(() => {
    setResults(listVerifiedFieldFixRecords());
  }, []);

  const updateFilter = <K extends keyof VerifiedFieldFixSearchFilters>(
    key: K,
    value: VerifiedFieldFixSearchFilters[K],
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setResults(searchVerifiedFieldFixes(filters));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setResults(listVerifiedFieldFixRecords());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>HeatPump Pro</Text>
        <Text style={styles.title}>Verified Fix Search</Text>
        <Text style={styles.subtitle}>Filter previous verified repairs by equipment and keywords.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Manufacturer</Text>
        <Pressable style={styles.dropdown} onPress={() => setIsManufacturerDropdownOpen((value) => !value)}>
          <Text style={[styles.dropdownText, !filters.manufacturer && styles.dropdownPlaceholder]}>
            {filters.manufacturer || 'Filter by manufacturer'}
          </Text>
          <Text style={styles.dropdownArrow}>{isManufacturerDropdownOpen ? '▴' : '▾'}</Text>
        </Pressable>

        {isManufacturerDropdownOpen ? (
          <View style={styles.dropdownMenu}>
            {manufacturers.map((manufacturer) => (
              <Pressable
                key={manufacturer}
                style={styles.dropdownOption}
                onPress={() => {
                  updateFilter('manufacturer', manufacturer);
                  setIsManufacturerDropdownOpen(false);
                }}>
                <Text style={styles.dropdownOptionText}>{manufacturer}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Model</Text>
        <TextInput
          value={filters.model}
          onChangeText={(value) => updateFilter('model', value)}
          placeholder="Filter by model"
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Fault Code</Text>
        <TextInput
          value={filters.faultCode}
          onChangeText={(value) => updateFilter('faultCode', value)}
          placeholder="Filter by fault code"
          style={styles.input}
          autoCapitalize="characters"
        />

        <Text style={styles.sectionTitle}>Keywords</Text>
        <TextInput
          value={filters.keywords}
          onChangeText={(value) => updateFilter('keywords', value)}
          placeholder="Search symptoms, root cause, notes, parts"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
        />

        <Pressable style={styles.primaryButton} onPress={handleSearch}>
          <Text style={styles.primaryButtonText}>Search Verified Fixes</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={clearFilters}>
          <Text style={styles.secondaryButtonText}>Clear Filters</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/verified-field-fixes')}>
          <Text style={styles.secondaryButtonText}>Back to Verified Field Fixes</Text>
        </Pressable>
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>{`Results (${results.length})`}</Text>
        {results.length ? (
          results.map((record) => (
            <View key={record.id} style={styles.resultItem}>
              <Text style={styles.resultHeadline}>{`${record.formData.manufacturer} ${record.formData.model}`}</Text>
              <Text style={styles.resultMeta}>{`Fault: ${record.formData.faultCode || 'N/A'} | Serial: ${record.formData.serialNumber || 'N/A'}`}</Text>
              <Text style={styles.resultMeta}>{`Root Cause: ${record.formData.rootCause || 'N/A'}`}</Text>
              <Text style={styles.resultMeta}>{`Parts: ${record.formData.partsReplaced || 'N/A'}`}</Text>
              <Text style={styles.resultMeta}>{`Saved: ${new Date(record.createdAt).toLocaleString()} | Sync: ${record.syncStatus}`}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No verified field fixes matched the selected filters.</Text>
        )}
      </View>
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
  header: {
    backgroundColor: '#0f4fb3',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  kicker: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#0f172a',
    fontSize: 15,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#64748b',
  },
  dropdownArrow: {
    color: '#0f4fb3',
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownOptionText: {
    color: '#0f172a',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#0f4fb3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#0f4fb3',
    fontSize: 14,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  resultTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  resultItem: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    marginTop: 6,
  },
  resultHeadline: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  resultMeta: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
