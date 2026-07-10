import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../../components/app-header';
import {
  InstallationForm,
  emptyInstallationFormValues,
} from '../../../components/installations/installation-form';
import { SectionCard } from '../../../components/section-card';
import { SyncStatusBadge } from '../../../components/sync-status-badge';
import { getInstallationRepository } from '../../../services/cloud';
import { InstallationFormValues, InstallationRecord } from '../../../services/cloud/repositories/types';

const requiredFields: Array<[keyof InstallationFormValues, string]> = [
  ['customerName', 'Customer Name'],
  ['customerPhone', 'Customer Phone'],
  ['customerEmail', 'Customer Email'],
  ['siteAddress', 'Site Address'],
  ['eircode', 'Eircode'],
  ['manufacturer', 'Manufacturer'],
  ['modelFamily', 'Model Family'],
  ['serialNumber', 'Serial Number'],
  ['indoorSerial', 'Indoor Serial'],
  ['outdoorSerial', 'Outdoor Serial'],
  ['installer', 'Installer'],
  ['commissionDate', 'Commission Date'],
  ['installationDate', 'Installation Date'],
  ['warrantyExpiry', 'Warranty Expiry'],
  ['systemType', 'System Type'],
  ['refrigerant', 'Refrigerant'],
];

const toFormValues = (record: InstallationRecord): InstallationFormValues => ({
  customerName: record.customerName,
  customerPhone: record.customerPhone,
  customerEmail: record.customerEmail,
  siteAddress: record.siteAddress,
  addressLine1: record.addressLine1,
  addressLine2: record.addressLine2,
  townCity: record.townCity,
  county: record.county,
  eircode: record.eircode,
  manufacturerEntered: record.manufacturerEntered,
  manufacturer: record.manufacturer,
  modelFamily: record.modelFamily,
  model: record.model,
  exactModelNumber: record.exactModelNumber,
  serialNumber: record.serialNumber,
  outdoorModel: record.outdoorModel,
  indoorModel: record.indoorModel,
  indoorSerial: record.indoorSerial,
  outdoorSerial: record.outdoorSerial,
  controllerModel: record.controllerModel,
  capacityKw: record.capacityKw,
  installer: record.installer,
  commissionDate: record.commissionDate,
  installationDate: record.installationDate,
  warrantyExpiry: record.warrantyExpiry,
  systemType: record.systemType,
  heatSource: record.heatSource,
  configurationType: record.configurationType,
  electricalPhase: record.electricalPhase,
  voltage: record.voltage,
  bufferTank: record.bufferTank,
  bufferTankSizeLitres: record.bufferTankSizeLitres,
  cylinderManufacturer: record.cylinderManufacturer,
  cylinderModel: record.cylinderModel,
  cylinderSizeLitres: record.cylinderSizeLitres,
  refrigerant: record.refrigerant,
  refrigerantChargeKg: record.refrigerantChargeKg,
  glycolType: record.glycolType,
  glycolPercentage: record.glycolPercentage,
  designFlowTemperature: record.designFlowTemperature,
  maximumFlowTemperature: record.maximumFlowTemperature,
  yearIntroduced: record.yearIntroduced,
  firmwareVersion: record.firmwareVersion,
  notes: record.notes,
});

export default function EditInstallationScreen() {
  const { installationId } = useLocalSearchParams<{ installationId?: string }>();
  const installationRepository = getInstallationRepository();
  const [installation, setInstallation] = useState<InstallationRecord | undefined>(undefined);
  const [formState, setFormState] = useState<InstallationFormValues>(emptyInstallationFormValues);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadInstallation = useCallback(async () => {
    if (!installationId) {
      setInstallation(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      const record = await installationRepository.getInstallationById(installationId);
      setInstallation(record);
      setFormState(record ? toFormValues(record) : emptyInstallationFormValues);
    } catch (error) {
      setInstallation(undefined);
      setErrorText(error instanceof Error ? error.message : 'Unable to load the installation.');
    } finally {
      setLoading(false);
    }
  }, [installationId, installationRepository]);

  useEffect(() => {
    void loadInstallation();
  }, [loadInstallation]);

  const onSave = useCallback(async () => {
    const missing = requiredFields.find(([field]) => !formState[field].trim());
    if (missing) {
      setErrorText(`${missing[1]} is required.`);
      return;
    }

    if (!installation) {
      setErrorText('No installation is loaded for editing.');
      return;
    }

    setIsSaving(true);
    setErrorText('');

    try {
      const updated = await installationRepository.updateInstallation(installation.id, formState);
      if (!updated) {
        setErrorText('Unable to update this installation.');
        return;
      }

      router.replace(`/installations/${updated.id}` as never);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to update the installation.');
    } finally {
      setIsSaving(false);
    }
  }, [formState, installation, installationRepository]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Edit Installation" subtitle="Loading the selected installation." />
        <SectionCard title="Loading" subtitle="Fetching the current installation details.">
          <Text style={styles.loadingText}>Loading installation...</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  if (!installation) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Edit Installation" subtitle="The selected installation could not be found." />
        <SectionCard title="Missing Installation" subtitle="Return to Installations and choose a recent record.">
          <Text style={styles.loadingText}>{errorText || 'No installation record is available for this route.'}</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Edit Installation" subtitle="Update the customer, site, and equipment details for this record." />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      {errorText ? (
        <SectionCard title="Unable to Save" subtitle="Review the form and try again.">
          <Text style={styles.errorText}>{errorText}</Text>
        </SectionCard>
      ) : null}

      <InstallationForm
        values={formState}
        errorText={errorText}
        saveLabel={isSaving ? 'Saving...' : 'Save Changes'}
        isSaving={isSaving}
        onChange={(field, value) => {
          setFormState((current) => ({ ...current, [field]: value }));
          setErrorText('');
        }}
        onSave={onSave}
        onCancel={() => {
          router.back();
        }}
      />
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
  loadingText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
  },
});