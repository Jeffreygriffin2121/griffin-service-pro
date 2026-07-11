import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CustomerForm, CustomerSelector, SiteForm, SiteSelector } from '../customers';
import { EquipmentSelector } from '../equipment/equipment-selector';
import { EquipmentSelectorSelection } from '../../types/equipment';
import {
  CustomerFormValues,
  CustomerRecord,
  InstallationFormValues,
  SiteFormValues,
  SiteRecord,
} from '../../services/cloud/repositories/types';
import { FormInput } from '../form-input';
import { PrimaryButton } from '../primary-button';
import { SectionCard } from '../section-card';

export const emptyInstallationFormValues: InstallationFormValues = {
  linkedCustomerId: '',
  linkedSiteId: '',
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

const emptyCustomerFormValues: CustomerFormValues = {
  customerType: 'domestic',
  title: '',
  firstName: '',
  lastName: '',
  companyName: '',
  primaryEmail: '',
  secondaryEmail: '',
  primaryPhone: '',
  secondaryPhone: '',
  billingAddressLine1: '',
  billingAddressLine2: '',
  billingTown: '',
  billingCounty: '',
  billingEircode: '',
  notes: '',
  preferredContactMethod: 'phone',
  marketingConsent: false,
  active: true,
};

const emptySiteFormValues: SiteFormValues = {
  customerId: '',
  siteName: '',
  addressLine1: '',
  addressLine2: '',
  town: '',
  county: '',
  eircode: '',
  country: 'Ireland',
  accessInstructions: '',
  parkingNotes: '',
  gateCode: '',
  keySafeCode: '',
  propertyType: '',
  occupancyType: '',
  bedrooms: '',
  floorAreaM2: '',
  constructionYear: '',
  insulationNotes: '',
  heatingDistribution: '',
  siteNotes: '',
  latitude: '',
  longitude: '',
  active: true,
};

type Props = {
  values: InstallationFormValues;
  customers?: CustomerRecord[];
  sites?: SiteRecord[];
  isCustomerSiteLoading?: boolean;
  showLegacyCustomerDetails?: boolean;
  errorText?: string;
  customerSiteErrorText?: string;
  saveLabel: string;
  cancelLabel?: string;
  isSaving?: boolean;
  onChange: (field: keyof InstallationFormValues, value: string) => void;
  onCreateCustomer?: (values: CustomerFormValues) => Promise<CustomerRecord | undefined>;
  onCreateSite?: (values: SiteFormValues) => Promise<SiteRecord | undefined>;
  onSave: () => void;
  onCancel: () => void;
};

export function InstallationForm({
  values,
  customers = [],
  sites = [],
  isCustomerSiteLoading = false,
  showLegacyCustomerDetails = false,
  errorText,
  customerSiteErrorText,
  saveLabel,
  cancelLabel = 'Cancel',
  isSaving = false,
  onChange,
  onCreateCustomer,
  onCreateSite,
  onSave,
  onCancel,
}: Props) {
  const [showCreateCustomer, setShowCreateCustomer] = useState<boolean>(false);
  const [showCreateSite, setShowCreateSite] = useState<boolean>(false);
  const [customerForm, setCustomerForm] = useState<CustomerFormValues>(emptyCustomerFormValues);
  const [siteForm, setSiteForm] = useState<SiteFormValues>(emptySiteFormValues);
  const [isSavingCustomer, setIsSavingCustomer] = useState<boolean>(false);
  const [isSavingSite, setIsSavingSite] = useState<boolean>(false);
  const [inlineError, setInlineError] = useState<string>('');

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === values.linkedCustomerId),
    [customers, values.linkedCustomerId],
  );

  const customerSites = useMemo(
    () => sites.filter((site) => !values.linkedCustomerId || site.customerId === values.linkedCustomerId),
    [sites, values.linkedCustomerId],
  );

  const selectorValue: EquipmentSelectorSelection = {
    manufacturerEntered: values.manufacturerEntered,
    manufacturer: values.manufacturer,
    modelFamily: values.modelFamily,
    model: values.model,
    exactModelNumber: values.exactModelNumber,
    capacityKw: values.capacityKw,
    manualEntry: !values.manufacturer || !values.modelFamily,
  };

  const onSaveCustomer = async () => {
    if (!onCreateCustomer) {
      return;
    }

    setInlineError('');
    setIsSavingCustomer(true);
    try {
      const created = await onCreateCustomer(customerForm);
      if (!created) {
        setInlineError('Unable to create customer.');
        return;
      }

      onChange('linkedCustomerId', created.id);
      onChange('linkedSiteId', '');
      onChange('customerName', created.customerName);
      onChange('customerPhone', created.primaryPhone);
      onChange('customerEmail', created.primaryEmail);
      onChange('siteAddress', created.billingAddressLine1);
      onChange('eircode', created.billingEircode);

      setCustomerForm(emptyCustomerFormValues);
      setSiteForm((current) => ({ ...current, customerId: created.id }));
      setShowCreateCustomer(false);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : 'Unable to create customer.');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const onSaveSite = async () => {
    if (!onCreateSite) {
      return;
    }

    setInlineError('');
    setIsSavingSite(true);
    try {
      const created = await onCreateSite({
        ...siteForm,
        customerId: siteForm.customerId || values.linkedCustomerId,
      });

      if (!created) {
        setInlineError('Unable to create site.');
        return;
      }

      onChange('linkedSiteId', created.id);
      onChange('siteAddress', created.addressLine1);
      onChange('addressLine1', created.addressLine1);
      onChange('addressLine2', created.addressLine2);
      onChange('townCity', created.town);
      onChange('county', created.county);
      onChange('eircode', created.eircode);

      setSiteForm(emptySiteFormValues);
      setShowCreateSite(false);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : 'Unable to create site.');
    } finally {
      setIsSavingSite(false);
    }
  };

  return (
    <View>
      <SectionCard title="Customer and Site Linking" subtitle="Link this installation to a customer and site, or create records inline.">
        <CustomerSelector
          customers={customers}
          selectedCustomerId={values.linkedCustomerId}
          onSelectCustomer={(customerId) => {
            onChange('linkedCustomerId', customerId);
            onChange('linkedSiteId', '');

            const customer = customers.find((item) => item.id === customerId);
            if (customer) {
              onChange('customerName', customer.customerName);
              onChange('customerPhone', customer.primaryPhone);
              onChange('customerEmail', customer.primaryEmail);
              onChange('siteAddress', customer.billingAddressLine1);
              onChange('eircode', customer.billingEircode);
            }
          }}
          disabled={isCustomerSiteLoading || isSaving}
        />

        <SiteSelector
          sites={customerSites}
          selectedSiteId={values.linkedSiteId}
          onSelectSite={(siteId) => {
            onChange('linkedSiteId', siteId);
            const site = sites.find((item) => item.id === siteId);
            if (site) {
              onChange('siteAddress', site.addressLine1);
              onChange('addressLine1', site.addressLine1);
              onChange('addressLine2', site.addressLine2);
              onChange('townCity', site.town);
              onChange('county', site.county);
              onChange('eircode', site.eircode);
            }
          }}
          disabled={!values.linkedCustomerId || isCustomerSiteLoading || isSaving}
        />

        <PrimaryButton
          title={showCreateCustomer ? 'Hide New Customer Form' : 'Create New Customer'}
          onPress={() => {
            setShowCreateCustomer((value) => !value);
            if (!showCreateCustomer) {
              setCustomerForm((current) => ({
                ...current,
                firstName: values.customerName,
                primaryPhone: values.customerPhone,
                primaryEmail: values.customerEmail,
                billingAddressLine1: values.siteAddress,
                billingEircode: values.eircode,
              }));
            }
          }}
          style={styles.inlineActionButton}
        />

        <PrimaryButton
          title={showCreateSite ? 'Hide New Site Form' : 'Create New Site'}
          onPress={() => {
            setShowCreateSite((value) => !value);
            if (!showCreateSite) {
              setSiteForm((current) => ({
                ...current,
                customerId: values.linkedCustomerId,
                addressLine1: values.siteAddress || values.addressLine1,
                addressLine2: values.addressLine2,
                town: values.townCity,
                county: values.county,
                eircode: values.eircode,
              }));
            }
          }}
          disabled={!values.linkedCustomerId}
          style={styles.inlineActionButton}
        />

        {customerSiteErrorText ? <Text style={styles.errorText}>{customerSiteErrorText}</Text> : null}
        {inlineError ? <Text style={styles.errorText}>{inlineError}</Text> : null}
      </SectionCard>

      {showCreateCustomer ? (
        <SectionCard title="New Customer" subtitle="Create a customer record without leaving installation workflow.">
          <CustomerForm
            values={customerForm}
            saveLabel={isSavingCustomer ? 'Saving Customer...' : 'Save Customer'}
            cancelLabel="Cancel Customer"
            isSaving={isSavingCustomer}
            onChange={(field, value) => {
              setCustomerForm((current) => ({ ...current, [field]: value }));
            }}
            onSave={() => {
              void onSaveCustomer();
            }}
            onCancel={() => {
              setShowCreateCustomer(false);
            }}
          />
        </SectionCard>
      ) : null}

      {showCreateSite ? (
        <SectionCard title="New Site" subtitle="Create a site linked to the selected customer.">
          <SiteForm
            values={siteForm}
            customers={customers}
            saveLabel={isSavingSite ? 'Saving Site...' : 'Save Site'}
            cancelLabel="Cancel Site"
            isSaving={isSavingSite}
            onChange={(field, value) => {
              setSiteForm((current) => ({ ...current, [field]: value }));
            }}
            onSave={() => {
              void onSaveSite();
            }}
            onCancel={() => {
              setShowCreateSite(false);
            }}
          />
        </SectionCard>
      ) : null}

      <SectionCard title="Customer and Site" subtitle="Capture contact and address fields used by legacy records.">
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

      {showLegacyCustomerDetails ? (
        <SectionCard title="Legacy Customer Details" subtitle="This installation uses legacy free-text customer/site fields.">
          <Text style={styles.legacyText}>Customer and site links are optional for existing records. Legacy details are preserved.</Text>
          <Text style={styles.legacyLabel}>Customer</Text>
          <Text style={styles.legacyValue}>{values.customerName || 'Not captured'}</Text>
          <Text style={styles.legacyLabel}>Phone</Text>
          <Text style={styles.legacyValue}>{values.customerPhone || 'Not captured'}</Text>
          <Text style={styles.legacyLabel}>Email</Text>
          <Text style={styles.legacyValue}>{values.customerEmail || 'Not captured'}</Text>
          <Text style={styles.legacyLabel}>Site Address</Text>
          <Text style={styles.legacyValue}>{values.siteAddress || 'Not captured'}</Text>
          <Text style={styles.legacyLabel}>Eircode</Text>
          <Text style={styles.legacyValue}>{values.eircode || 'Not captured'}</Text>
        </SectionCard>
      ) : null}

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
          label="Controller Model"
          value={values.controllerModel}
          onChangeText={(value) => onChange('controllerModel', value)}
          placeholder="Controller model"
        />
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

      <SectionCard title="Commissioning and Warranty" subtitle="Capture commissioning date, installation date, and warranty expiry.">
        <FormInput
          label="Commission Date"
          value={values.commissionDate}
          onChangeText={(value) => onChange('commissionDate', value)}
          placeholder="YYYY-MM-DD"
        />
        <FormInput
          label="Installation Date"
          value={values.installationDate}
          onChangeText={(value) => onChange('installationDate', value)}
          placeholder="YYYY-MM-DD"
        />
        <FormInput
          label="Warranty Expiry"
          value={values.warrantyExpiry}
          onChangeText={(value) => onChange('warrantyExpiry', value)}
          placeholder="YYYY-MM-DD"
        />
      </SectionCard>

      <SectionCard title="System Configuration" subtitle="Capture system type, source, flow temperatures, refrigerant, and treatment.">
        <FormInput
          label="System Type"
          value={values.systemType}
          onChangeText={(value) => onChange('systemType', value)}
          placeholder="Heat pump system type"
        />
        <FormInput
          label="Heat Source"
          value={values.heatSource}
          onChangeText={(value) => onChange('heatSource', value)}
          placeholder="Air source, ground source, etc."
        />
        <FormInput
          label="Configuration Type"
          value={values.configurationType}
          onChangeText={(value) => onChange('configurationType', value)}
          placeholder="Monobloc, split, all-in-one, etc."
        />
        <FormInput
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

      <SectionCard title="Hydronic Components" subtitle="Capture buffer tank and hot water cylinder details.">
        <FormInput label="Buffer Tank" value={values.bufferTank} onChangeText={(value) => onChange('bufferTank', value)} placeholder="Buffer tank details" />
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
        <FormInput
          label="Cylinder Model"
          value={values.cylinderModel}
          onChangeText={(value) => onChange('cylinderModel', value)}
          placeholder="Cylinder model"
        />
        <FormInput
          label="Cylinder Size (L)"
          value={values.cylinderSizeLitres}
          onChangeText={(value) => onChange('cylinderSizeLitres', value)}
          placeholder="Cylinder size"
        />
      </SectionCard>

      <SectionCard title="Additional Details" subtitle="Record software and commissioning notes.">
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
        />
        <FormInput
          label="Notes"
          value={values.notes}
          onChangeText={(value) => onChange('notes', value)}
          placeholder="Additional notes"
          multiline
        />
      </SectionCard>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <PrimaryButton title={saveLabel} onPress={onSave} disabled={isSaving} style={styles.button} />
      <PrimaryButton title={cancelLabel} onPress={onCancel} disabled={isSaving} style={[styles.button, styles.cancelButton]} />
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: '#b91c1c',
    marginBottom: 12,
  },
  inlineActionButton: {
    marginBottom: 10,
  },
  legacyText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  legacyLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  legacyValue: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  button: {
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
});