import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import { PrimaryButton } from '../../components/primary-button';
import { SectionCard } from '../../components/section-card';
import { SyncStatusBadge } from '../../components/sync-status-badge';
import { getInstallationRepository } from '../../services/cloud';
import { InstallationRecord } from '../../services/cloud/repositories/types';

const formatDate = (value: string) => (value ? value.slice(0, 10) : 'Not recorded');

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || 'Not recorded'}</Text>
  </View>
);

export default function InstallationDetailsScreen() {
  const { installationId } = useLocalSearchParams<{ installationId?: string }>();
  const installationRepository = getInstallationRepository();
  const [installation, setInstallation] = useState<InstallationRecord | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);

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

  const onDelete = () => {
    if (!installation) {
      return;
    }

    Alert.alert('Delete installation?', 'This action removes the installation record and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            const deleted = await installationRepository.deleteInstallation(installation.id);
            if (!deleted) {
              setErrorText('Unable to delete this installation.');
              return;
            }

            router.replace('/installations' as never);
          } catch (error) {
            setErrorText(error instanceof Error ? error.message : 'Unable to delete this installation.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Installation Details" subtitle="Loading the selected installation record." />
        <SectionCard title="Loading" subtitle="Fetching the current company-scoped record.">
          <Text style={styles.emptyState}>Loading installation...</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  if (!installation) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Installation Details" subtitle="The selected installation could not be found." />
        <SectionCard title="Missing Installation" subtitle="Return to Installations and choose a recent record.">
          <Text style={styles.emptyState}>{errorText || 'No installation record is available for this route.'}</Text>
          <PrimaryButton
            title="Back to Installations"
            onPress={() => {
              router.replace('/installations' as never);
            }}
            style={styles.actionButton}
          />
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Installation Details"
        subtitle="Clean, mobile-friendly record view for customer, equipment, warranty, and site context."
      />

      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      {errorText ? (
        <SectionCard title="Load Error" subtitle="The installation loaded with an error state.">
          <Text style={styles.errorText}>{errorText}</Text>
        </SectionCard>
      ) : null}

      <SectionCard title="Actions" subtitle="Edit or remove this installation record.">
        <PrimaryButton
          title="Edit Installation"
          onPress={() => {
            router.push(`/installations/${installation.id}/edit` as never);
          }}
          style={styles.actionButton}
        />
        <PrimaryButton
          title={deleting ? 'Deleting...' : 'Delete Installation'}
          onPress={onDelete}
          disabled={deleting}
          style={[styles.actionButton, styles.deleteButton]}
        />
      </SectionCard>

      <SectionCard title="Customer" subtitle="Contact details for the homeowner or site contact.">
        <DetailField label="Customer Name" value={installation.customerName} />
        <DetailField label="Phone" value={installation.customerPhone} />
        <DetailField label="Email" value={installation.customerEmail} />
      </SectionCard>

      <SectionCard title="Site" subtitle="Installation location and address metadata.">
        <DetailField label="Site Address" value={installation.siteAddress} />
        <DetailField label="Address Line 1" value={installation.addressLine1} />
        <DetailField label="Address Line 2" value={installation.addressLine2} />
        <DetailField label="Town / City" value={installation.townCity} />
        <DetailField label="County" value={installation.county} />
        <DetailField label="Eircode" value={installation.eircode} />
      </SectionCard>

      <SectionCard title="Catalogue" subtitle="Structured manufacturer and model selection with preserved legacy entry values.">
        <DetailField label="Manufacturer Entered" value={installation.manufacturerEntered} />
        <DetailField label="Manufacturer" value={installation.manufacturer} />
        <DetailField label="Model Family" value={installation.modelFamily} />
        <DetailField label="Model" value={installation.model} />
        <DetailField label="Exact Model Number" value={installation.exactModelNumber} />
        <DetailField label="Capacity kW" value={installation.capacityKw} />
      </SectionCard>

      <SectionCard title="Equipment" subtitle="Installed heat pump and serial information.">
        <DetailField label="Serial Number" value={installation.serialNumber} />
        <DetailField label="Outdoor Model" value={installation.outdoorModel} />
        <DetailField label="Indoor Model" value={installation.indoorModel} />
        <DetailField label="Indoor Serial" value={installation.indoorSerial} />
        <DetailField label="Outdoor Serial" value={installation.outdoorSerial} />
        <DetailField label="Controller Model" value={installation.controllerModel} />
        <DetailField label="Installer" value={installation.installer} />
      </SectionCard>

      <SectionCard title="System" subtitle="Technical configuration and operating parameters.">
        <DetailField label="System Type" value={installation.systemType} />
        <DetailField label="Heat Source" value={installation.heatSource} />
        <DetailField label="Configuration Type" value={installation.configurationType} />
        <DetailField label="Electrical Phase" value={installation.electricalPhase} />
        <DetailField label="Voltage" value={installation.voltage} />
        <DetailField label="Refrigerant" value={installation.refrigerant} />
        <DetailField label="Refrigerant Charge (kg)" value={installation.refrigerantChargeKg} />
        <DetailField label="Glycol Type" value={installation.glycolType} />
        <DetailField label="Glycol Percentage" value={installation.glycolPercentage} />
        <DetailField label="Design Flow Temperature" value={installation.designFlowTemperature} />
        <DetailField label="Maximum Flow Temperature" value={installation.maximumFlowTemperature} />
      </SectionCard>

      <SectionCard title="Commissioning" subtitle="Important dates and warranty details.">
        <DetailField label="Commission Date" value={formatDate(installation.commissionDate)} />
        <DetailField label="Installation Date" value={formatDate(installation.installationDate)} />
        <DetailField label="Warranty Expiry" value={formatDate(installation.warrantyExpiry)} />
        <DetailField label="Buffer Tank" value={installation.bufferTank} />
        <DetailField label="Buffer Tank Size (L)" value={installation.bufferTankSizeLitres} />
        <DetailField label="Cylinder Manufacturer" value={installation.cylinderManufacturer} />
        <DetailField label="Cylinder Model" value={installation.cylinderModel} />
        <DetailField label="Cylinder Size (L)" value={installation.cylinderSizeLitres} />
        <DetailField label="Year Introduced" value={installation.yearIntroduced} />
        <DetailField label="Firmware Version" value={installation.firmwareVersion} />
      </SectionCard>

      <SectionCard title="Record Metadata" subtitle="Company scope and audit fields.">
        <DetailField label="Company ID" value={installation.companyId} />
        <DetailField label="Customer ID" value={installation.customerId || ''} />
        <DetailField label="Manufacturer Canonical" value={installation.manufacturerCanonical} />
        <DetailField label="Created By" value={installation.createdBy} />
        <DetailField label="Created At" value={installation.createdAt} />
        <DetailField label="Updated By" value={installation.updatedBy} />
        <DetailField label="Updated At" value={installation.updatedAt} />
      </SectionCard>

      <SectionCard title="Notes" subtitle="Engineer notes captured on site.">
        <Text style={styles.notesText}>{installation.notes || 'No notes recorded.'}</Text>
      </SectionCard>

      <SectionCard title="More Workflows" subtitle="Continue into the installation-linked workflows already present in the app.">
        <PrimaryButton
          title="Open Photos"
          onPress={() => {
            router.push(`/installations/${installation.id}/photos` as never);
          }}
          style={styles.actionButton}
        />
        <PrimaryButton
          title="Start Service Visit"
          onPress={() => {
            router.push(`/installations/${installation.id}/service-visit` as never);
          }}
          style={styles.actionButton}
        />
        <PrimaryButton
          title="Open Equipment Passport"
          onPress={() => {
            router.push(`/installations/${installation.id}/equipment-passport` as never);
          }}
        />
      </SectionCard>
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
  actionButton: {
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#b91c1c',
  },
  emptyState: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValue: {
    color: '#0f172a',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  notesText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
  },
});