import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const manufacturers = ['Samsung', 'Panasonic', 'Daikin', 'Vaillant', 'Mitsubishi Electric'];

type FaultEntry = {
  meaning: string;
  likelyCauses: string[];
  diagnosticSteps: string[];
  likelyParts: string[];
  supplierLink: string;
};

const faultData: Record<string, Record<string, FaultEntry>> = {
  Samsung: {
    E911: {
      meaning: 'Communication fault between the indoor and outdoor units.',
      likelyCauses: ['Loose or damaged control wiring', 'Poor earth connection', 'Main PCB communication issue'],
      diagnosticSteps: [
        'Confirm the unit is powered correctly and the display is stable.',
        'Inspect the communication cable between indoor and outdoor sections.',
        'Check for corrosion or loose terminals at the control board.',
      ],
      likelyParts: ['Communication cable', 'Main control board', 'Terminal block'],
      supplierLink: 'Supplier link placeholder',
    },
  },
  Panasonic: {
    H62: {
      meaning: 'Outdoor unit high-pressure protection or pressure-related trip.',
      likelyCauses: ['Blocked condenser coil', 'Low refrigerant charge', 'Fan motor issue'],
      diagnosticSteps: [
        'Inspect the outdoor coil for dirt or restricted airflow.',
        'Verify refrigerant charge and pressure readings.',
        'Check the fan operation and motor current draw.',
      ],
      likelyParts: ['Condenser fan motor', 'Pressure sensor', 'Filter drier'],
      supplierLink: 'Supplier link placeholder',
    },
  },
  Daikin: {
    U4: {
      meaning: 'Indoor unit communication or signal fault.',
      likelyCauses: ['Intermittent wiring fault', 'Controller board fault', 'Signal interference'],
      diagnosticSteps: [
        'Check the indoor and outdoor control wiring for damage.',
        'Inspect the controller PCB for signs of overheating.',
        'Test the system after resetting and reinitialising the control.',
      ],
      likelyParts: ['Indoor PCB', 'Wiring harness', 'Controller'],
      supplierLink: 'Supplier link placeholder',
    },
  },
  Vaillant: {
    F75: {
      meaning: 'Flow temperature or hydraulic regulation issue.',
      likelyCauses: ['Blocked heat exchanger', 'Pump issue', 'Incorrect sensor reading'],
      diagnosticSteps: [
        'Review the flow and return temperatures against the setpoint.',
        'Check for circulation issues and pump operation.',
        'Inspect the temperature sensor and wiring.',
      ],
      likelyParts: ['Temperature sensor', 'Circulation pump', 'Flow sensor'],
      supplierLink: 'Supplier link placeholder',
    },
  },
  'Mitsubishi Electric': {
    U1: {
      meaning: 'Outdoor unit communication or inverter drive fault.',
      likelyCauses: ['Power supply issue', 'Drive board fault', 'Loose connector'],
      diagnosticSteps: [
        'Measure the supply voltage and check for dips.',
        'Inspect connectors and harness routing.',
        'Verify the inverter board and cooling fan status.',
      ],
      likelyParts: ['Inverter board', 'Power connector', 'Fan assembly'],
      supplierLink: 'Supplier link placeholder',
    },
  },
};

export default function FaultFinderScreen() {
  const [selectedManufacturer, setSelectedManufacturer] = useState('Samsung');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<null | {
    code: string;
    meaning: string;
    likelyCauses: string[];
    diagnosticSteps: string[];
    likelyParts: string[];
    supplierLink: string;
  }>(null);

  const handleSearch = () => {
    const code = query.trim().toUpperCase();
    const entry = faultData[selectedManufacturer]?.[code];

    if (entry) {
      setResult({ code, ...entry });
    } else {
      setResult(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>HeatPump Pro</Text>
        <Text style={styles.title}>Fault Finder</Text>
        <Text style={styles.subtitle}>Search common fault codes by manufacturer.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Manufacturer</Text>
        <View style={styles.chipRow}>
          {manufacturers.map((manufacturer) => {
            const isActive = manufacturer === selectedManufacturer;
            return (
              <Pressable
                key={manufacturer}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedManufacturer(manufacturer)}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{manufacturer}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Fault Code</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Enter code"
          autoCapitalize="characters"
          style={styles.input}
        />

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>

        <Text style={styles.helperText}>Try: E911, H62, U4, F75 or U1</Text>
      </View>

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{selectedManufacturer} {result.code}</Text>
          <View style={styles.resultBlock}>
            <Text style={styles.resultLabel}>Fault meaning</Text>
            <Text style={styles.resultValue}>{result.meaning}</Text>
          </View>
          <View style={styles.resultBlock}>
            <Text style={styles.resultLabel}>Likely causes</Text>
            {result.likelyCauses.map((cause) => (
              <Text key={cause} style={styles.bulletItem}>• {cause}</Text>
            ))}
          </View>
          <View style={styles.resultBlock}>
            <Text style={styles.resultLabel}>Diagnostic steps</Text>
            {result.diagnosticSteps.map((step) => (
              <Text key={step} style={styles.bulletItem}>• {step}</Text>
            ))}
          </View>
          <View style={styles.resultBlock}>
            <Text style={styles.resultLabel}>Likely parts</Text>
            {result.likelyParts.map((part) => (
              <Text key={part} style={styles.bulletItem}>• {part}</Text>
            ))}
          </View>
          <View style={styles.resultBlock}>
            <Text style={styles.resultLabel}>Supplier link</Text>
            <Text style={styles.resultValue}>{result.supplierLink}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No result yet. Enter a code and search.</Text>
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
    backgroundColor: '#003c8f',
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
    fontSize: 32,
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
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#003c8f',
    borderColor: '#003c8f',
  },
  chipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: '#003c8f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
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
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  resultBlock: {
    marginBottom: 10,
  },
  resultLabel: {
    color: '#003c8f',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  resultValue: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
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
  },
});
