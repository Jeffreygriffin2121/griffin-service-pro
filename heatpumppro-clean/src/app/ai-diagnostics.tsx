import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { FormSelect } from '../components/form-select';
import { PrimaryButton } from '../components/primary-button';
import { ReportCard } from '../components/report-card';
import { SectionCard } from '../components/section-card';
import { manufacturers } from '../data';
import { getFaultCodesForModel, getModelsForManufacturer } from '../services/fault-finder-service';
import { getInstallationRepository } from '../services/cloud';
import { defaultAIDiagnosticEngine } from '../services/intelligence/ai-diagnostic-engine';
import { listVerifiedFieldFixRecords } from '../services/verified-field-fixes-service';
import { EquipmentRecord } from '../types/equipment';
import { FaultKnowledgeEntry, IntelligenceEngineInput, IntelligenceReport } from '../types/intelligence';

type ConfidenceLevel = 'high' | 'medium' | 'low';

type DiagnosticsFormState = {
  manufacturer: string;
  model: string;
  serialNumber: string;
  faultCode: string;
  symptoms: string;
  observations: string;
  flowTemperature: string;
  returnTemperature: string;
  outdoorTemperature: string;
  suctionPressure: string;
  dischargePressure: string;
  waterPressure: string;
  flowRate: string;
  supplyVoltage: string;
  compressorCurrent: string;
  compressorWindingResistance: string;
  engineerNotes: string;
};

const initialFormState: DiagnosticsFormState = {
  manufacturer: '',
  model: '',
  serialNumber: '',
  faultCode: '',
  symptoms: '',
  observations: '',
  flowTemperature: '',
  returnTemperature: '',
  outdoorTemperature: '',
  suctionPressure: '',
  dischargePressure: '',
  waterPressure: '',
  flowRate: '',
  supplyVoltage: '',
  compressorCurrent: '',
  compressorWindingResistance: '',
  engineerNotes: '',
};

const confidenceWeight: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const getConfidenceTone = (confidence: ConfidenceLevel): { bg: string; text: string } => {
  if (confidence === 'high') {
    return { bg: '#dcfce7', text: '#166534' };
  }
  if (confidence === 'medium') {
    return { bg: '#fef3c7', text: '#92400e' };
  }
  return { bg: '#fee2e2', text: '#991b1b' };
};

const extractFaultCodeFromHistory = (record: EquipmentRecord): string => {
  const latestFault = record.faultHistory[0] || '';
  const match = latestFault.match(/[A-Za-z][A-Za-z0-9.\-]{1,8}/);
  return match ? match[0].toUpperCase() : '';
};

const buildObservationSummary = (record: EquipmentRecord): string => {
  const fragments = [
    `Latest service: ${record.serviceVisitSummary.lastServiceDate || 'not recorded'}`,
    `Visit count: ${record.serviceVisitSummary.visitCount}`,
    `Latest engineer: ${record.serviceVisitSummary.latestEngineer || 'not recorded'}`,
    record.performanceHistory[0] ? `Recent performance note: ${record.performanceHistory[0]}` : '',
  ].filter(Boolean);
  return fragments.join('. ');
};

const applyEquipmentContext = (record: EquipmentRecord): DiagnosticsFormState => ({
  manufacturer: record.equipment.manufacturer,
  model: record.equipment.model,
  serialNumber: record.equipment.serialNumber,
  faultCode: extractFaultCodeFromHistory(record),
  symptoms: record.faultHistory[0] || record.serviceReports[0] || '',
  observations: buildObservationSummary(record),
  flowTemperature: '',
  returnTemperature: '',
  outdoorTemperature: '',
  suctionPressure: '',
  dischargePressure: '',
  waterPressure: '',
  flowRate: '',
  supplyVoltage: '',
  compressorCurrent: '',
  compressorWindingResistance: '',
  engineerNotes: record.engineerNotes[0] || '',
});

const toStepId = (value: string, index: number) => `${index}-${value.slice(0, 36)}`;

const parseCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export default function AiDiagnosticsScreen() {
  const { installationId } = useLocalSearchParams<{ installationId?: string }>();
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const [installations, setInstallations] = useState<EquipmentRecord[]>([]);
  const installationRepository = getInstallationRepository();
  const installationOptions = installations.map((record) => `${record.customer.customerName} - ${record.id}`);
  const installationLabelById = installations.reduce<Record<string, string>>((acc, record) => {
    acc[record.id] = `${record.customer.customerName} - ${record.id}`;
    return acc;
  }, {});
  const installationIdByLabel = installations.reduce<Record<string, string>>((acc, record) => {
    const label = `${record.customer.customerName} - ${record.id}`;
    acc[label] = record.id;
    return acc;
  }, {});

  const initialInstallation =
    (installationId && installations.find((record) => record.id === installationId)) || installations[0] || undefined;

  const [selectedInstallationId, setSelectedInstallationId] = useState<string>(initialInstallation?.id || '');
  const [formState, setFormState] = useState<DiagnosticsFormState>(
    initialInstallation ? applyEquipmentContext(initialInstallation) : initialFormState,
  );
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [faultMatches, setFaultMatches] = useState<FaultKnowledgeEntry[]>([]);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [verifiedFixRootCause, setVerifiedFixRootCause] = useState<string>('');
  const [verifiedFixActions, setVerifiedFixActions] = useState<string>('');
  const [verifiedFixParts, setVerifiedFixParts] = useState<string>('');
  const [verifiedFixTools, setVerifiedFixTools] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSavingFix, setIsSavingFix] = useState<boolean>(false);
  const [isInstallationDropdownOpen, setIsInstallationDropdownOpen] = useState(false);
  const [isManufacturerDropdownOpen, setIsManufacturerDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isFaultCodeDropdownOpen, setIsFaultCodeDropdownOpen] = useState(false);

  useEffect(() => {
    if (!installations.length || selectedInstallationId) {
      return;
    }

    const preferred = (installationId && installations.find((record) => record.id === installationId)) || installations[0];
    if (!preferred) {
      return;
    }

    setSelectedInstallationId(preferred.id);
    setFormState(applyEquipmentContext(preferred));
  }, [installations, installationId, selectedInstallationId]);

  useEffect(() => {
    const loadInstallations = async () => {
      const list = await installationRepository.listInstallations();
      const passports = await Promise.all(
        list.map(async (item) => {
          const passport = await installationRepository.getEquipmentPassport(item.id);
          return passport?.equipment;
        }),
      );
      setInstallations(passports.filter((item): item is EquipmentRecord => Boolean(item)));
    };

    loadInstallations();
  }, []);

  const selectedInstallation = installations.find((record) => record.id === selectedInstallationId);
  const modelOptions = getModelsForManufacturer(formState.manufacturer);
  const faultCodeOptions = getFaultCodesForModel(formState.manufacturer, formState.model);
  const previousVerifiedFieldFixes = useMemo(() => listVerifiedFieldFixRecords(), []);

  const sortedCauses = useMemo(() => {
    if (!report) {
      return [];
    }
    return [...report.mostLikelyCauses].sort(
      (left, right) => confidenceWeight[right.confidence] - confidenceWeight[left.confidence],
    );
  }, [report]);

  const setField = (key: keyof DiagnosticsFormState, value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setReport(null);
    setStatusText('');
  };

  const handleApplyInstallationContext = (record: EquipmentRecord) => {
    setSelectedInstallationId(record.id);
    setFormState(applyEquipmentContext(record));
    setFaultMatches([]);
    setReport(null);
    setCompletedStepIds([]);
    setErrorText('');
    setStatusText('Installation context applied to AI diagnostics input.');
  };

  const validateInput = (): string => {
    if (!formState.manufacturer.trim()) {
      return 'Select or enter a manufacturer before running diagnostics.';
    }
    if (!formState.model.trim()) {
      return 'Select or enter a model before running diagnostics.';
    }
    if (!formState.faultCode.trim() && !formState.symptoms.trim()) {
      return 'Enter a fault code or symptoms before running diagnostics.';
    }
    return '';
  };

  const toEngineInput = (): IntelligenceEngineInput => ({
    ...formState,
    previousVerifiedFieldFixes,
  });

  const toSearchInput = () => ({
    manufacturer: formState.manufacturer,
    model: formState.model,
    faultCode: formState.faultCode,
    symptom: formState.symptoms,
    query: `${formState.symptoms} ${formState.observations}`.trim(),
  });

  const handleSearchFaultDatabase = async () => {
    setIsSearching(true);
    setErrorText('');
    setStatusText('');
    try {
      const matches = await defaultAIDiagnosticEngine.searchFaultDatabase(toSearchInput());
      setFaultMatches(matches);
      setStatusText(`Found ${matches.length} matching fault records.`);
    } catch (error) {
      setErrorText(`Unable to search fault database. ${error instanceof Error ? error.message : 'Unknown error.'}`);
      setFaultMatches([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerate = async () => {
    const validationError = validateInput();
    if (validationError) {
      setErrorText(validationError);
      setReport(null);
      return;
    }

    setIsGenerating(true);
    setErrorText('');
    setStatusText('');

    try {
      const result = await defaultAIDiagnosticEngine.generateDiagnosis(toEngineInput(), toSearchInput());
      setReport(result.report);
      setFaultMatches(result.faultMatches);
      setCompletedStepIds([]);
      setVerifiedFixRootCause(result.report.faultAssessment.operatingHypothesis);
      setVerifiedFixActions(result.report.recommendedRepair.map((item) => item.step).join(', '));
      setVerifiedFixParts(result.report.commonReplacementParts.join(', '));
      setVerifiedFixTools(result.report.recommendedTools.join(', '));
      setStatusText('AI diagnostics generated successfully.');
    } catch (error) {
      setErrorText(`Unable to generate AI diagnostic report. ${error instanceof Error ? error.message : 'Unknown error.'}`);
      setReport(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStep = (stepId: string) => {
    setCompletedStepIds((current) =>
      current.includes(stepId) ? current.filter((value) => value !== stepId) : [...current, stepId],
    );
  };

  const handleSaveVerifiedFix = async () => {
    if (!selectedInstallation || !report) {
      setErrorText('Select an installation and generate diagnostics before saving a verified fix.');
      return;
    }

    setIsSavingFix(true);
    setErrorText('');

    const completedSteps = report.diagnosticWorkflow
      .map((item, index) => ({
        id: toStepId(item.step, index),
        label: item.step,
      }))
      .filter((item) => completedStepIds.includes(item.id))
      .map((item) => item.label);

    await installationRepository.addVerifiedFix(selectedInstallation.id, {
      faultCode: formState.faultCode || 'MANUAL',
      symptoms: formState.symptoms || 'AI diagnostic verified fix',
      rootCause: verifiedFixRootCause.trim(),
      actionsTaken: verifiedFixActions.trim(),
      partsReplaced: parseCsv(verifiedFixParts),
      estimatedRepairTime: report.estimatedRepairTime,
      toolsUsed: parseCsv(verifiedFixTools),
      safetyWarningsReviewed: report.safetyWarnings,
      diagnosticStepsCompleted: completedSteps,
      result: 'verified-fixed',
    });

    await installationRepository.saveAiDiagnostic(selectedInstallation.id, {
      faultCode: formState.faultCode || 'MANUAL',
      symptoms: formState.symptoms,
      rootCause: verifiedFixRootCause.trim(),
      actionsTaken: verifiedFixActions.trim(),
      confidenceScore: report.confidenceScore,
      estimatedRepairTime: report.estimatedRepairTime,
    });

    setStatusText('Verified fix saved and linked to installation Equipment Passport history.');
    setIsSavingFix(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isWide && styles.containerWide]}>
      <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
        <AppHeader
          title="AI Engineering Copilot"
          subtitle="Search fault intelligence and run AI diagnostics using live readings plus existing installation, passport, and service history."
        />

        <SectionCard
          title="Equipment Context"
          subtitle="Reuse Installation and Equipment Passport records as your source of truth.">
          <FormSelect
            label="Installation"
            value={selectedInstallationId ? installationLabelById[selectedInstallationId] : ''}
            placeholder="Select installation"
            options={installationOptions}
            isOpen={isInstallationDropdownOpen}
            onToggleOpen={() => {
              setIsInstallationDropdownOpen((value) => !value);
              setIsManufacturerDropdownOpen(false);
              setIsModelDropdownOpen(false);
              setIsFaultCodeDropdownOpen(false);
            }}
            onSelect={(label) => {
              const nextId = installationIdByLabel[label];
              const record = installations.find((item) => item.id === nextId);
              setIsInstallationDropdownOpen(false);
              if (record) {
                handleApplyInstallationContext(record);
              }
            }}
          />
          <PrimaryButton
            title="Apply Installation Context"
            style={styles.contextButton}
            onPress={() => {
              if (selectedInstallation) {
                handleApplyInstallationContext(selectedInstallation);
              }
            }}
          />

          {selectedInstallation ? (
            <View style={styles.contextMetaWrap}>
              <Text style={styles.contextMeta}>Customer: {selectedInstallation.customer.customerName}</Text>
              <Text style={styles.contextMeta}>Manufacturer: {selectedInstallation.equipment.manufacturer}</Text>
              <Text style={styles.contextMeta}>Model: {selectedInstallation.equipment.model}</Text>
              <Text style={styles.contextMeta}>Visits: {selectedInstallation.serviceVisitSummary.visitCount}</Text>
              <Text style={styles.contextMeta}>Verified Fixes: {selectedInstallation.verifiedFixWorkflow.length}</Text>
            </View>
          ) : null}
        </SectionCard>

        <SectionCard title="Searchable Fault Database" subtitle="Search by manufacturer, model, fault code, and symptom.">
          <View style={styles.gridWrap}>
            <View style={[styles.gridColumn, isWide && styles.gridColumnHalf]}>
              <FormSelect
                label="Manufacturer"
                value={formState.manufacturer}
                placeholder="Select manufacturer"
                options={manufacturers}
                isOpen={isManufacturerDropdownOpen}
                onToggleOpen={() => {
                  setIsManufacturerDropdownOpen((value) => !value);
                  setIsInstallationDropdownOpen(false);
                  setIsModelDropdownOpen(false);
                  setIsFaultCodeDropdownOpen(false);
                }}
                onSelect={(value) => {
                  setField('manufacturer', value);
                  setField('model', '');
                  setField('faultCode', '');
                  setIsManufacturerDropdownOpen(false);
                }}
              />
              <FormSelect
                label="Model"
                value={formState.model}
                placeholder="Select model"
                options={modelOptions}
                isOpen={isModelDropdownOpen}
                onToggleOpen={() => {
                  setIsModelDropdownOpen((value) => !value);
                  setIsInstallationDropdownOpen(false);
                  setIsManufacturerDropdownOpen(false);
                  setIsFaultCodeDropdownOpen(false);
                }}
                onSelect={(value) => {
                  setField('model', value);
                  setIsModelDropdownOpen(false);
                }}
                helperText={formState.manufacturer ? undefined : 'Select a manufacturer first.'}
                disabled={!formState.manufacturer}
              />
              <FormSelect
                label="Fault Code"
                value={formState.faultCode}
                placeholder="Select fault code"
                options={faultCodeOptions}
                isOpen={isFaultCodeDropdownOpen}
                onToggleOpen={() => {
                  setIsFaultCodeDropdownOpen((value) => !value);
                  setIsInstallationDropdownOpen(false);
                  setIsManufacturerDropdownOpen(false);
                  setIsModelDropdownOpen(false);
                }}
                onSelect={(value) => {
                  setField('faultCode', value);
                  setIsFaultCodeDropdownOpen(false);
                }}
                helperText={formState.model ? undefined : 'Select a model first.'}
                disabled={!formState.model}
              />
            </View>

            <View style={[styles.gridColumn, isWide && styles.gridColumnHalf]}>
              <FormInput
                label="Symptoms"
                value={formState.symptoms}
                onChangeText={(value) => setField('symptoms', value)}
                placeholder="Enter symptom keywords"
                multiline
                numberOfLines={3}
              />
              <FormInput
                label="Observations"
                value={formState.observations}
                onChangeText={(value) => setField('observations', value)}
                placeholder="Observed noises, behaviour, and anomalies"
                multiline
                numberOfLines={3}
              />
              <PrimaryButton
                title={isSearching ? 'Searching Fault Database...' : 'Search Fault Database'}
                style={styles.contextButton}
                onPress={handleSearchFaultDatabase}
              />
            </View>
          </View>

          {faultMatches.length ? (
            <View>
              {faultMatches.slice(0, 8).map((entry) => (
                <View key={entry.id} style={styles.matchRow}>
                  <View style={styles.matchHeader}>
                    <Text style={styles.matchTitle}>{entry.manufacturer} {entry.model} - {entry.faultCode || 'No code'}</Text>
                    <Text style={styles.matchScore}>Score {entry.relevanceScore}</Text>
                  </View>
                  <Text style={styles.resultText}>{entry.summary}</Text>
                  <Text style={styles.bulletText}>- Source: {entry.source}</Text>
                  <Text style={styles.bulletText}>- Est. Repair Time: {entry.estimatedRepairTime}</Text>
                  {entry.relatedManuals.slice(0, 2).map((manual) => (
                    <Pressable
                      key={manual.uri}
                      onPress={async () => {
                        await Linking.openURL(manual.uri);
                      }}>
                      <Text style={styles.linkText}>Manual: {manual.title}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>Run a search to list matching manufacturer diagnostics, service history, and verified fixes.</Text>
          )}
        </SectionCard>

        <SectionCard title="AI Diagnostic Inputs" subtitle="Capture pressures, temperatures, electrical values, and engineer notes.">
          <View style={styles.gridWrap}>
            <View style={[styles.gridColumn, isWide && styles.gridColumnHalf]}>
              <FormInput label="Serial Number" value={formState.serialNumber} onChangeText={(value) => setField('serialNumber', value)} placeholder="Enter serial number" />
              <FormInput label="Flow Temperature (degC)" value={formState.flowTemperature} onChangeText={(value) => setField('flowTemperature', value)} placeholder="e.g. 42" keyboardType="decimal-pad" />
              <FormInput label="Return Temperature (degC)" value={formState.returnTemperature} onChangeText={(value) => setField('returnTemperature', value)} placeholder="e.g. 35" keyboardType="decimal-pad" />
              <FormInput label="Outdoor Temperature (degC)" value={formState.outdoorTemperature} onChangeText={(value) => setField('outdoorTemperature', value)} placeholder="e.g. 6" keyboardType="decimal-pad" />
              <FormInput label="Suction Pressure (bar)" value={formState.suctionPressure} onChangeText={(value) => setField('suctionPressure', value)} placeholder="e.g. 7.4" keyboardType="decimal-pad" />
              <FormInput label="Discharge Pressure (bar)" value={formState.dischargePressure} onChangeText={(value) => setField('dischargePressure', value)} placeholder="e.g. 19.2" keyboardType="decimal-pad" />
              <FormInput label="Water Pressure (bar)" value={formState.waterPressure} onChangeText={(value) => setField('waterPressure', value)} placeholder="e.g. 1.4" keyboardType="decimal-pad" />
            </View>
            <View style={[styles.gridColumn, isWide && styles.gridColumnHalf]}>
              <FormInput label="Flow Rate (L/min)" value={formState.flowRate} onChangeText={(value) => setField('flowRate', value)} placeholder="e.g. 11" keyboardType="decimal-pad" />
              <FormInput label="Supply Voltage (V)" value={formState.supplyVoltage} onChangeText={(value) => setField('supplyVoltage', value)} placeholder="e.g. 233" keyboardType="decimal-pad" />
              <FormInput label="Compressor Current (A)" value={formState.compressorCurrent} onChangeText={(value) => setField('compressorCurrent', value)} placeholder="e.g. 6.2" keyboardType="decimal-pad" />
              <FormInput label="Compressor Winding Resistance (ohm)" value={formState.compressorWindingResistance} onChangeText={(value) => setField('compressorWindingResistance', value)} placeholder="e.g. 1.4" keyboardType="decimal-pad" />
              <FormInput label="Engineer Notes" value={formState.engineerNotes} onChangeText={(value) => setField('engineerNotes', value)} placeholder="Private engineer notes" multiline numberOfLines={4} />
            </View>
          </View>

          <PrimaryButton
            title={isGenerating ? 'Generating AI Diagnostics...' : 'Generate AI Diagnostic Report'}
            onPress={handleGenerate}
          />
          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
          {statusText ? <Text style={styles.statusText}>{statusText}</Text> : null}
        </SectionCard>

        {report ? (
          <ReportCard title="AI Diagnostic Report" generatedAt={report.generatedAt}>
            <View style={styles.reportPillRow}>
              <Text style={styles.metaPill}>Confidence: {report.confidenceScore}%</Text>
              <Text style={styles.metaPill}>Estimated Repair: {report.estimatedRepairTime}</Text>
              <Text style={styles.metaPill}>Related Manuals: {report.relatedManuals.length}</Text>
            </View>

            <SectionCard title="Probable Causes (Ranked)">
              {sortedCauses.map((cause, index) => {
                const tone = getConfidenceTone(cause.confidence);
                return (
                  <View key={`${cause.cause}-${index}`} style={styles.causeRow}>
                    <View style={[styles.confidencePill, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.confidenceText, { color: tone.text }]}>
                        #{index + 1} {cause.confidence.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.resultTitle}>{cause.cause}</Text>
                    <Text style={styles.resultText}>{cause.rationale}</Text>
                  </View>
                );
              })}
            </SectionCard>

            <SectionCard title="Interactive Diagnostic Steps">
              {report.diagnosticWorkflow.map((item, index) => {
                const stepId = toStepId(item.step, index);
                const isDone = completedStepIds.includes(stepId);
                return (
                  <Pressable key={stepId} style={[styles.stepRow, isDone && styles.stepRowDone]} onPress={() => toggleStep(stepId)}>
                    <Text style={styles.stepCheck}>{isDone ? 'x' : ' '}</Text>
                    <View style={styles.stepContent}>
                      <Text style={styles.resultTitle}>{item.step}</Text>
                      <Text style={styles.resultText}>{item.outcome}</Text>
                    </View>
                  </Pressable>
                );
              })}
              <Text style={styles.helperText}>Completed steps: {completedStepIds.length} / {report.diagnosticWorkflow.length}</Text>
            </SectionCard>

            <View style={[styles.reportGrid, isWide && styles.reportGridWide]}>
              <View style={[styles.reportGridColumn, isWide && styles.reportGridColumnWide]}>
                <SectionCard title="Expected Electrical Values">
                  {report.expectedElectricalValues.map((item) => (
                    <View key={item.label} style={styles.measurementRow}>
                      <Text style={styles.measurementLabel}>{item.label}</Text>
                      <Text style={styles.measurementValue}>{item.value}</Text>
                      <Text style={styles.resultText}>Expected: {item.expectedRange}</Text>
                    </View>
                  ))}
                </SectionCard>

                <SectionCard title="Related Manuals">
                  {report.relatedManuals.map((manual) => (
                    <Pressable
                      key={manual.uri}
                      style={styles.manualRow}
                      onPress={async () => {
                        await Linking.openURL(manual.uri);
                      }}>
                      <Text style={styles.resultTitle}>{manual.title}</Text>
                      <Text style={styles.resultText}>{manual.description}</Text>
                      <Text style={styles.linkText}>{manual.uri}</Text>
                    </Pressable>
                  ))}
                </SectionCard>
              </View>

              <View style={[styles.reportGridColumn, isWide && styles.reportGridColumnWide]}>
                <SectionCard title="Common Replacement Parts">
                  {report.commonReplacementParts.map((part) => (
                    <Text key={part} style={styles.bulletText}>- {part}</Text>
                  ))}
                </SectionCard>

                <SectionCard title="Recommended Tools">
                  {report.recommendedTools.map((tool) => (
                    <Text key={tool} style={styles.bulletText}>- {tool}</Text>
                  ))}
                </SectionCard>

                <SectionCard title="Safety Warnings">
                  {report.safetyWarnings.map((warning) => (
                    <Text key={warning} style={styles.bulletText}>- {warning}</Text>
                  ))}
                </SectionCard>
              </View>
            </View>

            <SectionCard title="Verified Fix Workflow" subtitle="Store successful repairs directly against the selected installation.">
              <FormInput label="Verified Root Cause" value={verifiedFixRootCause} onChangeText={setVerifiedFixRootCause} placeholder="Root cause confirmed on site" multiline numberOfLines={2} />
              <FormInput label="Actions Taken" value={verifiedFixActions} onChangeText={setVerifiedFixActions} placeholder="Actions completed" multiline numberOfLines={2} />
              <FormInput label="Parts Replaced (comma separated)" value={verifiedFixParts} onChangeText={setVerifiedFixParts} placeholder="Part 1, Part 2" />
              <FormInput label="Tools Used (comma separated)" value={verifiedFixTools} onChangeText={setVerifiedFixTools} placeholder="Tool 1, Tool 2" />
              <PrimaryButton
                title={isSavingFix ? 'Saving Verified Fix...' : 'Save as Verified Fix'}
                onPress={handleSaveVerifiedFix}
              />
            </SectionCard>
          </ReportCard>
        ) : (
          <SectionCard title="Awaiting Diagnostic Run" subtitle="Search and generate diagnostics to activate the AI Copilot workflow.">
            <Text style={styles.emptyText}>
              This engine is cloud-ready by design and currently runs against local manufacturer diagnostics plus installation-linked verified fixes.
            </Text>
          </SectionCard>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#f3f7fb',
  },
  containerWide: {
    paddingHorizontal: 20,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },
  contentWrapWide: {
    maxWidth: 1240,
  },
  contextButton: {
    minHeight: 46,
    marginBottom: 10,
  },
  contextMetaWrap: {
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fbff',
    marginBottom: 8,
  },
  contextMeta: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  helperText: {
    color: '#64748b',
    fontSize: 13,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridColumn: {
    width: '100%',
  },
  gridColumnHalf: {
    width: '49%',
  },
  matchRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  matchTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  matchScore: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    fontWeight: '700',
  },
  statusText: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '700',
  },
  reportPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metaPill: {
    color: '#0f4fb3',
    backgroundColor: '#e0ecff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
    marginBottom: 8,
  },
  causeRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 8,
  },
  confidencePill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '900',
  },
  resultTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  resultText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 8,
  },
  stepRowDone: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  stepCheck: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 6,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#0f172a',
    fontWeight: '800',
    marginRight: 10,
  },
  stepContent: {
    flex: 1,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reportGridWide: {
    justifyContent: 'space-between',
  },
  reportGridColumn: {
    width: '100%',
  },
  reportGridColumnWide: {
    width: '49%',
  },
  measurementRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f8fbff',
  },
  measurementLabel: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  measurementValue: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 2,
  },
  manualRow: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    padding: 10,
    marginBottom: 8,
  },
  linkText: {
    color: '#1d4ed8',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontWeight: '700',
  },
  bulletText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
  },
});
