import {
  getCloudFoundationProvider,
  isCloudModeAvailable,
  listAvailableDataModes,
  setCloudDataModeOverride,
} from '../providers/provider-selector';
import { AuthSession, CreateAccountInput, CreateAccountResult, SignInInput } from '../providers/types';

const provider = () => getCloudFoundationProvider();

export const signIn = async (input: SignInInput): Promise<AuthSession> =>
  provider().auth.signIn(input);

export const signOut = async (): Promise<void> => provider().auth.signOut();

export const createAccount = async (input: CreateAccountInput): Promise<CreateAccountResult> =>
  provider().auth.createAccount(input);

export const forgotPassword = async (email: string, redirectTo?: string): Promise<void> =>
  provider().auth.forgotPassword(email, redirectTo);

export const getCurrentSession = async (): Promise<AuthSession | null> =>
  provider().auth.getCurrentSession();

export const subscribeToAuthStateChanges = (callback: (event: string) => void): (() => void) =>
  provider().auth.onAuthStateChange(callback);

export const getCurrentEngineerProfile = async () => {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }
  return provider().company.getEngineerProfile({
    companyId: session.companyId,
    engineerId: session.engineerId,
  });
};

export const getCurrentCompanyProfile = async () => {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }
  return provider().company.getCompany({
    companyId: session.companyId,
    engineerId: session.engineerId,
  });
};

export const getCurrentDataMode = () => provider().mode;

export const getAvailableDataModes = () => listAvailableDataModes();

export const canUseCloudMode = () => isCloudModeAvailable();

export const setCurrentDataMode = (mode: 'local-demo' | 'cloud'): void => {
  setCloudDataModeOverride(mode);
};

export const getCurrentSyncStatus = async () => provider().getSyncStatus();

export const retryFailedSync = async () => provider().retryFailedSync();
