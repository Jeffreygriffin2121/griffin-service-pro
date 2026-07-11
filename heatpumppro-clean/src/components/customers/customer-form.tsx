import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CustomerFormValues, CustomerType } from '../../services/cloud/repositories/types';
import { validateCustomerForm } from '../../utils/customer-site-validation';
import { FormInput } from '../form-input';
import { FormSelect } from '../form-select';
import { PrimaryButton } from '../primary-button';
import { SectionCard } from '../section-card';

const customerTypeOptions: CustomerType[] = ['domestic', 'commercial', 'landlord', 'property manager', 'other'];

type Props = {
  values: CustomerFormValues;
  saveLabel: string;
  cancelLabel?: string;
  isSaving?: boolean;
  serverErrorText?: string;
  onChange: <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function CustomerForm({
  values,
  saveLabel,
  cancelLabel = 'Cancel',
  isSaving = false,
  serverErrorText,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const [isCustomerTypeOpen, setIsCustomerTypeOpen] = useState<boolean>(false);
  const [isPreferredContactOpen, setIsPreferredContactOpen] = useState<boolean>(false);

  const validationErrors = useMemo(() => validateCustomerForm(values), [values]);
  const hasErrors = validationErrors.length > 0;

  return (
    <View>
      <SectionCard title="Customer Profile" subtitle="Capture contact and business profile details.">
        <FormSelect
          label="Customer Type"
          value={values.customerType}
          placeholder="Select customer type"
          options={customerTypeOptions}
          isOpen={isCustomerTypeOpen}
          onToggleOpen={() => setIsCustomerTypeOpen((value) => !value)}
          onSelect={(value) => {
            onChange('customerType', value as CustomerType);
            setIsCustomerTypeOpen(false);
          }}
        />

        <FormInput label="Title" value={values.title} onChangeText={(value) => onChange('title', value)} placeholder="Mr, Ms, Dr" />
        <FormInput
          label="First Name"
          value={values.firstName}
          onChangeText={(value) => onChange('firstName', value)}
          placeholder="Customer first name"
        />
        <FormInput label="Last Name" value={values.lastName} onChangeText={(value) => onChange('lastName', value)} placeholder="Customer last name" />
        <FormInput
          label="Company Name"
          value={values.companyName}
          onChangeText={(value) => onChange('companyName', value)}
          placeholder="Required for business customers"
        />
      </SectionCard>

      <SectionCard title="Contact Details" subtitle="Store primary and secondary contact channels.">
        <FormInput
          label="Primary Phone"
          value={values.primaryPhone}
          onChangeText={(value) => onChange('primaryPhone', value)}
          placeholder="Primary phone"
          keyboardType="phone-pad"
        />
        <FormInput
          label="Secondary Phone"
          value={values.secondaryPhone}
          onChangeText={(value) => onChange('secondaryPhone', value)}
          placeholder="Secondary phone"
          keyboardType="phone-pad"
        />
        <FormInput
          label="Primary Email"
          value={values.primaryEmail}
          onChangeText={(value) => onChange('primaryEmail', value)}
          placeholder="Primary email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Secondary Email"
          value={values.secondaryEmail}
          onChangeText={(value) => onChange('secondaryEmail', value)}
          placeholder="Secondary email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormSelect
          label="Preferred Contact Method"
          value={values.preferredContactMethod}
          placeholder="Select preferred method"
          options={['phone', 'email', 'sms', 'other']}
          isOpen={isPreferredContactOpen}
          onToggleOpen={() => setIsPreferredContactOpen((value) => !value)}
          onSelect={(value) => {
            onChange('preferredContactMethod', value);
            setIsPreferredContactOpen(false);
          }}
        />
      </SectionCard>

      <SectionCard title="Billing Address" subtitle="Primary billing address used for correspondence.">
        <FormInput
          label="Address Line 1"
          value={values.billingAddressLine1}
          onChangeText={(value) => onChange('billingAddressLine1', value)}
          placeholder="Street address"
        />
        <FormInput
          label="Address Line 2"
          value={values.billingAddressLine2}
          onChangeText={(value) => onChange('billingAddressLine2', value)}
          placeholder="Apartment, building, unit"
        />
        <FormInput label="Town" value={values.billingTown} onChangeText={(value) => onChange('billingTown', value)} placeholder="Town" />
        <FormInput label="County" value={values.billingCounty} onChangeText={(value) => onChange('billingCounty', value)} placeholder="County" />
        <FormInput
          label="Eircode"
          value={values.billingEircode}
          onChangeText={(value) => onChange('billingEircode', value)}
          placeholder="A65 F4E2"
          autoCapitalize="characters"
        />
      </SectionCard>

      <SectionCard title="Notes" subtitle="Operational notes and consent flags.">
        <FormInput
          label="Notes"
          value={values.notes}
          onChangeText={(value) => onChange('notes', value)}
          placeholder="Additional customer notes"
          multiline
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
