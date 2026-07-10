export interface FaultCode {
  code: string;
  summary: string;
  likelyCauses: string[];
  diagnosticProcedures: string[];
  expectedMeasurements: string[];
  repairRecommendations: string[];
}

export interface Model {
  name: string;
  faultCodes: string[];
}

export interface Manufacturer {
  name: string;
  models: Model[];
  diagnostics: Record<string, FaultCode>;
  profile: {
    focus: string;
    commonComponents: string[];
    preferredTools: string[];
  };
}

export interface DiagnosticReport {
  title: string;
  summary: string;
  generatedAt: string;
  likelyCauses: string[];
  safetyChecks: string[];
  diagnosticSteps: string[];
  componentsToTest: string[];
  toolsRequired: string[];
  nextActions: string[];
}

export interface ManufacturerDataFile {
  manufacturer: string;
  models: string[];
  faultCodes: Record<string, string[]>;
  diagnostics: Record<string, string>;
  likelyCauses: Record<string, string[]>;
  diagnosticProcedures: Record<string, string[]>;
  expectedMeasurements: Record<string, string[]>;
  repairRecommendations: Record<string, string[]>;
  profile: {
    focus: string;
    commonComponents: string[];
    preferredTools: string[];
  };
}

export interface BuildDiagnosticReportInput {
  manufacturer: string;
  model: string;
  faultCode: string;
  symptom: string;
}