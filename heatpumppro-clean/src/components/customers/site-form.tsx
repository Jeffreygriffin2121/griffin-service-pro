import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CustomerRecord, SiteFormValues } from '../../services/cloud/repositories/types';
import { validateSiteForm } from '../../utils/customer-site-validation';
import { FormInput } from '../form-input';
import { PrimaryButton } from '../primary-button';
import { SectionCard } from '../section-card';
import { CustomerSelector } from './customer-selector';

type Props = {
  values: SiteFormValues;
  customers: CustomerRecord[];
  saveLabel: string;
  cancelLabel?: string;
  isSaving?: boolean;
  serverErrorText?: string;
  onChange: <K extends keyof SiteFormValues>(field: K, value: SiteFormValues[K]) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function SiteForm({
  values,
  customers,
  saveLabel,
  cancelLabel = 'Cancel',
  isSaving = false,
  serverErrorText,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const validationErrors = useMemo(() => validateSiteForm(values), [values]);
  const hasErrors = validationErrors.length > 0;

  return (
    <View>
      <SectionCard title="Customer" subtitle="Link this property to a customer profile.">
        <CustomerSelector
          customers={customers}
          selectedCustomerId={values.customerId}
          onSelectCustomer={(customerId) => onChange('customerId', customerId)}
        />
      </SectionCard>

      <SectionCard title="Site Address" subtitle="Record complete address details for the property.">
        <FormInput label="Site Name" value={values.siteName} onChangeText={(value) => onChange('siteName', value)} placeholder="Home, Office, Block A" />
        <FormInput
          label="Address Line 1"
          value={values.addressLine1}
          onChangeText={(value) => onChange('addressLine1', value)}
          placeholder="Street address"
        />
        <FormInput
          label="Address Line 2"
          value={values.addressLine2}
          onChangeText={(value) => onChange('addressLine2', value)}
          placeholder="Apartment, unit"
        />
        <FormInput label="Town" value={values.town} onChangeText={(value) => onChange('town', value)} placeholder="Town" />
        <FormInput label="County" value={values.county} onChangeText={(value) => onChange('county', value)} placeholder="County" />
        <FormInput
          label="Eircode"
          value={values.eircode}
          onChangeText={(value) => onChange('eircode', value)}
          placeholder="A65 F4E2"
          autoCapitalize="characters"
        />
      </SectionCard>

      <SectionCard title="Access and Property" subtitle="Capture practical site and property details for engineers.">
        <FormInput
          label="Access Instructions"
          value={values.accessInstructions}
          onChangeText={(value) => onChange('accessInstructions', value)}
          placeholder="Entry instructions"
          multiline
        />
        <FormInput label="Parking Notes" value={values.parkingNotes} onChangeText={(value) => onChange('parkingNotes', value)} placeholder="Parking details" />
        <FormInput label="Gate Code" value={values.gateCode} onChangeText={(value) => onChange('gateCode', value)} placeholder="Gate code" />
        <FormInput label="Key Safe Code" value={values.keySafeCode} onChangeText={(value) => onChange('keySafeCode', value)} placeholder="Key safe code" />
        <FormInput label="Property Type" value={values.propertyType} onChangeText={(value) => onChange('propertyType', value)} placeholder="Detached, apartment" />
        <FormInput
          label="Occupancy Type"
          value={values.occupancyType}
          onChangeText={(value) => onChange('occupancyType', value)}
          placeholder="Owner occupied, tenant"
        />
        <FormInput label="Bedrooms" value={values.bedrooms} onChangeText={(value) => onChange('bedrooms', value)} placeholder="Number of bedrooms" keyboardType="number-pad" />
        <FormInput
          label="Floor Area (m2)"
          value={values.floorAreaM2}
          onChangeText={(value) => onChange('floorAreaM2', value)}
          placeholder="Floor area"
          keyboardType="decimal-pad"
        />
        <FormInput
          label="Construction Year"
          value={values.constructionYear}
          onChangeText={(value) => onChange('constructionYear', value)}
          placeholder="Construction year"
          keyboardType="number-pad"
        />
        <FormInput
          label="Insulation Notes"
          value={values.insulationNotes}
          onChangeText={(value) => onChange('insulationNotes', value)}
          placeholder="Insulation details"
          multiline
        />
        <FormInput
          label="Heating Distribution"
          value={values.heatingDistribution}
          onChangeText={(value) => onChange('heatingDistribution', value)}
          placeholder="Radiators, underfloor"
        />
        <FormInput
          label="Site Notes"
          value={values.siteNotes}
          onChangeText={(value) => onChange('siteNotes', value)}
          placeholder="General site notes"
          multiline
        />
      </SectionCard>

      <SectionCard title="Location" subtitle="Map coordinates can be captured for dispatching later.">
        <FormInput label="Latitude" value={values.latitude} onChangeText={(value) => onChange('latitude', value)} placeholder="Latitude" keyboardType="decimal-pad" />
        <FormInput
          label="Longitude"
          value={values.longitude}
          onChangeText={(value) => onChange('longitude', value)}
          placeholder="Longitude"
          keyboardType="decimal-pad"
        />
      </SectionCard>

      {hasErrors ? (
        <View style={styles.errorCard}>
          {validationErrors.map((error) => (
            <Text key={error} style={styles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      ) : null}

      {serverErrorText ? <Text style={styles.errorText}>{serverErrorText}</Text> : null}

      <PrimaryButton title={saveLabel} onPress={onSave} disabled={isSaving || hasErrors} style={styles.button} />
      <PrimaryButton title={cancelLabel} onPress={onCancel} disabled={isSaving} style={[styles.button, styles.cancelButton]} />
    </View>
  );
}

const styles = StyleSheet.create({
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#b42318',
    marginBottom: 4,
  },
  button: {
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
});
