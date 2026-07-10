import {
  IntelligenceCauseItem,
  IntelligenceEngineInput,
  IntelligenceMeasurementItem,
  IntelligenceReport,
  IntelligenceReportProvider,
  IntelligenceRepairStep,
  IntelligenceTestItem,
  IntelligenceWorkflowStep,
  SimilarVerifiedFieldFixSummary,
} from '../../types/intelligence';
import { normalizeText } from '../../utils/verified-field-fix-utils';

const parseNumber = (value: string): number | null => {
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const roundTo = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const hasText = (value: string): boolean => normalizeText(value).length > 0;

const splitKeywords = (value: string): string[] =>
  normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const buildSimilaritySummary = (
  input: IntelligenceEngineInput,
  record: IntelligenceEngineInput['previousVerifiedFieldFixes'][number],
): SimilarVerifiedFieldFixSummary => {
  const reasons: string[] = [];
  let score = 0;

  const manufacturerMatch = normalizeText(input.manufacturer) === normalizeText(record.formData.manufacturer);
  const modelMatch = normalizeText(input.model) === normalizeText(record.formData.model);
  const faultCodeMatch = normalizeText(input.faultCode) === normalizeText(record.formData.faultCode);

  if (manufacturerMatch) {
    score += 30;
    reasons.push('Same manufacturer');
  }

  if (modelMatch) {
    score += 25;
    reasons.push('Same model');
  }

  if (faultCodeMatch) {
    score += 25;
    reasons.push('Same fault code');
  }

  const inputKeywords = new Set(
    [
      input.symptoms,
      input.engineerNotes,
      input.faultCode,
      input.manufacturer,
      input.model,
    ]
      .flatMap(splitKeywords)
      .filter(Boolean),
  );

  const recordKeywords = new Set(
    [
      record.formData.symptoms,
      record.formData.rootCause,
      record.formData.diagnosticStepsPerformed,
      record.formData.partsReplaced,
      record.formData.measurements,
      record.formData.engineerNotes,
      record.formData.faultCode,
      record.formData.manufacturer,
      record.formData.model,
    ]
      .flatMap(splitKeywords)
      .filter(Boolean),
  );

  let overlapCount = 0;
  inputKeywords.forEach((keyword) => {
    if (recordKeywords.has(keyword)) {
      overlapCount += 1;
    }
  });

  if (overlapCount > 0) {
    const keywordScore = Math.min(20, overlapCount * 4);
    score += keywordScore;
    reasons.push(`${overlapCount} keyword match${overlapCount === 1 ? '' : 'es'}`);
  }

  if (record.formData.rootCause && normalizeText(record.formData.rootCause).includes(normalizeText(input.faultCode))) {
    score += 5;
    reasons.push('Root cause references the current fault code');
  }

  return {
    id: record.id,
    manufacturer: record.formData.manufacturer,
    model: record.formData.model,
    faultCode: record.formData.faultCode,
    createdAt: record.createdAt,
    similarityScore: Math.max(0, Math.min(100, score)),
    matchReasons: reasons.length ? reasons : ['General operating similarity'],
  };
};

const sortSimilarFixes = (input: IntelligenceEngineInput): SimilarVerifiedFieldFixSummary[] => {
  const uniqueRecords = new Map<string, SimilarVerifiedFieldFixSummary>();

  input.previousVerifiedFieldFixes.forEach((record) => {
    const summary = buildSimilaritySummary(input, record);
    if (summary.similarityScore > 0) {
      uniqueRecords.set(summary.id, summary);
    }
  });

  return [...uniqueRecords.values()].sort(
    (left, right) => right.similarityScore - left.similarityScore || right.createdAt.localeCompare(left.createdAt),
  );
};

const buildFaultAssessment = (
  input: IntelligenceEngineInput,
  flowTemperature: number | null,
  returnTemperature: number | null,
  waterPressure: number | null,
  flowRate: number | null,
  deltaT: number | null,
  similarVerifiedFieldFixes: SimilarVerifiedFieldFixSummary[],
) => {
  const contributingFactors: string[] = [];
  const hypothesisParts: string[] = [];

  if (deltaT !== null) {
    if (deltaT < 3) {
      contributingFactors.push('Delta T is very low, suggesting restricted heat transfer or sensor misreadings.');
      hypothesisParts.push('low temperature split points toward circulation or sensor issues');
    } else if (deltaT > 15) {
      contributingFactors.push('Delta T is high, suggesting poor flow or an underperforming emitter circuit.');
      hypothesisParts.push('high temperature split points toward low flow or load mismatch');
    }
  }

  if (waterPressure !== null) {
    if (waterPressure < 0.8) {
      contributingFactors.push('Water pressure is low for a stable heating circuit.');
      hypothesisParts.push('low circuit pressure may be limiting circulation');
    } else if (waterPressure > 2.5) {
      contributingFactors.push('Water pressure is elevated and should be checked against system fill guidance.');
    }
  }

  if (flowRate !== null && flowRate < 8) {
    contributingFactors.push('Flow rate is below the preferred band for many heat pump systems.');
    hypothesisParts.push('restricted flow may be driving the fault condition');
  }

  if (hasText(input.faultCode)) {
    contributingFactors.push(`Fault code ${input.faultCode.trim().toUpperCase()} indicates a control-derived event rather than a simple comfort complaint.`);
  }

  if (hasText(input.symptoms)) {
    contributingFactors.push(`Operator symptoms: ${input.symptoms.trim()}.`);
  }

  if (similarVerifiedFieldFixes.length > 0) {
    const topMatch = similarVerifiedFieldFixes[0];
    contributingFactors.push(
      `Closest saved fix: ${topMatch.manufacturer} ${topMatch.model} (${topMatch.faultCode || 'no code'}) with ${topMatch.similarityScore}% similarity.`,
    );
    hypothesisParts.push('historical repair patterns point to the same subsystem');
  }

  if (flowTemperature !== null && returnTemperature !== null) {
    if (flowTemperature < returnTemperature) {
      contributingFactors.push('Flow temperature is below return temperature, which is atypical for heating operation.');
    }
  }

  return {
    summary: hypothesisParts.length
      ? `The current evidence suggests ${hypothesisParts.join(', ')}.`
      : 'The available evidence is insufficient for a high-confidence single fault call, so the assessment stays conservative.',
    contributingFactors,
    operatingHypothesis:
      hypothesisParts[0] || 'Investigate the most likely control, flow, and sensor-related causes first.',
  };
};

const buildMostLikelyCauses = (
  input: IntelligenceEngineInput,
  flowTemperature: number | null,
  returnTemperature: number | null,
  waterPressure: number | null,
  flowRate: number | null,
): IntelligenceCauseItem[] => {
  const causes: IntelligenceCauseItem[] = [];
  const deltaT = flowTemperature !== null && returnTemperature !== null ? flowTemperature - returnTemperature : null;

  if (flowRate !== null && flowRate < 8) {
    causes.push({
      cause: 'Restricted or insufficient system flow',
      rationale: 'Low flow rate commonly triggers nuisance faults, poor heat transfer, and lockouts.',
      confidence: 'high',
    });
  }

  if (waterPressure !== null && waterPressure < 0.8) {
    causes.push({
      cause: 'Low water pressure or air ingress',
      rationale: 'Low pressure reduces circulation stability and can cause pump cavitation or sensor anomalies.',
      confidence: 'high',
    });
  }

  if (deltaT !== null && deltaT < 3) {
    causes.push({
      cause: 'Circulation pump underperformance or bypassing',
      rationale: 'A very small temperature split suggests the system is not transferring enough heat across the circuit.',
      confidence: 'medium',
    });
  }

  if (hasText(input.faultCode)) {
    causes.push({
      cause: `Fault code ${input.faultCode.trim().toUpperCase()} triggered by controller or sensor input`,
      rationale: 'The fault code should be validated against manufacturer service data and live readings.',
      confidence: 'medium',
    });
  }

  if (hasText(input.symptoms)) {
    causes.push({
      cause: 'Sensor drift or misreported operating data',
      rationale: 'Symptom descriptions often line up with unstable temperature or pressure readings.',
      confidence: 'medium',
    });
  }

  if (causes.length === 0) {
    causes.push({
      cause: 'Incomplete diagnostic evidence',
      rationale: 'More operating data is needed before narrowing the fault confidently.',
      confidence: 'low',
    });
  }

  return causes.slice(0, 4);
};

const buildRecommendedDiagnosticTests = (
  input: IntelligenceEngineInput,
  flowTemperature: number | null,
  returnTemperature: number | null,
  waterPressure: number | null,
  flowRate: number | null,
): IntelligenceTestItem[] => {
  const tests: IntelligenceTestItem[] = [
    {
      test: 'Verify flow and return sensor readings with calibrated probes',
      reason: 'Confirms whether the controller data matches the actual circuit temperatures.',
      target: 'Flow and return temperatures should track physical probe readings closely.',
    },
    {
      test: 'Inspect pump performance and system flow path',
      reason: 'Low flow is a frequent root cause for heat pump faults and reduced output.',
      target: 'Target stable flow without abnormal noise, cavitation, or bypassing.',
    },
  ];

  if (waterPressure !== null) {
    tests.push({
      test: 'Check system pressure and expansion vessel condition',
      reason: 'Pressure issues can cause intermittent lockouts and poor circulation.',
      target: 'Verify the circuit holds pressure within manufacturer guidance.',
    });
  }

  if (hasText(input.faultCode)) {
    tests.push({
      test: 'Review fault history and controller event log',
      reason: 'Establishes whether the alarm is recurring, transient, or linked to a specific operating state.',
      target: `Confirm the behavior around fault code ${input.faultCode.trim().toUpperCase()}.`,
    });
  }

  if (flowTemperature !== null && returnTemperature !== null) {
    tests.push({
      test: 'Compare live temperature split against operating load',
      reason: 'Validates whether the system is actually moving heat across the circuit.',
      target: `Observe a temperature split of roughly ${roundTo(Math.max(flowTemperature - returnTemperature, 0), 1)} degC under current load.`,
    });
  }

  if (flowRate !== null) {
    tests.push({
      test: 'Measure actual flow rate at the circuit test point',
      reason: 'Confirms whether the installed flow path meets operating requirements.',
      target: 'Stable flow rate within the site-specific design band.',
    });
  }

  return tests.slice(0, 5);
};

const buildExpectedMeasurements = (
  flowTemperature: number | null,
  returnTemperature: number | null,
  outdoorTemperature: number | null,
  waterPressure: number | null,
  flowRate: number | null,
): IntelligenceMeasurementItem[] => {
  const deltaT = flowTemperature !== null && returnTemperature !== null ? flowTemperature - returnTemperature : null;

  return [
    {
      label: 'Flow Temperature',
      value: flowTemperature === null ? 'Not provided' : `${roundTo(flowTemperature, 1)} degC`,
      expectedRange: 'Stable against setpoint and operating mode',
    },
    {
      label: 'Return Temperature',
      value: returnTemperature === null ? 'Not provided' : `${roundTo(returnTemperature, 1)} degC`,
      expectedRange: 'Typically several degrees below flow in heating mode',
    },
    {
      label: 'Outdoor Temperature',
      value: outdoorTemperature === null ? 'Not provided' : `${roundTo(outdoorTemperature, 1)} degC`,
      expectedRange: 'Consistent with local ambient conditions',
    },
    {
      label: 'Water Pressure',
      value: waterPressure === null ? 'Not provided' : `${roundTo(waterPressure, 2)} bar`,
      expectedRange: 'Generally stable within manufacturer guidance',
    },
    {
      label: 'Flow Rate',
      value: flowRate === null ? 'Not provided' : `${roundTo(flowRate, 1)} L/min`,
      expectedRange: 'Stable, continuous, and free from cavitation or air noise',
    },
    {
      label: 'Delta T',
      value: deltaT === null ? 'Not provided' : `${roundTo(deltaT, 1)} degC`,
      expectedRange: 'Within the operating band for the installed system and emitters',
    },
  ];
};

const buildExpectedElectricalValues = (
  supplyVoltage: number | null,
  compressorCurrent: number | null,
  compressorWindingResistance: number | null,
): IntelligenceMeasurementItem[] => [
  {
    label: 'Supply Voltage',
    value: supplyVoltage === null ? 'Not provided' : `${roundTo(supplyVoltage, 1)} V`,
    expectedRange: '207 V to 253 V AC (nominal 230 V +/- 10%)',
  },
  {
    label: 'Compressor Current',
    value: compressorCurrent === null ? 'Not provided' : `${roundTo(compressorCurrent, 2)} A`,
    expectedRange: 'Typically 3 A to 12 A under heating load (model dependent)',
  },
  {
    label: 'Compressor Winding Resistance',
    value: compressorWindingResistance === null ? 'Not provided' : `${roundTo(compressorWindingResistance, 2)} ohm`,
    expectedRange: 'Balanced winding readings, typically 0.6 ohm to 2.5 ohm per winding',
  },
];

const buildCommonReplacementParts = (
  input: IntelligenceEngineInput,
  similarVerifiedFieldFixes: SimilarVerifiedFieldFixSummary[],
): string[] => {
  const parts = new Set<string>([
    'Flow temperature sensor',
    'Return temperature sensor',
    'Circulation pump capacitor',
    'Pressure transducer',
    'Control board fuse set',
  ]);

  if (similarVerifiedFieldFixes.length > 0) {
    similarVerifiedFieldFixes.slice(0, 3).forEach((fix) => {
      const matchingRecord = input.previousVerifiedFieldFixes.find((item) => item.id === fix.id);
      const rawParts = matchingRecord?.formData.partsReplaced || '';
      rawParts
        .split(/[,;\n]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => parts.add(part));
    });
  }

  return [...parts].slice(0, 6);
};

const buildEstimatedRepairTime = (
  confidenceScore: number,
  causeCount: number,
  similarVerifiedFieldFixes: SimilarVerifiedFieldFixSummary[],
): string => {
  const baselineMinutes = 90;
  const confidenceAdjustment = confidenceScore >= 75 ? -20 : confidenceScore < 45 ? 30 : 0;
  const complexityAdjustment = Math.max(0, causeCount - 2) * 20;
  const historyAdjustment = similarVerifiedFieldFixes.length ? -15 : 10;
  const totalMinutes = Math.max(45, baselineMinutes + confidenceAdjustment + complexityAdjustment + historyAdjustment);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) {
    return `${minutes} min`;
  }
  if (!minutes) {
    return `${hours} hr`;
  }
  return `${hours} hr ${minutes} min`;
};

