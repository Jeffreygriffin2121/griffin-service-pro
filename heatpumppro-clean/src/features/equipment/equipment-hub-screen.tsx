import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../../components/app-header';
import { EquipmentCreateForm } from '../../components/equipment/equipment-create-form';
import { EquipmentListCard } from '../../components/equipment/equipment-list-card';
import { FormInput } from '../../components/form-input';
import { PrimaryButton } from '../../components/primary-button';
import { SectionCard } from '../../components/section-card';
import { getManufacturerByName, manufacturers } from '../../data';
import { EquipmentRecord, EquipmentStatus, NewEquipmentRecordInput } from '../../types/equipment';
import { findAddressByEircodeOrPostcode } from '../../services/address-lookup-service';
import { getEquipmentHubRecords } from '../../services/equipment/equipment-hub-service';
import { getInstallationRepository } from '../../services/cloud';

const statusOptions: EquipmentStatus[] = ['Commissioned', 'Active', 'Out of Service', 'Under Warranty'];

const manufacturerOptions = manufacturers.filter((manufacturer) => manufacturer !== 'Other');

const emptyFormState: NewEquipmentRecordInput = {
  customerName: '',
  phone: '',
  email: '',
  eircodePostcode: '',
  propertyAddress: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  indoorUnitSerial: '',
  outdoorUnitSerial: '',
  installationDate: '',
  installer: '',
  warrantyStart: '',
  warrantyExpiry: '',
  status: 'Active',
  engineerNotes: '',
};

