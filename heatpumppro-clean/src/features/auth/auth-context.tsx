import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { router, usePathname } from 'expo-router';
import {
  canUseCloudMode,
  createAccount as createAccountRequest,
  forgotPassword as forgotPasswordRequest,
  getAvailableDataModes,
  getCurrentCompanyProfile,
  getCurrentDataMode,
  getCurrentEngineerProfile,
  getCurrentSession,
  getCurrentSyncStatus,
  onAuthSessionReady,
  onDataModeChanged,
  retryFailedSync,
  setCurrentDataMode,
  signIn as signInRequest,
  signOut as signOutRequest,
  subscribeToAuthStateChanges,
} from '../../services/cloud';
import { AuthSession, CreateAccountInput, CreateAccountResult, SignInInput } from '../../services/cloud/providers/types';
import { MigrationPreview } from '../../services/cloud/migration/local-to-cloud-migration';
import { CloudDataMode, SyncStatus } from '../../types/cloud-foundation';

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  engineerName: string;
  companyName: string;
  dataMode: CloudDataMode;
  availableDataModes: CloudDataMode[];
  canUseCloud: boolean;
  syncStatus: SyncStatus;
  migrationPreview: MigrationPreview | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  createAccount: (input: CreateAccountInput) => Promise<CreateAccountResult>;
  forgotPassword: (email: string, redirectTo?: string) => Promise<void>;
  setDataMode: (mode: CloudDataMode) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshMigrationPreview: () => Promise<void>;
  retrySync: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [engineerName, setEngineerName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Local');
  const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null);

  const refreshProfile = useCallback(async () => {
    const nextSession = await getCurrentSession();
    setSession(nextSession);
    setMigrationPreview(await onAuthSessionReady(nextSession));

    if (!nextSession) {
      setEngineerName('');
      setCompanyName('');
      setSyncStatus(await getCurrentSyncStatus());
      return;
    }

    const [engineer, company, status] = await Promise.all([
      getCurrentEngineerProfile(),
      getCurrentCompanyProfile(),
      getCurrentSyncStatus(),
    ]);

    setEngineerName(engineer?.fullName || 'Engineer');
    setCompanyName(company?.name || 'Company');
    setSyncStatus(status);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshProfile();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshProfile]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateChanges((event) => {
      if (event === 'PASSWORD_RECOVERY' && pathname !== '/update-password') {
        router.replace('/update-password' as never);
      }
      void refreshProfile();
    });

    return () => {
      unsubscribe();
    };
  }, [pathname, refreshProfile]);

  const signIn = useCallback(async (input: SignInInput) => {
    await signInRequest(input);
    await refreshProfile();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await signOutRequest();
    await refreshProfile();
  }, [refreshProfile]);

  const createAccount = useCallback(async (input: CreateAccountInput): Promise<CreateAccountResult> => {
    const result = await createAccountRequest(input);
    await refreshProfile();
    return result;
  }, [refreshProfile]);

  const forgotPassword = useCallback(async (email: string, redirectTo?: string) => {
    await forgotPasswordRequest(email, redirectTo);
  }, []);

  const setDataMode = useCallback(async (mode: CloudDataMode) => {
    setCurrentDataMode(mode);
    setMigrationPreview(await onDataModeChanged(mode));
    await refreshProfile();
  }, [refreshProfile]);

  const refreshMigrationPreview = useCallback(async () => {
    setMigrationPreview(await onAuthSessionReady(session));
  }, [session]);

  const retrySync = useCallback(async () => {
    await retryFailedSync();
    setSyncStatus(await getCurrentSyncStatus());
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    engineerName,
    companyName,
    dataMode: getCurrentDataMode(),
    availableDataModes: getAvailableDataModes(),
    canUseCloud: canUseCloudMode(),
    syncStatus,
    migrationPreview,
    signIn,
    signOut,
    createAccount,
    forgotPassword,
    setDataMode,
    refreshProfile,
    refreshMigrationPreview,
    retrySync,
  }), [
    companyName,
    engineerName,
    loading,
    refreshProfile,
    refreshMigrationPreview,
    session,
    signIn,
    signOut,
    syncStatus,
    createAccount,
    forgotPassword,
    migrationPreview,
    retrySync,
    setDataMode,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
};
