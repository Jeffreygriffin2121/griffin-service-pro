import { getEquipmentHubRecords } from '../../equipment/equipment-hub-service';
import { getCloudDataMode, getCloudFoundationProvider } from '../providers/provider-selector';

export interface MigrationPreview {
  totalInstallations: number;
  totalPhotos: number;
  totalDocuments: number;
  mode: 'local-demo' | 'cloud';
}

// Safe migration scaffold: preview-only by default, no deletion and no automatic transfer.
export const buildLocalMigrationPreview = (): MigrationPreview => {
  const records = getEquipmentHubRecords();

  return {
    totalInstallations: records.length,
    totalPhotos: records.reduce((sum, record) => sum + record.photoLibrary.length, 0),
    totalDocuments: records.reduce((sum, record) => sum + record.documents.length, 0),
    mode: getCloudDataMode(),
  };
};

// Placeholder transfer function for future cloud onboarding.
// Intentionally does not log customer details and does not modify local data.
export const migrateLocalDemoDataToCloud = async (): Promise<MigrationPreview> => {
  const preview = buildLocalMigrationPreview();

  if (preview.mode !== 'cloud') {
    return preview;
  }

  const provider = getCloudFoundationProvider();
  await provider.getSyncStatus();

  return preview;
};
