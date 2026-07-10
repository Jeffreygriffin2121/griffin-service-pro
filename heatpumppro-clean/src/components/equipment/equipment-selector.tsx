import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  equipmentManufacturers,
  findManufacturerByInput,
  getModelFamiliesForManufacturer,
  getModelsForFamily,
  normalizeManufacturerName,
} from '../../data/equipment';
import { EquipmentSelectorSelection } from '../../types/equipment';
import { FormInput } from '../form-input';
import { FormSelect } from '../form-select';
import { PrimaryButton } from '../primary-button';
import { SectionCard } from '../section-card';

type Props = {
  value: EquipmentSelectorSelection;
  errorText?: string;
  onChange: (nextValue: EquipmentSelectorSelection) => void;
};

const emptySelection: EquipmentSelectorSelection = {
  manufacturerEntered: '',
  manufacturer: '',
  modelFamily: '',
  model: '',
  exactModelNumber: '',
  capacityKw: '',
  manualEntry: false,
};

const matchesQuery = (value: string, query: string) => value.toLowerCase().includes(query.toLowerCase());

export function EquipmentSelector({ value, errorText, onChange }: Props) {
  const [manufacturerQuery, setManufacturerQuery] = useState('');
  const [isManualEntry, setIsManualEntry] = useState<boolean>(value.manualEntry);
  const [openFamily, setOpenFamily] = useState<boolean>(false);
  const [openModel, setOpenModel] = useState<boolean>(false);

  const selectedManufacturer = useMemo(() => findManufacturerByInput(value.manufacturer || value.manufacturerEntered), [value.manufacturer, value.manufacturerEntered]);
  const families = useMemo(() => (value.manufacturer ? getModelFamiliesForManufacturer(value.manufacturer) : []), [value.manufacturer]);
  const exactModels = useMemo(() => (value.manufacturer && value.modelFamily ? getModelsForFamily(value.manufacturer, value.modelFamily) : []), [value.manufacturer, value.modelFamily]);

  const filteredManufacturers = useMemo(() => {
    const query = manufacturerQuery.trim();
    if (!query) {
      return equipmentManufacturers;
    }

    return equipmentManufacturers.filter((manufacturer) => {
      return matchesQuery(manufacturer.displayName, query) || manufacturer.aliases.some((alias) => matchesQuery(alias, query));
    });
  }, [manufacturerQuery]);

  const selectManufacturer = (enteredValue: string) => {
    const resolved = normalizeManufacturerName(enteredValue);
    const hasModelData = Boolean(value.modelFamily || value.model || value.exactModelNumber || value.capacityKw);
    const currentManufacturer = normalizeManufacturerName(value.manufacturer || value.manufacturerEntered);

    const applyManufacturer = () => {
      onChange({
        ...value,
        manufacturerEntered: enteredValue,
        manufacturer: resolved,
        modelFamily: '',
        model: '',
        exactModelNumber: '',
        capacityKw: '',
      });
      setIsManualEntry(false);
      setOpenFamily(false);
    };

    if (hasModelData && currentManufacturer && currentManufacturer !== resolved) {
      Alert.alert(
        'Change manufacturer?',
        'Changing the manufacturer will clear the current model selection. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Change', style: 'destructive', onPress: applyManufacturer },
        ],
      );
      return;
    }

    applyManufacturer();
  };

  const selectFamily = (familyName: string) => {
    const familyModels = value.manufacturer ? getModelsForFamily(value.manufacturer, familyName) : [];
    onChange({
      ...value,
      modelFamily: familyName,
      model: familyModels[0]?.exactModel || value.model,
      exactModelNumber: value.manualEntry ? value.exactModelNumber : '',
    });
  };

  return (
    <SectionCard title="Equipment Catalogue" subtitle="Search a manufacturer, pick a model family, or switch to manual entry for legacy records.">
      <FormInput
        label="Search Manufacturer"
        value={manufacturerQuery}
        onChangeText={setManufacturerQuery}
        placeholder="Type Panasonic, Firebird, Bosch, or an alias"
      />

      <View style={styles.manufacturerList}>
        {filteredManufacturers.map((manufacturer) => {
          const isSelected = normalizeManufacturerName(value.manufacturer || value.manufacturerEntered) === manufacturer.canonicalName;
          return (
            <Pressable
              key={manufacturer.canonicalName}
              style={[styles.manufacturerItem, isSelected && styles.manufacturerItemSelected]}
              onPress={() => selectManufacturer(manufacturer.canonicalName)}>
              <Text style={styles.manufacturerName}>{manufacturer.displayName}</Text>
              {manufacturer.aliases.length ? <Text style={styles.manufacturerAlias}>Aliases: {manufacturer.aliases.join(', ')}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        title={isManualEntry ? 'Manual Entry Enabled' : 'Switch to Manual Entry'}
        onPress={() => {
          setIsManualEntry(!isManualEntry);
          onChange({ ...value, manualEntry: !isManualEntry });
        }}
        style={styles.manualButton}
      />

      <FormSelect
        label="Model Family"
        value={value.modelFamily}
        placeholder={value.manufacturer ? 'Select model family' : 'Choose a manufacturer first'}
        options={[
          ...(value.modelFamily ? [value.modelFamily] : []),
          ...families.map((family) => family.familyName),
          'Other / Not listed',
        ]}
        helperText={value.manufacturer ? undefined : 'Model families are filtered by manufacturer.'}
        isOpen={openFamily}
        onToggleOpen={() => setOpenFamily(!openFamily)}
        onSelect={(familyName) => {
          if (familyName === 'Other / Not listed') {
            onChange({
              ...value,
              manualEntry: true,
              modelFamily: 'Other / Not listed',
              model: value.model || 'Other model',
            });
            setIsManualEntry(true);
            setOpenFamily(false);
            return;
          }

          selectFamily(familyName);
          setOpenFamily(false);
        }}
        disabled={!value.manufacturer}
      />

      <FormSelect
        label="Exact Model"
        value={value.model}
        placeholder={value.modelFamily ? 'Select exact model' : 'Choose a family first'}
        options={[
          ...(value.model ? [value.model] : []),
          ...exactModels.map((model) => model.exactModel),
          'Other / Not listed',
        ]}
        helperText={value.modelFamily ? undefined : 'Exact models are filtered by the selected family.'}
        isOpen={openModel}
        onToggleOpen={() => setOpenModel(!openModel)}
        onSelect={(exactModel) => {
          if (exactModel === 'Other / Not listed') {
            onChange({
              ...value,
              manualEntry: true,
              model: value.model || 'Other model',
            });
            setIsManualEntry(true);
            setOpenModel(false);
            return;
          }

          onChange({
            ...value,
            model: exactModel,
            exactModelNumber: exactModel,
          });
          setOpenModel(false);
        }}
        disabled={!value.modelFamily}
      />

      {exactModels.length ? <Text style={styles.helpText}>Suggested family entries are available for this manufacturer.</Text> : null}

      <FormInput
        label="Exact Model Number"
        value={value.exactModelNumber}
        onChangeText={(text) => onChange({ ...value, exactModelNumber: text })}
        placeholder="Enter exact model or leave blank for catalogued family"
      />

      <FormInput
        label="Capacity (kW)"
        value={value.capacityKw}
        onChangeText={(text) => onChange({ ...value, capacityKw: text })}
        placeholder="Enter capacity if known"
        keyboardType="decimal-pad"
      />

      <Text style={styles.helpText}>
        Manufacturer selected: {selectedManufacturer?.displayName || value.manufacturer || 'Not selected'}
      </Text>
      <Text style={styles.helpText}>
        Saved manufacturer: {value.manufacturer || 'Not selected'}
      </Text>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  manufacturerList: {
    marginBottom: 12,
  },
  manufacturerItem: {
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  manufacturerItemSelected: {
    backgroundColor: '#edf4ff',
    borderColor: '#0f4fb3',
  },
  manufacturerName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  manufacturerAlias: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  manualButton: {
    marginBottom: 10,
    backgroundColor: '#1e3a8a',
  },
  helpText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  errorText: {
    color: '#b42318',
    fontSize: 13,
    lineHeight: 18,
  },
});