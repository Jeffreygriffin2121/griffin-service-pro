import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EquipmentSelector } from '../equipment/equipment-selector';
import { EquipmentSelectorSelection } from '../../types/equipment';
import { InstallationFormValues } from '../../services/cloud/repositories/types';
import { FormInput } from '../form-input';
import { PrimaryButton } from '../primary-button';
import { SectionCard } from '../section-card';

export const emptyInstallationFormValues: InstallationFormValues = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  siteAddress: '',
  addressLine1: '',
  addressLine2: '',
  townCity: '',
  county: '',
  eircode: '',
  manufacturerEntered: '',
  manufacturer: '',
  modelFamily: '',
  model: '',
  exactModelNumber: '',
  serialNumber: '',
  outdoorModel: '',
  indoorModel: '',
  indoorSerial: '',
  outdoorSerial: '',
  controllerModel: '',
  capacityKw: '',
  installer: '',
  commissionDate: '',
  installationDate: '',
  warrantyExpiry: '',
  systemType: '',
  heatSource: '',
  configurationType: '',
  electricalPhase: '',
  voltage: '',
  refrigerant: '',
  refrigerantChargeKg: '',
  glycolType: '',
  glycolPercentage: '',
  designFlowTemperature: '',
  maximumFlowTemperature: '',
  bufferTank: '',
  bufferTankSizeLitres: '',
  cylinderManufacturer: '',
  cylinderModel: '',
  cylinderSizeLitres: '',
  yearIntroduced: '',
  firmwareVersion: '',
  notes: '',
};

