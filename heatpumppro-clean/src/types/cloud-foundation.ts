export type CloudDataMode = 'local-demo' | 'cloud';

export type SyncStatus = 'Local' | 'Syncing' | 'Synced' | 'Failed';

export interface FoundationEntity {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CompanyEntity extends FoundationEntity {
  name: string;
  slug: string;
  supportEmail: string;
  status: 'active' | 'suspended';
}

export interface EngineerEntity extends FoundationEntity {
  engineerId: string;
  fullName: string;
  email: string;
  role: 'owner' | 'manager' | 'engineer';
  status: 'active' | 'inactive';
}

export interface CustomerEntity extends FoundationEntity {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  eircodePostcode: string;
  status: 'active' | 'inactive';
}

export interface InstallationEntity extends FoundationEntity {
  installationId: string;
  customerId: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: 'commissioned' | 'active' | 'out-of-service' | 'under-warranty';
}

export interface ServiceVisitEntity extends FoundationEntity {
  serviceVisitId: string;
  installationId: string;
  engineerId: string;
  startedAt: string;
  completedAt?: string;
  status: 'draft' | 'completed';
}

export interface MeasurementEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  metric: string;
  value: string;
  unit: string;
  status: 'recorded' | 'verified';
}

export interface FaultRecordEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  faultCode: string;
  symptoms: string;
  summary: string;
  status: 'open' | 'resolved';
}

export interface VerifiedFixEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  faultCode: string;
  rootCause: string;
  actionsTaken: string;
  status: 'verified-fixed' | 'monitor';
}

export interface PartReplacementEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  partName: string;
  quantity: number;
  status: 'installed' | 'pending';
}

export interface EngineerNoteEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  note: string;
  privateToEngineers: true;
  status: 'active' | 'archived';
}

export interface PhotoRecordEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  localUri: string;
  remoteStoragePath: string;
  uploadStatus: 'local' | 'syncing' | 'synced' | 'failed';
  caption: string;
  category: 'before' | 'after' | 'equipment' | 'issue' | 'other';
  includeInReport: boolean;
  uploadedBy: string;
}

export interface DocumentRecordEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  title: string;
  localUri: string;
  remoteStoragePath: string;
  status: 'draft' | 'published';
}

export interface ReportRecordEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  reportType: 'service' | 'commissioning' | 'diagnostic' | 'customer';
  uri: string;
  summary: string;
  status: 'draft' | 'final';
}

export interface WarrantyRecordEntity extends FoundationEntity {
  installationId: string;
  warrantyStart: string;
  warrantyExpiry: string;
  provider: string;
  status: 'active' | 'expired';
}

export interface AiDiagnosticRecordEntity extends FoundationEntity {
  installationId: string;
  serviceVisitId?: string;
  confidenceScore: number;
  estimatedRepairTime: string;
  probableCauseSummary: string;
  workflowSummary: string;
  status: 'generated' | 'applied';
}

export interface CompanyScope {
  companyId: string;
  engineerId: string;
}