const buildRecommendedTools = (input: IntelligenceEngineInput): string[] => {
  const tools = new Set<string>([
    'True RMS multimeter',
    'Clamp meter',
    'Digital temperature probes',
    'Manufacturer service manual',
  ]);

  if (hasText(input.suctionPressure) || hasText(input.dischargePressure)) {
    tools.add('Refrigerant manifold gauge set');
  }

  if (hasText(input.compressorCurrent) || hasText(input.compressorWindingResistance)) {
    tools.add('Insulation resistance tester (megohmmeter)');
  }

  tools.add('Service valves and flow balancing tools');
  return [...tools].slice(0, 6);
};

const buildRelatedManuals = (input: IntelligenceEngineInput) => {
  const manufacturer = normalizeText(input.manufacturer) || 'generic';
  const model = normalizeText(input.model) || 'all-models';
  const faultCode = normalizeText(input.faultCode) || 'general';

  return [
    {
      title: `${input.manufacturer || 'Heat pump'} service manual`,
      uri: `https://manuals.heatpumppro.local/${manufacturer}/${model}/service-manual.pdf`,
      description: 'Full service procedures, electrical charts, and commissioning checks.',
    },
    {
      title: `${input.manufacturer || 'Heat pump'} fault code reference`,
      uri: `https://manuals.heatpumppro.local/${manufacturer}/${model}/fault-codes/${faultCode}.pdf`,
      description: 'Fault code definitions, root-cause pathways, and reset requirements.',
    },
    {
      title: 'HeatPump Pro safety isolation checklist',
      uri: 'https://manuals.heatpumppro.local/common/safety-isolation-checklist.pdf',
      description: 'Standard lockout, safe isolation, and site-signoff protocol.',
    },
  ];
};

