import { defaultProfile, getManufacturerByName } from '../data';
import { BuildDiagnosticReportInput, DiagnosticReport, Manufacturer } from '../types/diagnostics';

// Architecture note:
// This service is the single place for Fault Finder business logic.
// UI screens should only manage state and render outputs.

const normalizeCode = (code: string) => code.trim().toUpperCase();

export const getModelsForManufacturer = (manufacturerName: string): string[] => {
  const manufacturer = getManufacturerByName(manufacturerName);
  return manufacturer ? manufacturer.models.map((model) => model.name) : [];
};

export const getFaultCodesForModel = (manufacturerName: string, modelName: string): string[] => {
  const manufacturer = getManufacturerByName(manufacturerName);
  const model = manufacturer?.models.find((entry) => entry.name === modelName);
  return model?.faultCodes || [];
};

const getFaultData = (manufacturer: Manufacturer | undefined, faultCode: string) => {
  const code = normalizeCode(faultCode);
  return manufacturer?.diagnostics[code];
};

export const createDiagnosticReport = (
  input: BuildDiagnosticReportInput,
): { errorMessage: string; report: null } | { errorMessage: ''; report: DiagnosticReport } => {
  const manufacturerName = input.manufacturer.trim();
  const modelRef = input.model.trim();
  const faultCodeRef = input.faultCode.trim();
  const symptomRef = input.symptom.trim();

  const hasManufacturer = manufacturerName.length > 0;
  const hasFaultCode = faultCodeRef.length > 0;
  const hasSymptom = symptomRef.length > 0;

  if (!hasManufacturer || (!hasFaultCode && !hasSymptom)) {
    return {
      errorMessage: 'Please enter a manufacturer and either a fault code or symptom.',
      report: null,
    };
  }

  const manufacturer = getManufacturerByName(manufacturerName);
  const profile = manufacturer?.profile ?? defaultProfile;
  const normalizedCode = normalizeCode(faultCodeRef);
  const faultData = hasFaultCode ? getFaultData(manufacturer, normalizedCode) : undefined;

  const modelLabel = modelRef || 'Not provided';
  const issueLabel = hasFaultCode ? `Fault ${normalizedCode}` : 'Symptom-driven diagnosis';
  const summaryParts = [
    `${manufacturerName} ${modelLabel !== 'Not provided' ? modelLabel : 'unit'} diagnostic assessment generated for ${issueLabel}.`,
    `Focus area: ${profile.focus}.`,
    faultData?.summary ? `Manufacturer diagnostic: ${faultData.summary}` : '',
    hasSymptom ? `Reported issue: ${symptomRef}.` : 'No symptom narrative provided.',
  ].filter(Boolean);

  return {
    errorMessage: '',
    report: {
      title: `${manufacturerName} Diagnostic Report`,
      summary: summaryParts.join(' '),
      generatedAt: new Date().toLocaleString(),
      likelyCauses: [
        ...(faultData?.likelyCauses || []),
        hasFaultCode
          ? `${normalizedCode} may indicate a protection lockout linked to ${profile.focus}.`
          : 'Intermittent control or sensor drift causing unstable operating conditions.',
        hasSymptom
          ? `Symptom pattern suggests investigation around: ${symptomRef}.`
          : 'No symptom text provided, so start with standard sensor and wiring verification.',
        `Manufacturer-specific trend: ${manufacturerName} systems can show faults when ${profile.focus}.`,
      ],
      safetyChecks: [
        'Isolate electrical supply and confirm safe isolation before opening panels.',
        'Verify refrigerant and water-side pressures are within safe limits before live tests.',
        'Check for overheating, burnt terminals, damaged insulation, and water leaks around electrical modules.',
        'Confirm lockout/tagout and PPE compliance prior to compressor/inverter diagnostics.',
      ],
      diagnosticSteps: [
        ...(faultData?.diagnosticProcedures || []),
        `Confirm controller history for ${hasFaultCode ? `fault ${normalizedCode}` : 'recent alerts'} and clear stale alarms only after documentation.`,
        `Validate operating data for ${manufacturerName}${modelRef ? ` ${modelRef}` : ''}: flow temp, return temp, ambient, and discharge values.`,
        ...(faultData?.expectedMeasurements || []).map(
          (measurement) => `Expected measurement check: ${measurement}.`,
        ),
        'Check sensor resistance/voltage values against expected temperature values at current conditions.',
        'Verify wiring continuity, polarity, and communication integrity between indoor/outdoor boards.',
        'Run a controlled restart and capture startup current, compressor frequency, and fan response.',
      ],
      componentsToTest: [
        ...profile.commonComponents.map((item) => `Inspect/test ${item}.`),
        'Primary and secondary circulation pumps (flow rate, noise, and air ingress).',
        hasFaultCode
          ? `Any components directly referenced by ${normalizedCode} in manufacturer documentation.`
          : 'Compressor contactor/drive and associated protection devices.',
      ],
      toolsRequired: [
        ...profile.preferredTools,
        'Manufacturer technical manual or service fault code matrix',
        'True RMS multimeter and clamp meter',
        'Temperature probes for flow/return and refrigerant line checks',
      ],
      nextActions: [
        ...(faultData?.repairRecommendations || []),
        'Record all readings and compare with commissioning baseline values.',
        'Repair wiring/sensor faults first, then retest before replacing major components.',
        hasFaultCode
          ? `If ${normalizedCode} remains active after checks, escalate to advanced board/compressor diagnostics.`
          : 'If issue persists with no code, perform extended monitoring under heating load.',
        'Update service report with findings, corrective action, and recommended follow-up visit if needed.',
      ],
    },
  };
};
