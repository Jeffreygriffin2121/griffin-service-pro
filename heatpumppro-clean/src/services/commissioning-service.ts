import { commissioningRequiredFields, commissioningThresholds } from '../data/commissioning';
import {
  CommissioningEvaluation,
  CommissioningFormData,
  CommissioningStatus,
  CommissioningSummary,
} from '../types/commissioning';
import {
  calculateDeltaT,
  calculateEstimatedHeatOutputKw,
  parseNumber,
  roundTo,
} from '../utils/commissioning-calculations';

// Architecture note:
// This service contains all commissioning rules and calculations so screens remain UI-focused.
export const evaluateCommissioning = (formData: CommissioningFormData): CommissioningEvaluation => {
  const flowTemperature = parseNumber(formData.flowTemperature);
  const returnTemperature = parseNumber(formData.returnTemperature);
  const systemPressure = parseNumber(formData.systemPressure);
  const flowRate = parseNumber(formData.flowRate);
  const glycolPercentage = parseNumber(formData.glycolPercentage) ?? 0;

  if (
    flowTemperature === null ||
    returnTemperature === null ||
    systemPressure === null ||
    flowRate === null
  ) {
    return {
      errorMessage:
        'Please enter valid numeric values for flow temperature, return temperature, system pressure, and flow rate.',
      summary: null,
    };
  }

  const deltaT = calculateDeltaT(flowTemperature, returnTemperature);
  const estimatedHeatOutputKw = calculateEstimatedHeatOutputKw(flowRate, deltaT, glycolPercentage);

  const completedCount = commissioningRequiredFields.filter((fieldName) => {
    const value = formData[fieldName as keyof CommissioningFormData];
    return String(value).trim().length > 0;
  }).length;
  const completenessPercentage = roundTo(
    (completedCount / commissioningRequiredFields.length) * 100,
    0,
  );

  const warnings: string[] = [];
  let status: CommissioningStatus = 'Pass';

  if (
    systemPressure < commissioningThresholds.pressure.failLow ||
    systemPressure > commissioningThresholds.pressure.failHigh
  ) {
    status = 'Fail';
    warnings.push('System pressure is in a fail range. Confirm charge, expansion vessel, and valve isolation.');
  } else if (
    systemPressure < commissioningThresholds.pressure.warningLow ||
    systemPressure > commissioningThresholds.pressure.warningHigh
  ) {
    status = 'Warning';
    warnings.push('System pressure is outside the preferred commissioning band.');
  }

  const absoluteDeltaT = Math.abs(deltaT);
  if (
    absoluteDeltaT < commissioningThresholds.deltaT.failLow ||
    absoluteDeltaT > commissioningThresholds.deltaT.failHigh
  ) {
    status = 'Fail';
    warnings.push('Delta T is in a fail range. Validate flow conditions and sensor integrity.');
  } else if (
    absoluteDeltaT < commissioningThresholds.deltaT.warningLow ||
    absoluteDeltaT > commissioningThresholds.deltaT.warningHigh
  ) {
    if (status !== 'Fail') {
      status = 'Warning';
    }
    warnings.push('Delta T is outside the normal operating commissioning band.');
  }

  if (flowRate < commissioningThresholds.flowRate.failLow) {
    status = 'Fail';
    warnings.push('Flow rate is critically low for stable operation.');
  } else if (flowRate < commissioningThresholds.flowRate.warningLow) {
    if (status !== 'Fail') {
      status = 'Warning';
    }
    warnings.push('Flow rate is below preferred commissioning guidance.');
  }

  if (completenessPercentage < 85 && status === 'Pass') {
    status = 'Warning';
  }

  const recommendations = [
    status === 'Fail'
      ? 'Resolve fail conditions before handover and re-run commissioning checks.'
      : 'Confirm settings and operating data against manufacturer commissioning guidance.',
    'Record final controller parameters and weather compensation settings.',
    formData.mode === 'Hot Water'
      ? 'Verify domestic hot water recovery time and cylinder sensor calibration.'
      : 'Verify heating curve response and emitter balance across design load.',
  ];

  const summary: CommissioningSummary = {
    generatedAt: new Date().toLocaleString(),
    systemDetails: [
      { label: 'Customer', value: formData.customerName || 'N/A' },
      { label: 'Site Address', value: formData.siteAddress || 'N/A' },
      { label: 'Manufacturer', value: formData.manufacturer || 'N/A' },
      { label: 'Model', value: formData.model || 'N/A' },
      { label: 'Serial Number', value: formData.serialNumber || 'N/A' },
      { label: 'Mode', value: formData.mode },
    ],
    measurements: [
      { label: 'Outdoor Temperature', value: `${formData.outdoorTemperature || 'N/A'} degC` },
      { label: 'Flow Temperature', value: `${roundTo(flowTemperature, 1)} degC` },
      { label: 'Return Temperature', value: `${roundTo(returnTemperature, 1)} degC` },
      { label: 'System Pressure', value: `${roundTo(systemPressure, 2)} bar` },
      { label: 'Flow Rate', value: `${roundTo(flowRate, 1)} L/min` },
      { label: 'Glycol Percentage', value: `${formData.glycolPercentage || '0'} %` },
    ],
    calculatedResults: {
      deltaT: roundTo(deltaT, 1),
      status,
      estimatedHeatOutputKw: roundTo(estimatedHeatOutputKw, 2),
      completenessPercentage,
    },
    warnings,
    recommendations,
    engineerNotes: formData.engineerNotes || 'No notes provided.',
  };

  return {
    errorMessage: '',
    summary,
  };
};