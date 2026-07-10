import { VerifiedFieldFixRecord } from './verified-field-fixes';

export interface IntelligenceEngineInput {
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
  previousVerifiedFieldFixes: VerifiedFieldFixRecord[];
}

export interface IntelligenceSummaryItem {
  label: string;
  value: string;
}

export interface IntelligenceCauseItem {
  cause: string;
  rationale: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface IntelligenceTestItem {
  test: string;
  reason: string;
  target: string;
}

export interface IntelligenceMeasurementItem {
  label: string;
  value: string;
  expectedRange: string;
}

export interface IntelligenceRepairStep {
  step: string;
  priority: 'high' | 'medium' | 'low';
}

export interface IntelligenceWorkflowStep {
  step: string;
  outcome: string;
}

export interface RelatedManualReference {
  title: string;
  uri: string;
  description: string;
}

export interface FaultDatabaseSearchInput {
  manufacturer: string;
  model: string;
  faultCode: string;
  symptom: string;
  query: string;
}

export interface FaultKnowledgeEntry {
  id: string;
  manufacturer: string;
  model: string;
  faultCode: string;
  summary: string;
  probableCauses: string[];
  diagnosticSteps: string[];
  safetyWarnings: string[];
  replacementParts: string[];
  estimatedRepairTime: string;
  recommendedTools: string[];
  relatedManuals: RelatedManualReference[];
  relevanceScore: number;
  source: 'manufacturer-diagnostics' | 'verified-fix' | 'service-history';
}

export interface SimilarVerifiedFieldFixSummary {
  id: string;
  manufacturer: string;
  model: string;
  faultCode: string;
  createdAt: string;
  similarityScore: number;
  matchReasons: string[];
}

export interface IntelligenceFaultAssessment {
  summary: string;
  contributingFactors: string[];
  operatingHypothesis: string;
}

export interface IntelligenceReport {
  generatedAt: string;
  equipmentSummary: IntelligenceSummaryItem[];
  faultAssessment: IntelligenceFaultAssessment;
  confidenceScore: number;
  mostLikelyCauses: IntelligenceCauseItem[];
  diagnosticWorkflow: IntelligenceWorkflowStep[];
  recommendedDiagnosticTests: IntelligenceTestItem[];
  expectedMeasurements: IntelligenceMeasurementItem[];
  expectedElectricalValues: IntelligenceMeasurementItem[];
  commonReplacementParts: string[];
  estimatedRepairTime: string;
  recommendedTools: string[];
  relatedManuals: RelatedManualReference[];
  recommendedRepair: IntelligenceRepairStep[];
  safetyWarnings: string[];
  similarVerifiedFieldFixes: SimilarVerifiedFieldFixSummary[];
  recommendedNextActions: string[];
}

export interface IntelligenceEngine {
  generateReport(input: IntelligenceEngineInput): Promise<IntelligenceReport>;
}

export interface IntelligenceReportProvider {
  generateReport(input: IntelligenceEngineInput): Promise<IntelligenceReport> | IntelligenceReport;
}

export interface AIDiagnosticKnowledgeProvider {
  searchFaultDatabase(input: FaultDatabaseSearchInput): Promise<FaultKnowledgeEntry[]> | FaultKnowledgeEntry[];
}

export interface AIDiagnosticEngineResult {
  report: IntelligenceReport;
  faultMatches: FaultKnowledgeEntry[];
}
