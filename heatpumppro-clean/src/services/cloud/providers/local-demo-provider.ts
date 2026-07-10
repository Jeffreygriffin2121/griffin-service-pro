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
import {
  CloudFoundationProvider,
  CreateAccountInput,
  CreateAccountResult,
  AuthSession,
  SignInInput,
} from './types';

const nowIso = () => new Date().toISOString();

const demoCompanyId = 'company-demo-1';
const demoEngineerId = 'engineer-demo-1';

let currentSession: AuthSession | null = null;
let syncStatus: SyncStatus = 'Local';
const authListeners = new Set<(event: string) => void>();

const emitAuthChanged = (event: string) => {
  authListeners.forEach((listener) => {
    listener(event);
  });
};

let company: CompanyEntity = {
  id: demoCompanyId,
  companyId: demoCompanyId,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  createdBy: demoEngineerId,
  name: 'HeatPump Pro Demo Ltd',
  slug: 'heatpump-pro-demo',
  supportEmail: 'support@heatpumppro.demo',
  status: 'active',
};

let engineer: EngineerEntity = {
  id: demoEngineerId,
  companyId: demoCompanyId,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  createdBy: demoEngineerId,
  engineerId: demoEngineerId,
  fullName: 'Demo Engineer',
  email: 'demo@heatpumppro.local',
  role: 'owner',
  status: 'active',
};

// Local demo provider intentionally returns empty cloud-entity lists.
// Existing workflow data remains in equipment services for local development.
const emptyList = async <T,>(_: CompanyScope): Promise<T[]> => [];

const ensureCompanyScope = (scope: CompanyScope) => {
  if (scope.companyId !== demoCompanyId) {
    throw new Error('Cross-company access denied in local demo mode.');
  }
};

const buildDemoSession = (email: string): AuthSession => ({
  userId: demoEngineerId,
  engineerId: demoEngineerId,
  companyId: demoCompanyId,
  email,
  token: 'local-demo-token',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
});

export const localDemoProvider: CloudFoundationProvider = {
  mode: 'local-demo' as CloudDataMode,
  auth: {
    signIn: async (input: SignInInput) => {
      const expectedEmail = process.env.EXPO_PUBLIC_DEMO_EMAIL || 'demo@heatpumppro.local';
      const expectedPassword = process.env.EXPO_PUBLIC_DEMO_PASSWORD || 'demo1234';

      if (input.email.trim().toLowerCase() !== expectedEmail.toLowerCase() || input.password !== expectedPassword) {
        throw new Error('Invalid demo credentials.');
      }

      currentSession = buildDemoSession(expectedEmail);
      emitAuthChanged('SIGNED_IN');
      return currentSession;
    },
    signOut: async () => {
      currentSession = null;
      emitAuthChanged('SIGNED_OUT');
    },
    createAccount: async (input: CreateAccountInput): Promise<CreateAccountResult> => {
      company = {
        ...company,
        name: input.companyName,
        slug: input.companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        updatedAt: nowIso(),
      };

      engineer = {
        ...engineer,
        fullName: input.engineerName,
        email: input.email,
        updatedAt: nowIso(),
      };

      currentSession = buildDemoSession(input.email);
      emitAuthChanged('SIGNED_IN');
      return {
        session: currentSession,
        needsEmailConfirmation: false,
      };
    },
    forgotPassword: async () => {
      return;
    },
    getCurrentSession: async () => currentSession,
    onAuthStateChange: (callback: (event: string) => void) => {
      authListeners.add(callback);
      return () => {
        authListeners.delete(callback);
      };
    },
  },
  company: {
    getCompany: async (scope) => {
      ensureCompanyScope(scope);
      return company;
    },
    getEngineerProfile: async (scope) => {
      ensureCompanyScope(scope);
      return engineer;
    },
  },
  data: {
    listCustomers: emptyList<CustomerEntity>,
    listInstallations: emptyList<InstallationEntity>,
    listServiceVisits: async () => [] as ServiceVisitEntity[],
    listMeasurements: async () => [] as MeasurementEntity[],
    listFaultRecords: async () => [] as FaultRecordEntity[],
    listVerifiedFixes: async () => [] as VerifiedFixEntity[],
    listPartReplacements: async () => [] as PartReplacementEntity[],
    listEngineerNotes: async () => [] as EngineerNoteEntity[],
    listPhotos: async () => [] as PhotoRecordEntity[],
    listDocuments: async () => [] as DocumentRecordEntity[],
    listReports: async () => [] as ReportRecordEntity[],
    getWarranty: async () => null as WarrantyRecordEntity | null,
    listAiDiagnosticRecords: async () => [] as AiDiagnosticRecordEntity[],
  },
  getSyncStatus: async () => syncStatus,
  retryFailedSync: async () => {
    syncStatus = 'Local';
  },
};
