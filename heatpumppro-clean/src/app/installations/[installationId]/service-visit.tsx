import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../../components/app-header';
import { FormInput } from '../../../components/form-input';
import { PrimaryButton } from '../../../components/primary-button';
import { SectionCard } from '../../../components/section-card';
import { SyncStatusBadge } from '../../../components/sync-status-badge';
import { getInstallationRepository } from '../../../services/cloud';
import { EquipmentAsset, EquipmentRecord } from '../../../types/equipment';

type ChecklistState = {
  visualInspection: boolean;
  electricalSafety: boolean;
  pressureAndFlow: boolean;
  controlsAndSensors: boolean;
  customerSystemRun: boolean;
};

const steps = [
  'Arrival',
  'Before Photos',
  'Service Checklist',
  'Fault Found?',
  'Repair / Parts Replaced',
  'Commissioning & Performance Tests',
  'Engineer Notes (Private)',
  'Customer Recommendations',
  'Customer Signature',
  'Generate Branded PDF Report',
  'Finish Visit',
] as const;

const checklistLabels: Array<{ key: keyof ChecklistState; label: string }> = [
  { key: 'visualInspection', label: 'Visual inspection complete' },
  { key: 'electricalSafety', label: 'Electrical safety checks complete' },
  { key: 'pressureAndFlow', label: 'Pressure and flow checks complete' },
  { key: 'controlsAndSensors', label: 'Controls and sensors validated' },
  { key: 'customerSystemRun', label: 'System run-through demonstrated to customer' },
];

