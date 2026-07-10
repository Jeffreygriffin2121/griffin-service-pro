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
  VerifiedFixEntity,
  WarrantyRecordEntity,
} from '../../../types/cloud-foundation';
import { supabase } from '../supabase-client';
import {
  AuthSession,
  CloudFoundationProvider,
  CreateAccountInput,
  CreateAccountResult,
  SignInInput,
} from './types';

type Metadata = Record<string, unknown>;

const nowIso = () => new Date().toISOString();

const getMetadataValue = (metadata: Metadata, keys: string[], fallback: string): string => {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return fallback;
};

const getRedirectTo = (path?: string): string | undefined => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    if (!path) {
      return window.location.origin;
    }
    return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return undefined;
};

const normalizeAuthSession = (session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>): AuthSession => {
  const metadata: Metadata = (session.user.user_metadata as Metadata | undefined) ?? {};
  const companyId = getMetadataValue(metadata, ['company_id', 'companyId'], session.user.id);
  const engineerId = getMetadataValue(metadata, ['engineer_id', 'engineerId'], session.user.id);

  return {
    userId: session.user.id,
    engineerId,
    companyId,
    email: session.user.email ?? '',
    token: session.access_token,
    expiresAt: session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  };
};

const normalizeFromUser = async (): Promise<AuthSession | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  if (!data.session) {
    return null;
  }
  return normalizeAuthSession(data.session);
};

const ensureCompanyScope = (scope: CompanyScope, session: AuthSession) => {
  if (scope.companyId !== session.companyId) {
    throw new Error('Cross-company access denied for this authenticated account.');
  }
};

const emptyList = async <T,>(_: CompanyScope): Promise<T[]> => [];

const buildCompanyEntity = (session: AuthSession, metadata: Metadata): CompanyEntity => {
  const companyName = getMetadataValue(metadata, ['company_name', 'companyName'], 'Company');
  const slug = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'company';
  const createdAt = nowIso();

  return {
    id: session.companyId,
    companyId: session.companyId,
    createdAt,
    updatedAt: createdAt,
    createdBy: session.engineerId,
    name: companyName,
    slug,
    supportEmail: session.email,
    status: 'active',
  };
};

const buildEngineerEntity = (session: AuthSession, metadata: Metadata): EngineerEntity => {
  const fullName = getMetadataValue(metadata, ['engineer_name', 'engineerName', 'full_name', 'fullName'], 'Engineer');
  const createdAt = nowIso();

  return {
    id: session.engineerId,
    companyId: session.companyId,
    createdAt,
    updatedAt: createdAt,
    createdBy: session.engineerId,
    engineerId: session.engineerId,
    fullName,
    email: session.email,
    role: 'owner',
    status: 'active',
  };
};

const getCurrentMetadata = async (): Promise<{ session: AuthSession; metadata: Metadata } | null> => {
  const currentSession = await normalizeFromUser();
  if (!currentSession) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }

  const metadata: Metadata = (data.user?.user_metadata as Metadata | undefined) ?? {};
  return { session: currentSession, metadata };
};

export const cloudSupabaseProvider: CloudFoundationProvider = {
  mode: 'cloud' as CloudDataMode,
  auth: {
    signIn: async (input: SignInInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email.trim().toLowerCase(),
        password: input.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('Sign in did not return a session. Confirm your email and try again.');
      }

      return normalizeAuthSession(data.session);
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
    createAccount: async (input: CreateAccountInput): Promise<CreateAccountResult> => {
      const trimmedEmail = input.email.trim().toLowerCase();
      const redirectTo = getRedirectTo();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: input.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            company_name: input.companyName.trim(),
            engineer_name: input.engineerName.trim(),
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Sign up completed without a user object.');
      }

      if (!data.session) {
        return {
          session: null,
          needsEmailConfirmation: true,
        };
      }

      return {
        session: normalizeAuthSession(data.session),
        needsEmailConfirmation: false,
      };
    },
    forgotPassword: async (email: string, redirectTo?: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectTo ?? getRedirectTo('/update-password'),
      });

      if (error) {
        console.error('Supabase resetPasswordForEmail failed:', error);
        throw new Error(error.message);
      }
    },
    getCurrentSession: async () => normalizeFromUser(),
    onAuthStateChange: (callback: (event: string) => void) => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        callback(event);
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  },
  company: {
    getCompany: async (scope) => {
      const current = await getCurrentMetadata();
      if (!current) {
        return null;
      }
      ensureCompanyScope(scope, current.session);
      return buildCompanyEntity(current.session, current.metadata);
    },
    getEngineerProfile: async (scope) => {
      const current = await getCurrentMetadata();
      if (!current) {
        return null;
      }
      ensureCompanyScope(scope, current.session);
      return buildEngineerEntity(current.session, current.metadata);
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
  getSyncStatus: async () => {
    const session = await normalizeFromUser();
    return session ? 'Synced' : 'Local';
  },
  retryFailedSync: async () => {
    return;
  },
};