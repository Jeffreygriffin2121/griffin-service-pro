import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FormInput } from '../form-input';
import { FormSelect } from '../form-select';
import { PrimaryButton } from '../primary-button';
import { EquipmentStatus, NewEquipmentRecordInput } from '../../types/equipment';

type Props = {
  values: NewEquipmentRecordInput;
  manufacturerOptions: string[];
  modelOptions: string[];
  statusOptions: EquipmentStatus[];
  errorText?: string;
  lookupFeedbackText?: string;
  onChange: (field: keyof NewEquipmentRecordInput, value: string) => void;
  onFindAddress: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function EquipmentCreateForm({
  values,
  manufacturerOptions,
  modelOptions,
  statusOptions,
  errorText,
  lookupFeedbackText,
  onChange,
  onFindAddress,
  onSave,
  onCancel,
}: Props) {
  const [openSelect, setOpenSelect] = useState<'manufacturer' | 'model' | 'status' | null>(null);

  const noModelHelper = useMemo(() => {
    if (!values.manufacturer) {
      return 'Select a manufacturer first.';
    }
    return undefined;
  }, [values.manufacturer]);

  return (
    <View>
      <FormInput
        label="Customer Name"
        value={values.customerName}
        onChangeText={(value) => onChange('customerName', value)}
        placeholder="Enter customer name"
      />
      <FormInput
        label="Phone"
        value={values.phone}
        onChangeText={(value) => onChange('phone', value)}
        placeholder="Enter phone number"
      />
      <FormInput
        label="Email"
        value={values.email}
        onChangeText={(value) => onChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter email"
      />
      <FormInput
        label="Eircode / Postcode"
        value={values.eircodePostcode}
        onChangeText={(value) => onChange('eircodePostcode', value)}
        placeholder="Enter Eircode or Postcode"
        autoCapitalize="characters"
      />
      <PrimaryButton title="Find Address" onPress={onFindAddress} style={styles.lookupButton} />
      {lookupFeedbackText ? <Text style={styles.lookupFeedback}>{lookupFeedbackText}</Text> : null}
      <FormInput
        label="Property Address"
        value={values.propertyAddress}
        onChangeText={(value) => onChange('propertyAddress', value)}
        placeholder="Enter property address"
      />

      <FormSelect
        label="Manufacturer"
        value={values.manufacturer}
        placeholder="Select manufacturer"
        options={manufacturerOptions}
        isOpen={openSelect === 'manufacturer'}
        onToggleOpen={() => setOpenSelect(openSelect === 'manufacturer' ? null : 'manufacturer')}
        onSelect={(value) => {
          onChange('manufacturer', value);
          if (!modelOptions.includes(values.model)) {
            onChange('model', '');
          }
          setOpenSelect(null);
        }}
      />

      <FormSelect
        label="Model"
        value={values.model}
        placeholder="Select model"
        options={modelOptions}
        helperText={noModelHelper}
        isOpen={openSelect === 'model'}
        onToggleOpen={() => setOpenSelect(openSelect === 'model' ? null : 'model')}
        onSelect={(value) => {
          onChange('model', value);
          setOpenSelect(null);
        }}
        disabled={!values.manufacturer}
      />

      <FormInput
        label="Serial Number"
        value={values.serialNumber}
        onChangeText={(value) => onChange('serialNumber', value)}
        placeholder="Enter serial number"
      />
      <FormInput
        label="Indoor Unit Serial"
        value={values.indoorUnitSerial}
        onChangeText={(value) => onChange('indoorUnitSerial', value)}
        placeholder="Enter indoor unit serial"
      />
      <FormInput
        label="Outdoor Unit Serial"
        value={values.outdoorUnitSerial}
        onChangeText={(value) => onChange('outdoorUnitSerial', value)}
        placeholder="Enter outdoor unit serial"
      />
      <FormInput
        label="Installation Date"
        value={values.installationDate}
        onChangeText={(value) => onChange('installationDate', value)}
        placeholder="YYYY-MM-DD"
      />
      <FormInput
        label="Installer"
        value={values.installer}
        onChangeText={(value) => onChange('installer', value)}
        placeholder="Enter installer"
      />
      <FormInput
        label="Warranty Start"
        value={values.warrantyStart}
        onChangeText={(value) => onChange('warrantyStart', value)}
        placeholder="YYYY-MM-DD"
      />
      <FormInput
        label="Warranty Expiry"
        value={values.warrantyExpiry}
        onChangeText={(value) => onChange('warrantyExpiry', value)}
        placeholder="YYYY-MM-DD"
      />

      <FormSelect
        label="Status"
        value={values.status}
        placeholder="Select status"
        options={statusOptions}
        isOpen={openSelect === 'status'}
        onToggleOpen={() => setOpenSelect(openSelect === 'status' ? null : 'status')}
        onSelect={(value) => {
          onChange('status', value);
          setOpenSelect(null);
        }}
      />

      <FormInput
        label="Engineer Notes"
        value={values.engineerNotes}
        onChangeText={(value) => onChange('engineerNotes', value)}
        placeholder="Enter engineer notes"
        multiline
      />

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <PrimaryButton title="Save Installation" onPress={onSave} style={styles.button} />
      <PrimaryButton title="Cancel" onPress={onCancel} style={[styles.button, styles.cancelButton]} />
    </View>
  );
}

const styles = StyleSheet.create({
  lookupButton: {
    marginBottom: 10,
  },
  lookupFeedback: {
    color: '#b42318',
    fontSize: 13,
    marginTop: -2,
    marginBottom: 12,
  },
  errorText: {
    color: '#b42318',
    fontSize: 13,
    marginTop: -2,
    marginBottom: 12,
  },
  button: {
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
});