const parseLines = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function ServiceVisitWorkflowScreen() {
  const { installationId } = useLocalSearchParams<{ installationId?: string }>();
  const [installation, setInstallation] = useState<EquipmentRecord | undefined>(undefined);
  const [currentVisitPhotos, setCurrentVisitPhotos] = useState<EquipmentAsset[]>([]);
  const installationRepository = getInstallationRepository();

  const currentServiceVisitId = installation
    ? installation.serviceVisitSummary.currentVisitId || `${installation.id}-visit-${installation.serviceVisitSummary.visitCount + 1}`
    : '';
  const selectedReportPhotos = currentVisitPhotos.filter((photo) => photo.includeInReport !== false);

  useEffect(() => {
    const load = async () => {
      if (!installationId) {
        setInstallation(undefined);
        setCurrentVisitPhotos([]);
        return;
      }

      const passport = await installationRepository.getEquipmentPassport(installationId);
      setInstallation(passport?.equipment);
    };

    load();
  }, [installationId]);

  useEffect(() => {
    const loadPhotos = async () => {
      if (!installation || !currentServiceVisitId) {
        setCurrentVisitPhotos([]);
        return;
      }

      const photos = await installationRepository.listPhotos(installation.id, currentServiceVisitId);
      setCurrentVisitPhotos(photos);
    };

    loadPhotos();
  }, [installation, currentServiceVisitId]);

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [arrivalDateTime, setArrivalDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [engineer, setEngineer] = useState<string>('');
  const [beforePhotosText, setBeforePhotosText] = useState<string>('');
  const [checklist, setChecklist] = useState<ChecklistState>({
    visualInspection: false,
    electricalSafety: false,
    pressureAndFlow: false,
    controlsAndSensors: false,
    customerSystemRun: false,
  });
  const [faultFound, setFaultFound] = useState<boolean>(false);
  const [faultSummary, setFaultSummary] = useState<string>('');
  const [partsReplacedText, setPartsReplacedText] = useState<string>('');
  const [commissioningAndPerformanceText, setCommissioningAndPerformanceText] = useState<string>('');
  const [privateEngineerNotes, setPrivateEngineerNotes] = useState<string>('');
  const [customerRecommendations, setCustomerRecommendations] = useState<string>('');
  const [customerSignature, setCustomerSignature] = useState<string>('');
  const [signatureAccepted, setSignatureAccepted] = useState<boolean>(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  const checklistCompleted = useMemo(
    () => checklistLabels.filter((item) => checklist[item.key]).map((item) => item.label),
    [checklist],
  );
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);

  if (!installation) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Service Visit" subtitle="The selected installation could not be found." />
        <SectionCard title="Missing Installation" subtitle="Return to Installations and choose a valid installation.">
          <Text style={styles.muted}>No installation context was available for this workflow.</Text>
          <PrimaryButton
            title="Back to Installations"
            onPress={() => {
              router.replace('/installations' as never);
            }}
          />
        </SectionCard>
      </ScrollView>
    );
  }

  const stepTitle = steps[stepIndex];

  const onToggleChecklistItem = (key: keyof ChecklistState) => {
    setChecklist((previous) => ({ ...previous, [key]: !previous[key] }));
    setErrorText('');
  };

  const onPrevious = () => {
    setErrorText('');
    setStepIndex((previous) => Math.max(previous - 1, 0));
  };

  const onNext = () => {
    setErrorText('');
    setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
  };

  const onGenerateReport = () => {
    const photoCount = selectedReportPhotos.length;
    const generatedAt = new Date().toISOString().slice(0, 16);
    const datePart = (arrivalDateTime.includes('T') ? arrivalDateTime.slice(0, 10) : arrivalDateTime) || generatedAt.slice(0, 10);
    const generatedName = `HeatPump Pro Service Visit Report - ${installation.customer.customerName} - ${datePart} - ${photoCount} photo(s)`;
    setReportGeneratedAt(generatedAt);
    setReportName(generatedName);
    setErrorText('');
  };

  const onFinishVisit = async () => {
    if (!arrivalDateTime.trim()) {
      setErrorText('Arrival date/time is required.');
      return;
    }
    if (!engineer.trim()) {
      setErrorText('Engineer name is required.');
      return;
    }

    const beforePhotos = parseLines(beforePhotosText);
    if (!beforePhotos.length && !selectedReportPhotos.length) {
      setErrorText('At least one photo is required from Photo Library or manual URI entry.');
      return;
    }

    const commissioningAndPerformanceTests = parseLines(commissioningAndPerformanceText);
    if (!commissioningAndPerformanceTests.length) {
      setErrorText('Add at least one commissioning or performance test result.');
      return;
    }

    if (faultFound && !faultSummary.trim()) {
      setErrorText('Please describe the fault that was found.');
      return;
    }

    if (!customerRecommendations.trim()) {
      setErrorText('Customer recommendations are required.');
      return;
    }

    if (!customerSignature.trim() || !signatureAccepted) {
      setErrorText('Customer signature name and confirmation are required.');
      return;
    }

    if (!reportGeneratedAt || !reportName) {
      setErrorText('Generate the PDF report before finishing the visit.');
      return;
    }

    const saved = await installationRepository.completeServiceVisit(installation.id, {
      serviceVisitId: currentServiceVisitId,
      arrivalDateTime,
      engineer: engineer.trim(),
      beforePhotos,
      selectedPhotoIds: selectedReportPhotos.map((photo) => photo.id),
      checklistCompleted,
      faultFound,
      faultSummary: faultSummary.trim(),
      partsReplaced: parseLines(partsReplacedText),
      commissioningAndPerformanceTests,
      privateEngineerNotes: privateEngineerNotes.trim(),
      customerRecommendations: customerRecommendations.trim(),
      customerSignature: customerSignature.trim(),
      reportName,
      reportGeneratedAt,
    });

    if (!saved) {
      setErrorText('Unable to complete this service visit. Please try again.');
      return;
    }

    router.replace(`/installations/${installation.id}` as never);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Service Visit Workflow"
        subtitle={`${installation.customer.customerName} - Step ${stepIndex + 1} of ${steps.length}: ${stepTitle}`}
      />
      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <SectionCard title="Visit Progress" subtitle="Follow each step in sequence. You can move back and forward at any time.">
        <Text style={styles.progressPercent}>Progress: {progressPercent}%</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressCurrent}>Current Step: {stepIndex + 1}. {stepTitle}</Text>
        <Text style={styles.progressText}>{steps.map((step, index) => `${index + 1}. ${step}`).join('  |  ')}</Text>
      </SectionCard>

      {stepIndex === 0 ? (
        <SectionCard title="1. Arrival" subtitle="Record when the engineer arrived on site.">
          <FormInput
            label="Arrival Date/Time (YYYY-MM-DDTHH:mm)"
            value={arrivalDateTime}
            onChangeText={setArrivalDateTime}
            placeholder="2026-07-09T09:30"
            autoCapitalize="none"
          />
          <FormInput
            label="Engineer"
            value={engineer}
            onChangeText={setEngineer}
            placeholder="Engineer name"
          />
        </SectionCard>
      ) : null}

      {stepIndex === 1 ? (
        <SectionCard title="2. Before Photos" subtitle="Capture photos in Photo Library (recommended) or add manual URI/path entries.">
          <PrimaryButton
            title="Open Photo Library"
            onPress={() => {
              router.push(`/installations/${installation.id}/photos?serviceVisitId=${currentServiceVisitId}` as never);
            }}
            style={styles.secondaryButton}
          />
          <Text style={styles.summaryLine}>Current Visit Photos: {currentVisitPhotos.length}</Text>
          <Text style={styles.summaryLine}>Selected For Report: {selectedReportPhotos.length}</Text>
          <FormInput
            label="Manual Before Photo URI Entries (Optional)"
            value={beforePhotosText}
            onChangeText={setBeforePhotosText}
            placeholder="camera://before-01\ncamera://before-02"
            multiline
          />
        </SectionCard>
      ) : null}

      {stepIndex === 2 ? (
        <SectionCard title="3. Service Checklist" subtitle="Tick every completed service item.">
          {checklistLabels.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.checkRow, checklist[item.key] && styles.checkRowActive]}
              onPress={() => onToggleChecklistItem(item.key)}>
              <Text style={styles.checkIcon}>{checklist[item.key] ? '✓' : '○'}</Text>
              <Text style={styles.checkText}>{item.label}</Text>
            </Pressable>
          ))}
        </SectionCard>
      ) : null}

      {stepIndex === 3 ? (
        <SectionCard title="4. Fault Found?" subtitle="If a fault is identified, launch Fault Finder and record the summary.">
          <View style={styles.inlineButtons}>
            <PrimaryButton
              title={faultFound ? 'Fault Found: Yes' : 'Fault Found: No'}
              onPress={() => {
                setFaultFound((previous) => !previous);
                setErrorText('');
              }}
            />
          </View>

          {faultFound ? (
            <>
              <PrimaryButton
                title="Launch Fault Finder"
                onPress={() => {
                  router.push('/fault-finder' as never);
                }}
                style={styles.secondaryButton}
              />
              <FormInput
                label="Fault Summary"
                value={faultSummary}
                onChangeText={setFaultSummary}
                placeholder="Describe fault found and action taken"
                multiline
              />
            </>
          ) : null}
        </SectionCard>
      ) : null}

      {stepIndex === 4 ? (
        <SectionCard title="5. Repair / Parts Replaced" subtitle="Enter one repair or replaced part per line.">
          <FormInput
            label="Repair / Parts Replaced"
            value={partsReplacedText}
            onChangeText={setPartsReplacedText}
            placeholder="Flow sensor\nExpansion valve"
            multiline
          />
        </SectionCard>
      ) : null}

      {stepIndex === 5 ? (
        <SectionCard title="6. Commissioning & Performance Tests" subtitle="Record key commissioning checks and performance test outcomes.">
          <FormInput
            label="Commissioning & Performance Tests"
            value={commissioningAndPerformanceText}
            onChangeText={setCommissioningAndPerformanceText}
            placeholder="Flow temperature stability confirmed\nDelta-T within expected range\nDefrost cycle checked"
            multiline
          />
        </SectionCard>
      ) : null}

      {stepIndex === 6 ? (
        <SectionCard title="7. Engineer Notes (Private)" subtitle="Internal notes only for engineering records.">
          <FormInput
            label="Engineer Notes (Private)"
            value={privateEngineerNotes}
            onChangeText={setPrivateEngineerNotes}
            placeholder="Private technical notes"
            multiline
          />
        </SectionCard>
      ) : null}

      {stepIndex === 7 ? (
        <SectionCard title="8. Customer Recommendations" subtitle="Advice and next actions for the customer.">
          <FormInput
            label="Customer Recommendations"
            value={customerRecommendations}
            onChangeText={setCustomerRecommendations}
            placeholder="Recommendations for the customer"
            multiline
          />
        </SectionCard>
      ) : null}

      {stepIndex === 8 ? (
        <SectionCard title="9. Customer Signature" subtitle="Capture customer confirmation before report generation.">
          <FormInput
            label="Customer Signature Name"
            value={customerSignature}
            onChangeText={setCustomerSignature}
            placeholder="Customer full name"
          />
          <Pressable
            style={[styles.checkRow, signatureAccepted && styles.checkRowActive]}
            onPress={() => {
              setSignatureAccepted((previous) => !previous);
              setErrorText('');
            }}>
            <Text style={styles.checkIcon}>{signatureAccepted ? '✓' : '○'}</Text>
            <Text style={styles.checkText}>Customer confirms visit details are accurate.</Text>
          </Pressable>
        </SectionCard>
      ) : null}

      {stepIndex === 9 ? (
        <SectionCard title="10. Generate Branded PDF Report" subtitle="Generate and attach the branded HeatPump Pro service visit report.">
          <PrimaryButton title="Generate Branded PDF Report" onPress={onGenerateReport} />
          <Text style={styles.summaryLine}>Photos Included Automatically: {selectedReportPhotos.length}</Text>
          {reportGeneratedAt ? (
            <View style={styles.generatedWrap}>
              <Text style={styles.generatedText}>Generated: {reportGeneratedAt}</Text>
              <Text style={styles.generatedBrand}>HeatPump Pro - Service Visit Report</Text>
              <Text style={styles.generatedText}>Report: {reportName}</Text>
            </View>
          ) : null}
        </SectionCard>
      ) : null}

      {stepIndex === 10 ? (
        <SectionCard title="11. Finish Visit" subtitle="Finalize visit and update installation service history.">
          <Text style={styles.summaryLine}>Last Service Date: {arrivalDateTime.includes('T') ? arrivalDateTime.slice(0, 10) : arrivalDateTime}</Text>
          <Text style={styles.summaryLine}>Next Service Due: Auto-calculated at completion (+12 months).</Text>
          <Text style={styles.summaryLine}>Engineer: {engineer || 'Not set'}</Text>
          <Text style={styles.summaryLine}>Before Photos: {parseLines(beforePhotosText).length + currentVisitPhotos.length}</Text>
          <Text style={styles.summaryLine}>Report Photo Selection: {selectedReportPhotos.length}</Text>
          <Text style={styles.summaryLine}>Checklist Items Completed: {checklistCompleted.length}</Text>
          <Text style={styles.summaryLine}>Fault Found: {faultFound ? 'Yes' : 'No'}</Text>
          <Text style={styles.summaryLine}>Parts Replaced: {parseLines(partsReplacedText).length}</Text>
          <Text style={styles.summaryLine}>Commissioning & Performance Tests: {parseLines(commissioningAndPerformanceText).length}</Text>
          <Text style={styles.summaryLine}>Report Generated: {reportGeneratedAt ? 'Yes' : 'No'}</Text>

          <PrimaryButton title="Finish Visit" onPress={onFinishVisit} style={styles.finishButton} />
        </SectionCard>
      ) : null}

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <View style={styles.navigationRow}>
        <PrimaryButton title="Previous" onPress={onPrevious} style={styles.navButton} />
        <PrimaryButton title={stepIndex === steps.length - 1 ? 'Review Step' : 'Next'} onPress={onNext} style={styles.navButton} />
      </View>
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
  muted: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 20,
  },
  progressPercent: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressCurrent: {
    color: '#334155',
    fontSize: 13,
    marginBottom: 8,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#dbe7f6',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0f4fb3',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  checkRowActive: {
    borderColor: '#0f4fb3',
    backgroundColor: '#e0ecff',
  },
  checkIcon: {
    color: '#0f4fb3',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 10,
  },
  checkText: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
  inlineButtons: {
    marginBottom: 10,
  },
  secondaryButton: {
    marginBottom: 10,
    backgroundColor: '#1d4ed8',
  },
  generatedWrap: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e0ecff',
  },
  generatedText: {
    color: '#0f172a',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  generatedBrand: {
    color: '#0f4fb3',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLine: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  finishButton: {
    marginTop: 10,
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  navButton: {
    flex: 1,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
});
