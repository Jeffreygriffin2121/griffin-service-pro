import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { FormSelect } from '../components/form-select';
import { PrimaryButton } from '../components/primary-button';
import { ReportCard } from '../components/report-card';
import { SectionCard } from '../components/section-card';
import { manufacturers } from '../data';
import {
  createDiagnosticReport,
  getFaultCodesForModel,
  getModelsForManufacturer,
} from '../services/fault-finder-service';
import { DiagnosticReport } from '../types/diagnostics';

export default function FaultFinderScreen() {
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [selectedFaultCode, setSelectedFaultCode] = useState('');
  const [manualFaultCode, setManualFaultCode] = useState('');
  const [symptom, setSymptom] = useState('');
  const [isManufacturerDropdownOpen, setIsManufacturerDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isFaultDropdownOpen, setIsFaultDropdownOpen] = useState(false);
  const [useManualModel, setUseManualModel] = useState(false);
  const [useManualFaultCode, setUseManualFaultCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<DiagnosticReport | null>(null);

  // Architecture note:
  // Screen state lives here, while all diagnostic/business logic is delegated to services.
  const modelOptions = getModelsForManufacturer(selectedManufacturer);
  const faultCodeOptions = getFaultCodesForModel(selectedManufacturer, selectedModel);

  const effectiveModel = (useManualModel ? manualModel : selectedModel).trim();
  const effectiveFaultCode = (useManualFaultCode ? manualFaultCode : selectedFaultCode).trim();

  const onManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
    setIsManufacturerDropdownOpen(false);

    setSelectedModel('');
    setManualModel('');
    setSelectedFaultCode('');
    setManualFaultCode('');
    setUseManualModel(false);
    setUseManualFaultCode(false);
    setIsModelDropdownOpen(false);
    setIsFaultDropdownOpen(false);

    setErrorMessage('');
    setResult(null);
  };

  const onModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    setIsModelDropdownOpen(false);

    setSelectedFaultCode('');
    setManualFaultCode('');
    setUseManualFaultCode(false);
    setIsFaultDropdownOpen(false);

    setErrorMessage('');
    setResult(null);
  };

  const handleSearch = () => {
    const searchResult = createDiagnosticReport({
      manufacturer: selectedManufacturer,
      model: effectiveModel,
      faultCode: effectiveFaultCode,
      symptom,
    });

    setErrorMessage(searchResult.errorMessage);
    setResult(searchResult.report);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="HeatPump Pro - Fault Finder"
        subtitle="Capture the manufacturer, model and fault details to start a professional diagnostic review."
      />

      <SectionCard title="Diagnostic Inputs">
        <FormSelect
          label="Manufacturer"
          value={selectedManufacturer}
          placeholder="Select manufacturer"
          options={manufacturers}
          isOpen={isManufacturerDropdownOpen}
          onToggleOpen={() => {
            setIsManufacturerDropdownOpen((value) => !value);
            setIsModelDropdownOpen(false);
            setIsFaultDropdownOpen(false);
          }}
          onSelect={onManufacturerChange}
        />

        <FormSelect
          label="Model"
          value={selectedModel}
          placeholder="Select model"
          options={modelOptions}
          isOpen={isModelDropdownOpen}
          onToggleOpen={() => {
            if (!useManualModel) {
              setIsModelDropdownOpen((value) => !value);
              setIsManufacturerDropdownOpen(false);
              setIsFaultDropdownOpen(false);
            }
          }}
          onSelect={onModelChange}
          helperText={selectedManufacturer ? undefined : 'Select a manufacturer first to load model options.'}
          emptyText="No listed models for this manufacturer."
          disabled={!selectedManufacturer}
        />

        {selectedManufacturer ? (
          <>
            <Pressable
              style={styles.fallbackToggle}
              onPress={() => {
                setUseManualModel((value) => !value);
                setIsModelDropdownOpen(false);
                setSelectedModel('');
                setManualModel('');
                setSelectedFaultCode('');
                setManualFaultCode('');
                setUseManualFaultCode(false);
                setResult(null);
              }}>
              <Text style={styles.fallbackToggleText}>
                {useManualModel ? 'Use model list' : 'Model not listed? Enter manually'}
              </Text>
            </Pressable>

            {useManualModel ? (
              <FormInput
                label="Manual model"
                value={manualModel}
                onChangeText={(value) => {
                  setManualModel(value);
                  setResult(null);
                }}
                placeholder="Enter model"
                autoCapitalize="characters"
              />
            ) : null}
          </>
        ) : null}

        <FormInput
          label="Problem description"
          value={symptom}
          onChangeText={setSymptom}
          placeholder="Describe the issue or symptom"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Fault code</Text>
        {selectedManufacturer && (selectedModel || useManualModel) ? (
          <>
            <Pressable
              style={[styles.dropdown, useManualFaultCode && styles.dropdownDisabled]}
              onPress={() => {
                if (!useManualFaultCode) {
                  setIsFaultDropdownOpen((value) => !value);
                  setIsManufacturerDropdownOpen(false);
                  setIsModelDropdownOpen(false);
                }
              }}>
              <Text style={[styles.dropdownText, !selectedFaultCode && styles.dropdownPlaceholder]}>
                {selectedFaultCode || 'Select fault code'}
              </Text>
              <Text style={styles.dropdownArrow}>{isFaultDropdownOpen ? '▴' : '▾'}</Text>
            </Pressable>

            {isFaultDropdownOpen ? (
              <View style={styles.dropdownMenu}>
                {faultCodeOptions.length ? (
                  faultCodeOptions.map((code) => (
                    <Pressable
                      key={code}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedFaultCode(code);
                        setIsFaultDropdownOpen(false);
                        setErrorMessage('');
                        setResult(null);
                      }}>
                      <Text style={styles.dropdownOptionText}>{code}</Text>
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.dropdownOption}>
                    <Text style={styles.dropdownOptionMuted}>No listed fault codes for this model.</Text>
                  </View>
                )}
              </View>
            ) : null}

            <Pressable
              style={styles.fallbackToggle}
              onPress={() => {
                setUseManualFaultCode((value) => !value);
                setIsFaultDropdownOpen(false);
                setSelectedFaultCode('');
                setManualFaultCode('');
                setResult(null);
              }}>
              <Text style={styles.fallbackToggleText}>
                {useManualFaultCode ? 'Use fault code list' : 'Fault code not listed? Enter manually'}
              </Text>
            </Pressable>

            {useManualFaultCode ? (
              <FormInput
                label="Manual fault code"
                value={manualFaultCode}
                onChangeText={(value) => {
                  setManualFaultCode(value);
                  setResult(null);
                }}
                placeholder="Enter fault code"
                autoCapitalize="characters"
              />
            ) : null}
          </>
        ) : (
          <Text style={styles.helperText}>Select a model first to load fault codes.</Text>
        )}

        <PrimaryButton title="Search Fault" onPress={handleSearch} />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </SectionCard>

      {result ? (
        <ReportCard title={result.title} generatedAt={result.generatedAt}>
          <Text style={styles.resultSummary}>{result.summary}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>Manufacturer: {selectedManufacturer}</Text>
            <Text style={styles.metaPill}>Model: {effectiveModel || 'N/A'}</Text>
            <Text style={styles.metaPill}>Fault Code: {effectiveFaultCode.toUpperCase() || 'N/A'}</Text>
          </View>

          <SectionCard title="Likely Causes">
            {result.likelyCauses.map((item) => (
              <Text key={item} style={styles.bulletItem}>• {item}</Text>
            ))}
          </SectionCard>

          <SectionCard title="Safety Checks">
            {result.safetyChecks.map((item) => (
              <Text key={item} style={styles.bulletItem}>• {item}</Text>
            ))}
          </SectionCard>

          <SectionCard title="Diagnostic Steps">
            {result.diagnosticSteps.map((item) => (
              <Text key={item} style={styles.bulletItem}>• {item}</Text>
            ))}
          </SectionCard>

          <SectionCard title="Components to Test">
            {result.componentsToTest.map((item) => (
              <Text key={item} style={styles.bulletItem}>• {item}</Text>
            ))}
          </SectionCard>

          <SectionCard title="Tools Required">
            {result.toolsRequired.map((item) => (
              <Text key={item} style={styles.bulletItem}>• {item}</Text>
            ))}
          </SectionCard>

          <SectionCard title="Next Actions">
            {result.nextActions.map((item) => (
              <Text key={item} style={styles.bulletItem}>• {item}</Text>
            ))}
          </SectionCard>
        </ReportCard>
      ) : (
        <SectionCard>
          <Text style={styles.emptyText}>Complete the fields above to begin a diagnostic review.</Text>
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
  dropdownDisabled: {
    opacity: 0.7,
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
  fallbackToggle: {
    marginTop: -2,
    marginBottom: 10,
  },
  fallbackToggleText: {
    color: '#0f4fb3',
    fontSize: 13,
    fontWeight: '700',
  },
  helperText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: -2,
    marginBottom: 12,
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
    minHeight: 96,
    textAlignVertical: 'top',
  },
  searchButton: {
    backgroundColor: '#0f4fb3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
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
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
  },
  resultSummary: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  generatedTime: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaPill: {
    color: '#0f4fb3',
    backgroundColor: '#e0ecff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
    marginBottom: 8,
  },
  reportSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    marginTop: 6,
  },
  resultLabel: {
    color: '#0f4fb3',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  bulletItem: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
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
});
