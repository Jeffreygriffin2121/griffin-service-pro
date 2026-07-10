import {
  addVerifiedFieldFixRecord,
  getVerifiedFieldFixRecords,
  searchVerifiedFieldFixRecords,
} from '../data/verified-field-fixes-store';
import {
  VerifiedFieldFixFormData,
  VerifiedFieldFixRecord,
  VerifiedFieldFixReport,
  VerifiedFieldFixResult,
  VerifiedFieldFixSearchFilters,
} from '../types/verified-field-fixes';
import { buildSearchableText, generateFixId } from '../utils/verified-field-fix-utils';

const buildReport = (formData: VerifiedFieldFixFormData): VerifiedFieldFixReport => {
  const now = new Date().toLocaleString();
  const hasCriticalGap = !formData.rootCause.trim() || !formData.diagnosticStepsPerformed.trim();

  return {
    title: `${formData.manufacturer || 'Unknown'} Verified Field Fix Report`,
    generatedAt: now,
    systemDetails: [
      { label: 'Manufacturer', value: formData.manufacturer || 'N/A' },
      { label: 'Model', value: formData.model || 'N/A' },
      { label: 'Serial Number', value: formData.serialNumber || 'N/A' },
      { label: 'Fault Code', value: formData.faultCode || 'N/A' },
      { label: 'Time Taken', value: formData.timeTaken || 'N/A' },
    ],
    measuredAndObserved: [
      { label: 'Symptoms', value: formData.symptoms || 'N/A' },
      { label: 'Measurements', value: formData.measurements || 'N/A' },
    ],
    diagnosticsAndRepair: [
      { label: 'Root Cause', value: formData.rootCause || 'N/A' },
      { label: 'Diagnostic Steps Performed', value: formData.diagnosticStepsPerformed || 'N/A' },
      { label: 'Parts Replaced', value: formData.partsReplaced || 'N/A' },
    ],
    warnings: hasCriticalGap
      ? ['Root cause or diagnostic steps are incomplete. Record complete evidence before sign-off.']
      : ['No critical documentation gaps identified.'],
    recommendations: [
      'Attach before/after images when photo capture is enabled.',
      'Validate operating conditions after repair and document stable readings.',
      'Sync this record to the cloud ledger once connectivity is available.',
    ],
    engineerNotes: formData.engineerNotes || 'No notes provided.',
  };
};

// Architecture note:
// Service prepares cloud-sync-ready records and keeps UI free of business rules.
export const createVerifiedFieldFixRecord = (
  formData: VerifiedFieldFixFormData,
): VerifiedFieldFixResult => {
  if (!formData.manufacturer.trim() || !formData.model.trim()) {
    return {
      errorMessage: 'Please enter manufacturer and model before saving the record.',
      record: null,
    };
  }

  if (!formData.faultCode.trim() && !formData.symptoms.trim()) {
    return {
      errorMessage: 'Please enter a fault code or symptom details before saving the record.',
      record: null,
    };
  }

  const nowIso = new Date().toISOString();
  const report = buildReport(formData);

  const record: VerifiedFieldFixRecord = {
    id: generateFixId(),
    schemaVersion: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
    syncStatus: 'pending',
    searchableText: buildSearchableText([
      formData.manufacturer,
      formData.model,
      formData.serialNumber,
      formData.faultCode,
      formData.symptoms,
      formData.rootCause,
      formData.diagnosticStepsPerformed,
      formData.partsReplaced,
      formData.measurements,
      formData.timeTaken,
      formData.engineerNotes,
    ]),
    formData,
    report,
  };

  return {
    errorMessage: '',
    record,
  };
};

export const saveVerifiedFieldFixRecord = (record: VerifiedFieldFixRecord): void => {
  addVerifiedFieldFixRecord(record);
};

export const listVerifiedFieldFixRecords = (): VerifiedFieldFixRecord[] =>
  getVerifiedFieldFixRecords();

export const searchVerifiedFieldFixes = (
  filters: VerifiedFieldFixSearchFilters,
): VerifiedFieldFixRecord[] => searchVerifiedFieldFixRecords(filters);
