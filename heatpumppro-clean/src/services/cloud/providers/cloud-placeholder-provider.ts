import {
  CloudFoundationProvider,
  CreateAccountInput,
  CreateAccountResult,
  SignInInput,
} from './types';

const notConfigured = () => {
  throw new Error('Cloud provider is not configured. Set required environment variables to enable cloud mode.');
};

const noSession = async () => null;

const noOp = async () => undefined;

export const cloudPlaceholderProvider: CloudFoundationProvider = {
  mode: 'cloud',
  auth: {
    signIn: async (_: SignInInput) => notConfigured(),
    signOut: noOp,
    createAccount: async (_: CreateAccountInput): Promise<CreateAccountResult> => notConfigured(),
    forgotPassword: noOp,
    getCurrentSession: noSession,
    onAuthStateChange: (_callback: (event: string) => void) => () => undefined,
  },
  company: {
    getCompany: async () => notConfigured(),
    getEngineerProfile: async () => notConfigured(),
  },
  data: {
    listCustomers: async () => notConfigured(),
    listInstallations: async () => notConfigured(),
    listServiceVisits: async () => notConfigured(),
    listMeasurements: async () => notConfigured(),
    listFaultRecords: async () => notConfigured(),
    listVerifiedFixes: async () => notConfigured(),
    listPartReplacements: async () => notConfigured(),
    listEngineerNotes: async () => notConfigured(),
    listPhotos: async () => notConfigured(),
    listDocuments: async () => notConfigured(),
    listReports: async () => notConfigured(),
    getWarranty: async () => notConfigured(),
    listAiDiagnosticRecords: async () => notConfigured(),
  },
  getSyncStatus: async () => 'Failed',
  retryFailedSync: noOp,
};
