import { cloudSupabaseProvider } from './cloud-supabase-provider';
import { localDemoProvider } from './local-demo-provider';
import { CloudFoundationProvider } from './types';

let modeOverride: 'local-demo' | 'cloud' | null = null;

const hasCloudConfiguration = (): boolean => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_CLOUD_API_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const isCloudModeAvailable = (): boolean => hasCloudConfiguration();

export const listAvailableDataModes = (): ('local-demo' | 'cloud')[] =>
  hasCloudConfiguration() ? ['local-demo', 'cloud'] : ['local-demo'];

export const setCloudDataModeOverride = (mode: 'local-demo' | 'cloud' | null): void => {
  if (mode === 'cloud' && !hasCloudConfiguration()) {
    modeOverride = 'local-demo';
    return;
  }

  modeOverride = mode;
};

export const getCloudFoundationProvider = (): CloudFoundationProvider => {
  if (modeOverride === 'cloud' && hasCloudConfiguration()) {
    return cloudSupabaseProvider;
  }

  if (modeOverride === 'local-demo') {
    return localDemoProvider;
  }

  return hasCloudConfiguration() ? cloudSupabaseProvider : localDemoProvider;
};

export const getCloudDataMode = (): 'local-demo' | 'cloud' => getCloudFoundationProvider().mode;