type Props = {
  values: InstallationFormValues;
  errorText?: string;
  saveLabel: string;
  cancelLabel?: string;
  isSaving?: boolean;
  onChange: (field: keyof InstallationFormValues, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function InstallationForm({
  values,
  errorText,
  saveLabel,
  cancelLabel = 'Cancel',
  isSaving = false,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const selectorValue: EquipmentSelectorSelection = {
    manufacturerEntered: values.manufacturerEntered,
    manufacturer: values.manufacturer,
    modelFamily: values.modelFamily,
    model: values.model,
    exactModelNumber: values.exactModelNumber,
    capacityKw: values.capacityKw,
    manualEntry: !values.manufacturer || !values.modelFamily,
  };

  return (
    <View>
      <SectionCard title="Customer and Site" subtitle="Capture the customer contact details and the installation address.">
        <FormInput
          label="Customer Name"
          value={values.customerName}
          onChangeText={(value) => onChange('customerName', value)}
          placeholder="Enter customer name"
        />
        <FormInput
          label="Customer Phone"
          value={values.customerPhone}
          onChangeText={(value) => onChange('customerPhone', value)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        <FormInput
          label="Customer Email"
          value={values.customerEmail}
          onChangeText={(value) => onChange('customerEmail', value)}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Site Address"
          value={values.siteAddress}
          onChangeText={(value) => onChange('siteAddress', value)}
          placeholder="Enter site address"
        />
        <FormInput
          label="Eircode"
          value={values.eircode}
          onChangeText={(value) => onChange('eircode', value)}
          placeholder="Enter Eircode"
          autoCapitalize="characters"
        />
        <FormInput
          label="Address Line 1"
          value={values.addressLine1}
          onChangeText={(value) => onChange('addressLine1', value)}
          placeholder="Street or property line 1"
        />
        <FormInput
          label="Address Line 2"
          value={values.addressLine2}
          onChangeText={(value) => onChange('addressLine2', value)}
          placeholder="Street or property line 2"
        />
        <FormInput
          label="Town / City"
          value={values.townCity}
          onChangeText={(value) => onChange('townCity', value)}
          placeholder="Town or city"
        />
        <FormInput
          label="County"
          value={values.county}
          onChangeText={(value) => onChange('county', value)}
          placeholder="County"
        />
      </SectionCard>

      <EquipmentSelector
        value={selectorValue}
        onChange={(next) => {
          onChange('manufacturerEntered', next.manufacturerEntered);
          onChange('manufacturer', next.manufacturer);
          onChange('modelFamily', next.modelFamily);
          onChange('model', next.model);
          onChange('exactModelNumber', next.exactModelNumber);
          onChange('capacityKw', next.capacityKw);
        }}
      />

      <SectionCard title="Heat Pump and Equipment" subtitle="Record the remaining system identifiers and equipment details.">
        <FormInput
          label="Outdoor Model"
          value={values.outdoorModel}
          onChangeText={(value) => onChange('outdoorModel', value)}
          placeholder="Outdoor unit model"
        />
        <FormInput
          label="Indoor Model"
          value={values.indoorModel}
          onChangeText={(value) => onChange('indoorModel', value)}
          placeholder="Indoor unit model"
        />
        <FormInput
          label="Indoor Serial"
          value={values.indoorSerial}
          onChangeText={(value) => onChange('indoorSerial', value)}
          placeholder="Enter indoor unit serial"
        />
        <FormInput
          label="Serial Number"
          value={values.serialNumber}
          onChangeText={(value) => onChange('serialNumber', value)}
          placeholder="Enter primary serial number"
        />
        <FormInput
          label="Outdoor Serial"
          value={values.outdoorSerial}
          onChangeText={(value) => onChange('outdoorSerial', value)}
          placeholder="Enter outdoor unit serial"
        />
        <FormInput
          label="Installer"
          value={values.installer}
          onChangeText={(value) => onChange('installer', value)}
          placeholder="Enter installer name"
        />
      </SectionCard>

      <SectionCard title="Commissioning and Warranty" subtitle="Capture the commissioning date, warranty expiry, and system configuration.">
        <FormInput
          label="Commission Date"
          value={values.commissionDate}
          onChangeText={(value) => onChange('commissionDate', value)}
          placeholder="YYYY-MM-DD"
        />
        <FormInput
          label="Warranty Expiry"
          value={values.warrantyExpiry}
          onChangeText={(value) => onChange('warrantyExpiry', value)}
          placeholder="YYYY-MM-DD"
        />
        <FormInput
          label="System Type"
          value={values.systemType}
          onChangeText={(value) => onChange('systemType', value)}
          placeholder="Heat pump system type"
        />
        <FormInput
          label="Buffer Tank"
            label="Controller Model"
            value={values.controllerModel}
            onChangeText={(value) => onChange('controllerModel', value)}
            placeholder="Controller model"
        <FormInput
          <FormInput
            label="Capacity kW"
            value={values.capacityKw}
            onChangeText={(value) => onChange('capacityKw', value)}
            placeholder="Installed capacity"
            keyboardType="decimal-pad"
          />
          <FormInput
            label="Installer"
            value={values.installer}
            onChangeText={(value) => onChange('installer', value)}
            placeholder="Enter installer name"
          />
        </SectionCard>

        <SectionCard title="System Configuration" subtitle="Capture system type, source, flow temperatures, refrigerant, and treatment.">
          <FormInput label="System Type" value={values.systemType} onChangeText={(value) => onChange('systemType', value)} placeholder="Heat pump system type" />
          <FormInput label="Heat Source" value={values.heatSource} onChangeText={(value) => onChange('heatSource', value)} placeholder="Air source, ground source, etc." />
          <FormInput
            label="Configuration Type"
            value={values.configurationType}
            onChangeText={(value) => onChange('configurationType', value)}
            placeholder="Monobloc, split, all-in-one, etc."
          />
          placeholder="Cylinder model"
            label="Electrical Phase"
            value={values.electricalPhase}
            onChangeText={(value) => onChange('electricalPhase', value)}
            placeholder="Single-phase or three-phase"
          />
          <FormInput label="Voltage" value={values.voltage} onChangeText={(value) => onChange('voltage', value)} placeholder="Voltage" />
          <FormInput
            label="Refrigerant"
            value={values.refrigerant}
            onChangeText={(value) => onChange('refrigerant', value)}
            placeholder="Refrigerant type"
          />
          <FormInput
            label="Refrigerant Charge (kg)"
            value={values.refrigerantChargeKg}
            onChangeText={(value) => onChange('refrigerantChargeKg', value)}
            placeholder="Refrigerant charge"
          />
          <FormInput label="Glycol Type" value={values.glycolType} onChangeText={(value) => onChange('glycolType', value)} placeholder="Glycol type" />
          <FormInput
            label="Glycol Percentage"
            value={values.glycolPercentage}
            onChangeText={(value) => onChange('glycolPercentage', value)}
            placeholder="Glycol percentage"
          />
          <FormInput
            label="Design Flow Temperature"
            value={values.designFlowTemperature}
            onChangeText={(value) => onChange('designFlowTemperature', value)}
            placeholder="Design flow temperature"
          />
          <FormInput
            label="Maximum Flow Temperature"
            value={values.maximumFlowTemperature}
            onChangeText={(value) => onChange('maximumFlowTemperature', value)}
            placeholder="Maximum flow temperature"
          />
        </SectionCard>

        <SectionCard title="Commissioning and Warranty" subtitle="Capture commissioning date, installation date, and warranty expiry.">
          <FormInput label="Commission Date" value={values.commissionDate} onChangeText={(value) => onChange('commissionDate', value)} placeholder="YYYY-MM-DD" />
          <FormInput label="Installation Date" value={values.installationDate} onChangeText={(value) => onChange('installationDate', value)} placeholder="YYYY-MM-DD" />
          value={values.refrigerant}
          onChangeText={(value) => onChange('refrigerant', value)}
          placeholder="Refrigerant type"
        />
      </SectionCard>

          multiline
        />
      </SectionCard>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          <FormInput
            label="Buffer Tank Size (L)"
            value={values.bufferTankSizeLitres}
            onChangeText={(value) => onChange('bufferTankSizeLitres', value)}
            placeholder="Buffer tank size"
          />
          <FormInput
            label="Cylinder Manufacturer"
            value={values.cylinderManufacturer}
            onChangeText={(value) => onChange('cylinderManufacturer', value)}
            placeholder="Cylinder manufacturer"
          />
      <PrimaryButton title={saveLabel} onPress={onSave} disabled={isSaving} style={styles.button} />
      <PrimaryButton title={cancelLabel} onPress={onCancel} disabled={isSaving} style={[styles.button, styles.cancelButton]} />
    </View>
  );
}

const styles = StyleSheet.create({
            label="Cylinder Size (L)"
            value={values.cylinderSizeLitres}
            onChangeText={(value) => onChange('cylinderSizeLitres', value)}
            placeholder="Cylinder size"
          />
          <FormInput
            label="Year Introduced"
            value={values.yearIntroduced}
            onChangeText={(value) => onChange('yearIntroduced', value)}
            placeholder="Year introduced"
          />
          <FormInput
            label="Firmware Version"
            value={values.firmwareVersion}
            onChangeText={(value) => onChange('firmwareVersion', value)}
            placeholder="Firmware version"
    marginBottom: 12,
  },
  button: {
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
});