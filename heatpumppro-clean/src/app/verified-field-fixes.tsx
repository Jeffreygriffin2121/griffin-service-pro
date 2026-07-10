import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/app-header';
import { VerifiedFieldFixReportCard } from '../components/verified-field-fix-report';
import { FormInput } from '../components/form-input';
import { FormSelect } from '../components/form-select';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { getModelsForManufacturer } from '../services/fault-finder-service';
import {
  createVerifiedFieldFixRecord,
  listVerifiedFieldFixRecords,
  saveVerifiedFieldFixRecord,
  searchVerifiedFieldFixes,
} from '../services/verified-field-fixes-service';
import { getInstallationRepository } from '../services/cloud';
import { manufacturers } from '../data';
import {
  VerifiedFieldFixFormData,
  VerifiedFieldFixRecord,
  VerifiedFieldFixSearchFilters,
} from '../types/verified-field-fixes';

const initialFormData: VerifiedFieldFixFormData = {
  manufacturer: '',
  model: '',
  serialNumber: '',
  faultCode: '',
  symptoms: '',
  rootCause: '',
  diagnosticStepsPerformed: '',
  partsReplaced: '',
  measurements: '',
  timeTaken: '',
  engineerNotes: '',
};

const initialSearchFilters: VerifiedFieldFixSearchFilters = {
  manufacturer: '',
  model: '',
  faultCode: '',
  keywords: '',
};