const buildDiagnosticWorkflow = (
  tests: IntelligenceTestItem[],
  repairSteps: IntelligenceRepairStep[],
): IntelligenceWorkflowStep[] => {
  const workflow: IntelligenceWorkflowStep[] = [];

  tests.forEach((test, index) => {
    workflow.push({
      step: `Step ${index + 1}: ${test.test}`,
      outcome: `Target: ${test.target}`,
    });
  });

  repairSteps.forEach((repairStep, index) => {
    workflow.push({
      step: `Corrective ${index + 1}: ${repairStep.step}`,
      outcome: `Priority: ${repairStep.priority}`,
    });
  });

  return workflow.slice(0, 8);
};

const buildRecommendedRepair = (
  input: IntelligenceEngineInput,
  flowRate: number | null,
  waterPressure: number | null,
): IntelligenceRepairStep[] => {
  const steps: IntelligenceRepairStep[] = [];

  if (waterPressure !== null && waterPressure < 0.8) {
    steps.push({
      step: 'Restore and stabilise system pressure, then bleed air from the circuit',
      priority: 'high',
    });
  }

  if (flowRate !== null && flowRate < 8) {
    steps.push({
      step: 'Clear flow restriction and verify pump output across the full circuit',
      priority: 'high',
    });
  }

  if (hasText(input.faultCode) || hasText(input.symptoms)) {
    steps.push({
      step: 'Correct the identified sensor, wiring, or controller issue and reset the fault only after evidence is captured',
      priority: 'medium',
    });
  }

  if (steps.length === 0) {
    steps.push({
      step: 'Collect more live readings before replacing any major component',
      priority: 'medium',
    });
  }

  return steps.slice(0, 4);
};