export function EquipmentHubScreen() {
  const [equipmentRecords, setEquipmentRecords] = useState<EquipmentRecord[]>(() => getEquipmentHubRecords());
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(equipmentRecords[0]?.id || '');
  const [isAddingEquipment, setIsAddingEquipment] = useState<boolean>(false);
  const [formState, setFormState] = useState<NewEquipmentRecordInput>(emptyFormState);
  const [formError, setFormError] = useState<string>('');
  const [lookupFeedbackText, setLookupFeedbackText] = useState<string>('');
  const [installationSearch, setInstallationSearch] = useState<string>('');
  const [eircodeSearch, setEircodeSearch] = useState<string>('');
  const installationRepository = getInstallationRepository();

  const refreshInstallations = async () => {
    await installationRepository.listInstallations();
    setEquipmentRecords(getEquipmentHubRecords());
  };

  const modelOptions = useMemo(() => {
    if (!formState.manufacturer) {
      return [];
    }
    return getManufacturerByName(formState.manufacturer)?.models.map((model) => model.name) || [];
  }, [formState.manufacturer]);

  const filteredEquipmentRecords = useMemo(() => {
    const installationQuery = installationSearch.trim().toLowerCase();
    const eircodeQuery = eircodeSearch.trim().toLowerCase();

    return equipmentRecords.filter((record) => {
      const matchesInstallation = !installationQuery || [
        record.customer.customerName,
        record.equipment.manufacturer,
        record.equipment.model,
        record.equipment.serialNumber,
      ].some((value) => value.toLowerCase().includes(installationQuery));

      const matchesEircode = !eircodeQuery || record.customer.eircodePostcode.toLowerCase().includes(eircodeQuery);

      return matchesInstallation && matchesEircode;
    });
  }, [eircodeSearch, equipmentRecords, installationSearch]);

  const onOpenInstallation = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    router.push(`/installations/${equipmentId}` as never);
  };

  const onFormFieldChange = (field: keyof NewEquipmentRecordInput, value: string) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
    setFormError('');
    if (field === 'eircodePostcode') {
      setLookupFeedbackText('');
    }
  };

  const onStartAddEquipment = () => {
    setIsAddingEquipment(true);
    setFormError('');
    setLookupFeedbackText('');
  };

  const onCancelAddEquipment = () => {
    setIsAddingEquipment(false);
    setFormState(emptyFormState);
    setFormError('');
    setLookupFeedbackText('');
  };

  const onFindAddress = () => {
    const matchedAddress = findAddressByEircodeOrPostcode(formState.eircodePostcode);
    if (!matchedAddress) {
      setLookupFeedbackText('Address not found - please enter manually.');
      return;
    }

    setFormState((previous) => ({ ...previous, propertyAddress: matchedAddress }));
    setLookupFeedbackText('');
    setFormError('');
  };

  const onSaveEquipment = () => {
    const run = async () => {
    const requiredFields: Array<[keyof NewEquipmentRecordInput, string]> = [
      ['customerName', 'Customer Name'],
      ['phone', 'Phone'],
      ['email', 'Email'],
      ['propertyAddress', 'Property Address'],
      ['manufacturer', 'Manufacturer'],
      ['model', 'Model'],
      ['serialNumber', 'Serial Number'],
      ['indoorUnitSerial', 'Indoor Unit Serial'],
      ['outdoorUnitSerial', 'Outdoor Unit Serial'],
      ['installationDate', 'Installation Date'],
      ['installer', 'Installer'],
      ['warrantyStart', 'Warranty Start'],
      ['warrantyExpiry', 'Warranty Expiry'],
      ['status', 'Status'],
    ];

    const missing = requiredFields.find(([field]) => !`${formState[field]}`.trim());
    if (missing) {
      setFormError(`${missing[1]} is required.`);
      return;
    }

      try {
        const created = await installationRepository.createInstallation({
          companyId: 'company-demo-1',
          customerName: formState.customerName,
          phone: formState.phone,
          email: formState.email,
          address: formState.propertyAddress,
          eircodePostcode: formState.eircodePostcode,
          unitType: 'Heat Pump',
          manufacturer: formState.manufacturer,
          model: formState.model,
          serialNumber: formState.serialNumber,
          installDate: formState.installationDate,
          installerName: formState.installer,
          status: formState.status,
          notes: formState.engineerNotes,
          createdBy: 'engineer-demo-1',
          updatedBy: 'engineer-demo-1',
        });

        await refreshInstallations();
        setSelectedEquipmentId(created.id);
        setFormState(emptyFormState);
        setFormError('');
        setLookupFeedbackText('');
        setIsAddingEquipment(false);
        router.push(`/installations/${created.id}` as never);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to save installation.');
      }
    };

    run();
  };

  React.useEffect(() => {
    refreshInstallations();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Installations"
        subtitle="Primary entry point for customer sites, equipment records, service history, and connected workflows."
      />

      <SectionCard
        title="Installation Workspace"
        subtitle="Installations keeps search, record creation, and module actions connected without changing the underlying service architecture.">
        <Text style={styles.infoText}>Connected now: Fault Finder, Commissioning Wizard, Verified Field Fixes.</Text>
        <Text style={styles.infoText}>Available actions: Service Checklist, AI Diagnostics, Photos, Reports.</Text>
      </SectionCard>

      <SectionCard title="Search Installation" subtitle="Search by customer, manufacturer, model, or serial number.">
        <FormInput
          label="Installation Search"
          value={installationSearch}
          onChangeText={setInstallationSearch}
          placeholder="Search customer, model, or serial"
        />
      </SectionCard>

      <SectionCard title="Search Eircode/Postcode" subtitle="Filter installations by postcode or Eircode.">
        <FormInput
          label="Eircode / Postcode Search"
          value={eircodeSearch}
          onChangeText={setEircodeSearch}
          placeholder="Search Eircode or Postcode"
          autoCapitalize="characters"
        />
      </SectionCard>

      <SectionCard title="New Installation" subtitle="Create a new customer installation record and keep manual address entry available.">
        {!isAddingEquipment ? (
          <PrimaryButton title="New Installation" onPress={onStartAddEquipment} style={styles.addButton} />
        ) : null}

        {isAddingEquipment ? (
          <EquipmentCreateForm
            values={formState}
            manufacturerOptions={manufacturerOptions}
            modelOptions={modelOptions}
            statusOptions={statusOptions}
            errorText={formError}
            lookupFeedbackText={lookupFeedbackText}
            onChange={onFormFieldChange}
            onFindAddress={onFindAddress}
            onSave={onSaveEquipment}
            onCancel={onCancelAddEquipment}
          />
        ) : null}
      </SectionCard>

      <SectionCard title="Recent Installations" subtitle="Open an installation dashboard to review customer, equipment, warranty, and timeline details.">
        <View style={styles.listWrapper}>
          {filteredEquipmentRecords.map((equipment) => (
            <EquipmentListCard
              key={equipment.id}
              equipment={equipment}
              isSelected={equipment.id === selectedEquipmentId}
              onPress={onOpenInstallation}
            />
          ))}
          {!filteredEquipmentRecords.length ? (
            <Text style={styles.emptyState}>No installations match the current search.</Text>
          ) : null}
        </View>
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
  infoText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  addButton: {
    marginBottom: 12,
  },
  listWrapper: {
    marginTop: 2,
  },
  emptyState: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});
