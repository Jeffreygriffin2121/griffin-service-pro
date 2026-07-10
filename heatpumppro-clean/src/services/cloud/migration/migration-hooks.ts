import { AuthSession } from '../providers/types';
import {
  MigrationPreview,
  buildLocalMigrationPreview,
  migrateLocalDemoDataToCloud,
} from './local-to-cloud-migration';

export const onAuthSessionReady = async (_session: AuthSession | null): Promise<MigrationPreview> =>
  buildLocalMigrationPreview();

export const onDataModeChanged = async (
  mode: 'local-demo' | 'cloud',
): Promise<MigrationPreview> => {
  if (mode === 'cloud') {
    return migrateLocalDemoDataToCloud();
  }

  return buildLocalMigrationPreview();
};
