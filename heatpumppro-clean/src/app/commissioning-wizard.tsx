import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/app-header';
import { CommissioningSummaryCard } from '../components/commissioning-summary';
import { FormInput } from '../components/form-input';
import { FormSelect } from '../components/form-select';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { getModelsForManufacturer } from '../services/fault-finder-service';
import { evaluateCommissioning } from '../services/commissioning-service';
import { CommissioningFormData, CommissioningMode, CommissioningSummary } from '../types/commissioning';
import { manufacturers } from '../data';

const initialFormData: CommissioningFormData = {
  customerName: '',
  siteAddress: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  outdoorTemperature: '',
  flowTemperature: '',
  returnTemperature: '',
  systemPressure: '',
  flowRate: '',
  glycolPercentage: '',
  mode: 'Heating',
  engineerNotes: '',
};

export default function CommissioningWizardScreen() {
  const [formData, setFormData] = useState<CommissioningFormData>(initialFormData);
  const [isManufacturerDropdownOpen, setIsManufacturerDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState<CommissioningSummary | null>(null);

  const modelOptions = getModelsForManufacturer(formData.manufacturer);

  const updateForm = <K extends keyof CommissioningFormData>(key: K, value: CommissioningFormData[K]) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
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
    setSummary(null);
  };

  const onModeChange = (mode: CommissioningMode) => {
    updateForm('mode', mode);
    setSummary(null);
  };

  const handleGenerateSummary = () => {
    const evaluation = evaluateCommissioning(formData);
    setErrorMessage(evaluation.errorMessage);
    setSummary(evaluation.summary);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Commissioning Wizard"
        subtitle="Capture site and system commissioning data to produce a professional handover summary."
      />

      <SectionCard title="Commissioning Inputs">
        <FormInput
          label="Customer name"
          value={formData.customerName}
          onChangeText={(value) => updateForm('customerName', value)}
          placeholder="Enter customer name"
        />

        <FormInput
          label="Site address"
          value={formData.siteAddress}
          onChangeText={(value) => updateForm('siteAddress', value)}
          placeholder="Enter site address"
          multiline
          numberOfLines={3}
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
            setSummary(null);
          }}
          helperText={formData.manufacturer ? undefined : 'Select a manufacturer first to load model options.'}
          emptyText="No listed models for this manufacturer."
          disabled={!formData.manufacturer}
        />

        <FormInput
          label="Serial number"
          value={formData.serialNumber}
          onChangeText={(value) => updateForm('serialNumber', value)}
          placeholder="Enter serial number"
          autoCapitalize="characters"
        />

        <FormInput
          label="Outdoor temperature (degC)"
          value={formData.outdoorTemperature}
          onChangeText={(value) => updateForm('outdoorTemperature', value)}
          placeholder="e.g. 6"
          keyboardType="decimal-pad"
        />

        <FormInput
          label="Flow temperature (degC)"
          value={formData.flowTemperature}
          onChangeText={(value) => updateForm('flowTemperature', value)}
          placeholder="e.g. 45"
          keyboardType="decimal-pad"
        />

        <FormInput
          label="Return temperature (degC)"
          value={formData.returnTemperature}
          onChangeText={(value) => updateForm('returnTemperature', value)}
          placeholder="e.g. 38"
          keyboardType="decimal-pad"
        />

        <FormInput
          label="System pressure (bar)"
          value={formData.systemPressure}
          onChangeText={(value) => updateForm('systemPressure', value)}
          placeholder="e.g. 1.4"
          keyboardType="decimal-pad"
        />

        <FormInput
          label="Flow rate (L/min)"
          value={formData.flowRate}
          onChangeText={(value) => updateForm('flowRate', value)}
          placeholder="e.g. 14"
          keyboardType="decimal-pad"
        />

        <FormInput
          label="Glycol percentage (%)"
          value={formData.glycolPercentage}
          onChangeText={(value) => updateForm('glycolPercentage', value)}
          placeholder="e.g. 25"
          keyboardType="decimal-pad"
        />

        <Text style={styles.sectionTitle}>Operating mode</Text>
        <View style={styles.modeWrap}>
          {(['Heating', 'Hot Water'] as const).map((mode) => (
            <Pressable
              key={mode}
              style={[styles.modeButton, formData.mode === mode && styles.modeButtonActive]}
              onPress={() => onModeChange(mode)}>
              <Text style={[styles.modeButtonText, formData.mode === mode && styles.modeButtonTextActive]}>
                {mode}
              </Text>
            </Pressable>
          ))}
        </View>

        <FormInput
          label="Engineer notes"
          value={formData.engineerNotes}
          onChangeText={(value) => updateForm('engineerNotes', value)}
          placeholder="Enter commissioning observations and handover notes"
          multiline
          numberOfLines={4}
        />

        <PrimaryButton title="Generate Commissioning Summary" onPress={handleGenerateSummary} />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </SectionCard>

      {summary ? (
        <CommissioningSummaryCard summary={summary} />
      ) : (
        <SectionCard>
          <Text style={styles.emptyText}>Complete the fields above to generate a commissioning summary.</Text>
        </SectionCard>
      )}
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
  sectionTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 2,
  },
  modeWrap: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  modeButtonActive: {
    backgroundColor: '#0f4fb3',
    borderColor: '#0f4fb3',
  },
  modeButtonText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});