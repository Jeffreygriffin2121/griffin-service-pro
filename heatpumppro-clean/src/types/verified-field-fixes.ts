export interface VerifiedFixPhoto {
  id: string;
  label: string;
  uri: string;
  capturedAt: string;
}

export interface VerifiedFieldFixFormData {
  manufacturer: string;
  model: string;
  serialNumber: string;
  faultCode: string;
  symptoms: string;
  rootCause: string;
  diagnosticStepsPerformed: string;
  partsReplaced: string;
  measurements: string;
  timeTaken: string;
  engineerNotes: string;
}

export interface VerifiedFieldFixReport {
  title: string;
  generatedAt: string;
  systemDetails: Array<{ label: string; value: string }>;
  measuredAndObserved: Array<{ label: string; value: string }>;
  diagnosticsAndRepair: Array<{ label: string; value: string }>;
  warnings: string[];
  recommendations: string[];
  engineerNotes: string;
}

export interface VerifiedFieldFixRecord {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
  searchableText: string;
  formData: VerifiedFieldFixFormData;
  beforePhotos?: VerifiedFixPhoto[];
  afterPhotos?: VerifiedFixPhoto[];
  report?: VerifiedFieldFixReport;
}

export interface VerifiedFieldFixSearchFilters {
  manufacturer: string;
  model: string;
  faultCode: string;
  keywords: string;
}

export interface VerifiedFieldFixResult {
  errorMessage: string;
  record: VerifiedFieldFixRecord | null;
}