const buildSafetyWarnings = (input: IntelligenceEngineInput): string[] => {
  const warnings = [
    'Isolate electrical supply and confirm safe isolation before opening panels.',
    'Check for leaks, damaged insulation, burnt terminals, and signs of overheating before live testing.',
    'Use manufacturer approved PPE and follow site lockout/tagout procedures.',
  ];

  if (hasText(input.faultCode)) {
    warnings.push(`Treat fault code ${input.faultCode.trim().toUpperCase()} as live equipment information until validated.`);
  }

  return warnings;
};

const buildNextActions = (
  input: IntelligenceEngineInput,
  similarVerifiedFieldFixes: SimilarVerifiedFieldFixSummary[],
): string[] => {
  const actions = [
    'Capture the missing live readings and compare them with manufacturer service data.',
    'Verify the fault after any correction before closing the job.',
    'Record the final operating state and attach it to the service history.',
  ];

  if (similarVerifiedFieldFixes.length > 0) {
    actions.unshift(
      `Review the top similar field fix: ${similarVerifiedFieldFixes[0].manufacturer} ${similarVerifiedFieldFixes[0].model} (${similarVerifiedFieldFixes[0].faultCode || 'no code'})`,
    );
  }

  if (hasText(input.engineerNotes)) {
    actions.push('Carry forward the engineer notes into the final service record.');
  }

  return actions;
};

