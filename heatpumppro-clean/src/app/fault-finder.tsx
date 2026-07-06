import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const manufacturers = [
  'Panasonic',
  'Daikin',
  'Mitsubishi Electric',
  'Samsung',
  'LG',
  'Grant',
  'NIBE',
  'Hitachi',
  'Vaillant',
  'Viessmann',
  'Other',
];

type SearchResult = {
  title: string;
  summary: string;
  checklist: string[];
};

export default function FaultFinderScreen() {
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [faultCode, setFaultCode] = useState('');
  const [symptom, setSymptom] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = () => {
    const hasManufacturer = selectedManufacturer.trim().length > 0;
    const hasFaultCode = faultCode.trim().length > 0;
    const hasSymptom = symptom.trim().length > 0;

    if (!hasManufacturer || (!hasFaultCode && !hasSymptom)) {
      setErrorMessage('Please enter a manufacturer and either a fault code or symptom.');
      setResult(null);
      return;
    }

    const diagnosticFocus = hasFaultCode
      ? `Fault code ${faultCode.trim().toUpperCase()} for ${selectedManufacturer}`
      : `Reported symptom for ${selectedManufacturer}`;

    setErrorMessage('');
    setResult({
      title: `${selectedManufacturer} diagnostic review`,
      summary: `A professional diagnostic workflow is ready for ${diagnosticFocus}. ${model ? `Model reference: ${model}.` : ''}`.trim(),
      checklist: [
        'Confirm the unit is powered correctly and the thermostat is calling for heat.',
        'Inspect the installation and wiring for loose terminals or damaged insulation.',
        'Check the displayed fault code and compare it against the manufacturer guidance.',
        'Record the full symptom and any recent service history before replacing parts.',
      ],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>HeatPump Pro</Text>
        <Text style={styles.title}>HeatPump Pro - Fault Finder</Text>
        <Text style={styles.subtitle}>
          Capture the manufacturer, model and fault details to start a professional diagnostic review.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Manufacturer</Text>
        <Pressable style={styles.dropdown} onPress={() => setIsDropdownOpen((value) => !value)}>
          <Text style={[styles.dropdownText, !selectedManufacturer && styles.dropdownPlaceholder]}>
            {selectedManufacturer || 'Select manufacturer'}
          </Text>
          <Text style={styles.dropdownArrow}>{isDropdownOpen ? '▴' : '▾'}</Text>
        </Pressable>

        {isDropdownOpen ? (
          <View style={styles.dropdownMenu}>
            {manufacturers.map((manufacturer) => (
              <Pressable
                key={manufacturer}
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedManufacturer(manufacturer);
                  setIsDropdownOpen(false);
                }}>
                <Text style={styles.dropdownOptionText}>{manufacturer}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Model</Text>
        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Enter model"
          style={styles.input}
          autoCapitalize="characters"
        />

        <Text style={styles.sectionTitle}>Fault code</Text>
        <TextInput
          value={faultCode}
          onChangeText={setFaultCode}
          placeholder="Enter fault code"
          autoCapitalize="characters"
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Problem description</Text>
        <TextInput
          value={symptom}
          onChangeText={setSymptom}
          placeholder="Describe the issue or symptom"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
        />

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Fault</Text>
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultSummary}>{result.summary}</Text>
          <Text style={styles.resultLabel}>Recommended next steps</Text>
          {result.checklist.map((step) => (
            <Text key={step} style={styles.bulletItem}>• {step}</Text>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Complete the fields above to begin a diagnostic review.</Text>
        </View>
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
    marginBottom: 12,
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
