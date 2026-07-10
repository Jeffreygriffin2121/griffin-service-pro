export type CommissioningMode = 'Heating' | 'Hot Water';

export interface CommissioningFormData {
  customerName: string;
  siteAddress: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  outdoorTemperature: string;
  flowTemperature: string;
  returnTemperature: string;
  systemPressure: string;
  flowRate: string;
  glycolPercentage: string;
  mode: CommissioningMode;
  engineerNotes: string;
}

export type CommissioningStatus = 'Pass' | 'Warning' | 'Fail';

export interface CommissioningCalculatedResults {
  deltaT: number;
  status: CommissioningStatus;
  estimatedHeatOutputKw: number;
  completenessPercentage: number;
}

export interface CommissioningSummary {
  generatedAt: string;
  systemDetails: Array<{ label: string; value: string }>;
  measurements: Array<{ label: string; value: string }>;
  calculatedResults: CommissioningCalculatedResults;
  warnings: string[];
  recommendations: string[];
  engineerNotes: string;
}

export interface CommissioningEvaluation {
  errorMessage: string;
  summary: CommissioningSummary | null;
}