export default function VerifiedFieldFixesScreen() {
  const installationRepository = getInstallationRepository();
  const [formData, setFormData] = useState<VerifiedFieldFixFormData>(initialFormData);
  const [installationOptions, setInstallationOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedInstallationId, setSelectedInstallationId] = useState<string>('');
  const [isInstallationDropdownOpen, setIsInstallationDropdownOpen] = useState(false);
  const [isManufacturerDropdownOpen, setIsManufacturerDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [savedRecord, setSavedRecord] = useState<VerifiedFieldFixRecord | null>(null);
  const [searchFilters, setSearchFilters] = useState<VerifiedFieldFixSearchFilters>(initialSearchFilters);
  const [searchResults, setSearchResults] = useState<VerifiedFieldFixRecord[]>([]);

  const modelOptions = getModelsForManufacturer(formData.manufacturer);

  useEffect(() => {
    const load = async () => {
      setSearchResults(listVerifiedFieldFixRecords());
      const installations = await installationRepository.listInstallations();
      const options = installations.map((item) => ({
        id: item.id,
        label: `${item.customerName} - ${item.id}`,
      }));
      setInstallationOptions(options);
      setSelectedInstallationId(options[0]?.id || '');
    };

    load();
  }, []);

  const updateForm = <K extends keyof VerifiedFieldFixFormData>(
    key: K,
    value: VerifiedFieldFixFormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSuccessMessage('');
    setSavedRecord(null);
  };

  const onManufacturerChange = (manufacturer: string) => {
    setFormData((previous) => ({
      ...previous,
      manufacturer,
      model: '',
    }));
    setIsManufacturerDropdownOpen(false);
    setIsModelDropdownOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
    setSavedRecord(null);
  };

  const handleSaveRecord = async () => {
    const result = createVerifiedFieldFixRecord(formData);

    if (result.errorMessage || !result.record) {
      setErrorMessage(result.errorMessage || 'Unable to save verified field fix record.');
      setSuccessMessage('');
      setSavedRecord(null);
      return;
    }

    saveVerifiedFieldFixRecord(result.record);

    if (selectedInstallationId) {
      await installationRepository.addVerifiedFix(selectedInstallationId, {
        faultCode: formData.faultCode || 'MANUAL',
        symptoms: formData.symptoms,
        rootCause: formData.rootCause,
        actionsTaken: formData.diagnosticStepsPerformed,
        partsReplaced: formData.partsReplaced
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        toolsUsed: [],
        estimatedRepairTime: formData.timeTaken || 'Not recorded',
        diagnosticStepsCompleted: formData.diagnosticStepsPerformed
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        safetyWarningsReviewed: [],
        result: 'verified-fixed',
      });

      if (formData.faultCode || formData.symptoms) {
        await installationRepository.addFaultRecord(
          selectedInstallationId,
          `${formData.faultCode || 'Fault'} - ${formData.symptoms || 'No symptom details provided.'}`,
        );
      }

      if (formData.engineerNotes.trim()) {
        await installationRepository.addEngineerNote(selectedInstallationId, formData.engineerNotes.trim());
      }
    }

    setErrorMessage('');
    setSuccessMessage(`Verified field fix saved with ID ${result.record.id}.`);
    setSavedRecord(result.record);
    setSearchResults(searchVerifiedFieldFixes(searchFilters));
  };

  const updateSearchFilter = <K extends keyof VerifiedFieldFixSearchFilters>(
    key: K,
    value: VerifiedFieldFixSearchFilters[K],
  ) => {
    setSearchFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSearchSavedFixes = () => {
    setSearchResults(searchVerifiedFieldFixes(searchFilters));
  };

  const clearSearchFilters = () => {
    setSearchFilters(initialSearchFilters);
    setSearchResults(listVerifiedFieldFixRecords());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Verified Field Fixes"
        subtitle="Capture completed repairs and store them in memory for later review."
      />

      <SectionCard title="Repair Record">
        <FormSelect
          label="Installation"
          value={installationOptions.find((item) => item.id === selectedInstallationId)?.label || ''}
          placeholder="Select installation"
          options={installationOptions.map((item) => item.label)}
          isOpen={isInstallationDropdownOpen}
          onToggleOpen={() => {
            setIsInstallationDropdownOpen((value) => !value);
            setIsManufacturerDropdownOpen(false);
            setIsModelDropdownOpen(false);
          }}
          onSelect={(label) => {
            const next = installationOptions.find((item) => item.label === label);
            setSelectedInstallationId(next?.id || '');
            setIsInstallationDropdownOpen(false);
          }}
        />

        <FormSelect
          label="Manufacturer"
          value={formData.manufacturer}
          placeholder="Select manufacturer"
          options={manufacturers}
          isOpen={isManufacturerDropdownOpen}
          onToggleOpen={() => {
            setIsManufacturerDropdownOpen((value) => !value);
            setIsModelDropdownOpen(false);
          }}
          onSelect={onManufacturerChange}
        />

        <FormSelect
          label="Model"
          value={formData.model}
          placeholder="Select model"
          options={modelOptions}
          isOpen={isModelDropdownOpen}
          onToggleOpen={() => setIsModelDropdownOpen((value) => !value)}
          onSelect={(model) => {
            updateForm('model', model);
            setIsModelDropdownOpen(false);
          }}
          helperText={formData.manufacturer ? undefined : 'Select a manufacturer first to load model options.'}
          emptyText="No listed models for this manufacturer."
          disabled={!formData.manufacturer}
        />

        <FormInput
          label="Serial Number"
          value={formData.serialNumber}
          onChangeText={(value) => updateForm('serialNumber', value)}
          placeholder="Enter serial number"
          autoCapitalize="characters"
        />

        <FormInput
          label="Fault Code"
          value={formData.faultCode}
          onChangeText={(value) => updateForm('faultCode', value)}
          placeholder="Enter fault code"
          autoCapitalize="characters"
        />

        <FormInput
          label="Symptoms"
          value={formData.symptoms}
          onChangeText={(value) => updateForm('symptoms', value)}
          placeholder="Describe observed symptoms"
          multiline
          numberOfLines={3}
        />

        <FormInput
          label="Root Cause"
          value={formData.rootCause}
          onChangeText={(value) => updateForm('rootCause', value)}
          placeholder="Enter confirmed root cause"
          multiline
          numberOfLines={3}
        />

        <FormInput
          label="Diagnostic Steps Performed"
          value={formData.diagnosticStepsPerformed}
          onChangeText={(value) => updateForm('diagnosticStepsPerformed', value)}
          placeholder="List diagnostic steps performed"
          multiline
          numberOfLines={4}
        />

        <FormInput
          label="Parts Replaced"
          value={formData.partsReplaced}
          onChangeText={(value) => updateForm('partsReplaced', value)}
          placeholder="List replaced parts"
          multiline
          numberOfLines={3}
        />

        <FormInput
          label="Measurements"
          value={formData.measurements}
          onChangeText={(value) => updateForm('measurements', value)}
          placeholder="Enter key measurements captured"
          multiline
          numberOfLines={3}
        />

        <FormInput
          label="Time Taken"
          value={formData.timeTaken}
          onChangeText={(value) => updateForm('timeTaken', value)}
          placeholder="e.g. 2h 15m"
        />

        <Text style={styles.sectionTitle}>Before Photos (placeholder)</Text>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>Photo capture will be available in a future update.</Text>
        </View>

        <Text style={styles.sectionTitle}>After Photos (placeholder)</Text>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>Photo capture will be available in a future update.</Text>
        </View>

        <FormInput
          label="Engineer Notes"
          value={formData.engineerNotes}
          onChangeText={(value) => updateForm('engineerNotes', value)}
          placeholder="Enter engineer notes"
          multiline
          numberOfLines={4}
        />

        <PrimaryButton title="Save Verified Field Fix" onPress={handleSaveRecord} />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      </SectionCard>

      {savedRecord?.report ? <VerifiedFieldFixReportCard report={savedRecord.report} /> : null}

      <SectionCard title="Search Saved Field Fixes" subtitle="Filter the in-memory saved records by equipment or keywords.">
        <FormInput
          label="Manufacturer"
          value={searchFilters.manufacturer}
          onChangeText={(value) => updateSearchFilter('manufacturer', value)}
          placeholder="Filter by manufacturer"
        />

        <FormInput
          label="Model"
          value={searchFilters.model}
          onChangeText={(value) => updateSearchFilter('model', value)}
          placeholder="Filter by model"
        />

        <FormInput
          label="Fault Code"
          value={searchFilters.faultCode}
          onChangeText={(value) => updateSearchFilter('faultCode', value)}
          placeholder="Filter by fault code"
          autoCapitalize="characters"
        />

        <FormInput
          label="Keywords"
          value={searchFilters.keywords}
          onChangeText={(value) => updateSearchFilter('keywords', value)}
          placeholder="Search symptoms, root cause, notes, parts"
          multiline
          numberOfLines={3}
        />

        <PrimaryButton title="Search Saved Fixes" onPress={handleSearchSavedFixes} />

        <Pressable style={styles.secondaryButton} onPress={clearSearchFilters}>
          <Text style={styles.secondaryButtonText}>Clear Search Filters</Text>
        </Pressable>

        <SectionCard title={`Saved Fixes (${searchResults.length})`}>
          {searchResults.length ? (
            searchResults.map((record) => (
              <View key={record.id} style={styles.resultItem}>
                <Text style={styles.resultHeadline}>{`${record.formData.manufacturer} ${record.formData.model}`}</Text>
                <Text style={styles.resultMeta}>{`Fault: ${record.formData.faultCode || 'N/A'} | Serial: ${record.formData.serialNumber || 'N/A'}`}</Text>
                <Text style={styles.resultMeta}>{`Root Cause: ${record.formData.rootCause || 'N/A'}`}</Text>
                <Text style={styles.resultMeta}>{`Saved: ${new Date(record.createdAt).toLocaleString()} | Sync: ${record.syncStatus}`}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No saved verified field fixes matched the selected filters.</Text>
          )}
        </SectionCard>
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
  dropdownOptionMuted: {
    color: '#64748b',
    fontSize: 13,
  },
  helperText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: -2,
    marginBottom: 12,
  },
  photoPlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  photoPlaceholderText: {
    color: '#475569',
    fontSize: 13,
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
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  successText: {
    color: '#0f766e',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultTitle: {
    color: '#0f172a',
    fontSize: 17,
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
});