export class LocalIntelligenceReportProvider implements IntelligenceReportProvider {
  generateReport(input: IntelligenceEngineInput): IntelligenceReport {
    const flowTemperature = parseNumber(input.flowTemperature);
    const returnTemperature = parseNumber(input.returnTemperature);
    const outdoorTemperature = parseNumber(input.outdoorTemperature);
    const waterPressure = parseNumber(input.waterPressure);
    const flowRate = parseNumber(input.flowRate);
    const supplyVoltage = parseNumber(input.supplyVoltage);
    const compressorCurrent = parseNumber(input.compressorCurrent);
    const compressorWindingResistance = parseNumber(input.compressorWindingResistance);
    const deltaT = flowTemperature !== null && returnTemperature !== null ? flowTemperature - returnTemperature : null;
    const similarVerifiedFieldFixes = sortSimilarFixes(input);

    const completenessScoreParts = [
      input.manufacturer,
      input.model,
      input.serialNumber,
      input.faultCode,
      input.symptoms,
      input.observations,
      input.flowTemperature,
      input.returnTemperature,
      input.outdoorTemperature,
      input.suctionPressure,
      input.dischargePressure,
      input.waterPressure,
      input.flowRate,
      input.supplyVoltage,
      input.compressorCurrent,
      input.compressorWindingResistance,
      input.engineerNotes,
    ].filter((value) => hasText(value));

    const dataQualityScore = roundTo((completenessScoreParts.length / 17) * 45, 0);
    const operatingEvidenceScore =
      (flowTemperature !== null ? 6 : 0) +
      (returnTemperature !== null ? 6 : 0) +
      (outdoorTemperature !== null ? 4 : 0) +
      (waterPressure !== null ? 8 : 0) +
      (flowRate !== null ? 8 : 0) +
      (supplyVoltage !== null ? 4 : 0) +
      (compressorCurrent !== null ? 4 : 0) +
      (compressorWindingResistance !== null ? 4 : 0);
    const historicalMatchScore = similarVerifiedFieldFixes.length
      ? Math.min(20, similarVerifiedFieldFixes[0].similarityScore / 5)
      : 0;
    const faultSignalScore = hasText(input.faultCode) || hasText(input.symptoms) ? 12 : 0;

    const confidenceScore = Math.max(
      0,
      Math.min(100, roundTo(dataQualityScore + operatingEvidenceScore + historicalMatchScore + faultSignalScore, 0)),
    );

    const faultAssessment = buildFaultAssessment(
      input,
      flowTemperature,
      returnTemperature,
      waterPressure,
      flowRate,
      deltaT,
      similarVerifiedFieldFixes,
    );
    const recommendedDiagnosticTests = buildRecommendedDiagnosticTests(
      input,
      flowTemperature,
      returnTemperature,
      waterPressure,
      flowRate,
    );
    const recommendedRepair = buildRecommendedRepair(input, flowRate, waterPressure);
    const diagnosticWorkflow = buildDiagnosticWorkflow(recommendedDiagnosticTests, recommendedRepair);
    const commonReplacementParts = buildCommonReplacementParts(input, similarVerifiedFieldFixes);
    const estimatedRepairTime = buildEstimatedRepairTime(confidenceScore, faultAssessment.contributingFactors.length, similarVerifiedFieldFixes);
    const recommendedTools = buildRecommendedTools(input);
    const relatedManuals = buildRelatedManuals(input);

    return {
      generatedAt: new Date().toLocaleString(),
      equipmentSummary: [
        { label: 'Manufacturer', value: input.manufacturer || 'N/A' },
        { label: 'Model', value: input.model || 'N/A' },
        { label: 'Serial Number', value: input.serialNumber || 'N/A' },
        { label: 'Fault Code', value: input.faultCode || 'N/A' },
        { label: 'Symptoms', value: input.symptoms || 'N/A' },
        { label: 'Observations', value: input.observations || 'N/A' },
        { label: 'Engineer Notes', value: input.engineerNotes || 'N/A' },
      ],
      faultAssessment,
      confidenceScore,
      mostLikelyCauses: buildMostLikelyCauses(input, flowTemperature, returnTemperature, waterPressure, flowRate),
      diagnosticWorkflow,
      recommendedDiagnosticTests,
      expectedMeasurements: buildExpectedMeasurements(
        flowTemperature,
        returnTemperature,
        outdoorTemperature,
        waterPressure,
        flowRate,
      ),
      expectedElectricalValues: buildExpectedElectricalValues(
        supplyVoltage,
        compressorCurrent,
        compressorWindingResistance,
      ),
      commonReplacementParts,
      estimatedRepairTime,
      recommendedTools,
      relatedManuals,
      recommendedRepair,
      safetyWarnings: buildSafetyWarnings(input),
      similarVerifiedFieldFixes: similarVerifiedFieldFixes.slice(0, 5),
      recommendedNextActions: buildNextActions(input, similarVerifiedFieldFixes),
    };
  }
}
