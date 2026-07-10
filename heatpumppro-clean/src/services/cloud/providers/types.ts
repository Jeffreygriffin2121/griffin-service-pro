import {
  AiDiagnosticRecordEntity,
  CloudDataMode,
  CompanyEntity,
  CompanyScope,
  CustomerEntity,
  DocumentRecordEntity,
  EngineerEntity,
  EngineerNoteEntity,
  FaultRecordEntity,
  InstallationEntity,
  MeasurementEntity,
  PartReplacementEntity,
  PhotoRecordEntity,
  ReportRecordEntity,
  ServiceVisitEntity,
  SyncStatus,
  VerifiedFixEntity,
  WarrantyRecordEntity,
} from '../../../types/cloud-foundation';

export interface AuthSession {
  userId: string;
  engineerId: string;
  companyId: string;
  email: string;
  token: string;
  expiresAt: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface CreateAccountInput {
  companyName: string;
  engineerName: string;
  email: string;
  password: string;
}

export interface CreateAccountResult {
  session: AuthSession | null;
  needsEmailConfirmation: boolean;
}

export interface CloudAuthProvider {
  signIn(input: SignInInput): Promise<AuthSession>;
  signOut(): Promise<void>;
  createAccount(input: CreateAccountInput): Promise<CreateAccountResult>;
  forgotPassword(email: string, redirectTo?: string): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  onAuthStateChange(callback: (event: string) => void): () => void;
}

export interface CloudCompanyProvider {
  getCompany(scope: CompanyScope): Promise<CompanyEntity | null>;
  getEngineerProfile(scope: CompanyScope): Promise<EngineerEntity | null>;
}

export interface CloudDataProvider {
  listCustomers(scope: CompanyScope): Promise<CustomerEntity[]>;
  listInstallations(scope: CompanyScope): Promise<InstallationEntity[]>;
  listServiceVisits(scope: CompanyScope, installationId: string): Promise<ServiceVisitEntity[]>;
  listMeasurements(scope: CompanyScope, installationId: string): Promise<MeasurementEntity[]>;
  listFaultRecords(scope: CompanyScope, installationId: string): Promise<FaultRecordEntity[]>;
  listVerifiedFixes(scope: CompanyScope, installationId: string): Promise<VerifiedFixEntity[]>;
  listPartReplacements(scope: CompanyScope, installationId: string): Promise<PartReplacementEntity[]>;
  listEngineerNotes(scope: CompanyScope, installationId: string): Promise<EngineerNoteEntity[]>;
  listPhotos(scope: CompanyScope, installationId: string): Promise<PhotoRecordEntity[]>;
  listDocuments(scope: CompanyScope, installationId: string): Promise<DocumentRecordEntity[]>;
  listReports(scope: CompanyScope, installationId: string): Promise<ReportRecordEntity[]>;
  getWarranty(scope: CompanyScope, installationId: string): Promise<WarrantyRecordEntity | null>;
  listAiDiagnosticRecords(scope: CompanyScope, installationId: string): Promise<AiDiagnosticRecordEntity[]>;
}

export interface CloudFoundationProvider {
  mode: CloudDataMode;
  auth: CloudAuthProvider;
  company: CloudCompanyProvider;
  data: CloudDataProvider;
  getSyncStatus(): Promise<SyncStatus>;
  retryFailedSync(): Promise<void>;
}
