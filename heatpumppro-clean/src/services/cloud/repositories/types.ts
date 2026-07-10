import { EquipmentAsset, EquipmentRecord } from '../../../types/equipment';
import { CompleteServiceVisitInput } from '../../equipment/equipment-hub-service';

export interface ServiceVisitRecord {
  id: string;
  date: string;
  engineer: string;
  summary: string;
  status: 'Open' | 'Completed';
  checklist: string[];
  measurements: string[];
  photos: string[];
}

export interface InstallationRecord {
  id: string;
  companyId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  eircodePostcode: string;
  unitType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string;
  installerName: string;
  status: string;
  notes: string;
  createdBy: string;
  updatedBy: string;
}

export interface EquipmentPassportResult {
  equipment: EquipmentRecord;
}

export interface AiDiagnosticRecord {
  id: string;
  installationId: string;
  faultCode: string;
  symptoms: string;
  rootCause: string;
  actionsTaken: string;
  confidenceScore: number;
  estimatedRepairTime: string;
  createdAt: string;
}

export interface InstallationRepository {
  listInstallations(): Promise<InstallationRecord[]>;
  getInstallationById(installationId: string): Promise<InstallationRecord | undefined>;
  createInstallation(input: Omit<InstallationRecord, 'id'> & { id?: string }): Promise<InstallationRecord>;
  updateInstallation(
    installationId: string,
    updates: Partial<Omit<InstallationRecord, 'id' | 'companyId'>>,
  ): Promise<InstallationRecord | undefined>;

  startServiceVisit(installationId: string, engineerName?: string): Promise<ServiceVisitRecord | undefined>;
  saveServiceVisitDraft(
    installationId: string,
    serviceVisitId: string,
    updates: Partial<Omit<ServiceVisitRecord, 'id'>>,
  ): Promise<ServiceVisitRecord | undefined>;
  completeServiceVisit(
    installationId: string,
    input: CompleteServiceVisitInput,
  ): Promise<ServiceVisitRecord | undefined>;

  listServiceVisits(installationId: string): Promise<ServiceVisitRecord[]>;

  addPhoto(
    installationId: string,
    photo: Omit<EquipmentAsset, 'id' | 'capturedAt' | 'installationId'> & {
      remoteStoragePath?: string;
      uploadStatus?: 'local' | 'syncing' | 'synced' | 'failed';
      uploadedBy?: string;
    },
  ): Promise<(EquipmentAsset & { remoteStoragePath?: string; uploadStatus?: string; uploadedBy?: string }) | undefined>;
  removePhoto(installationId: string, photoId: string): Promise<boolean>;
  listPhotos(installationId: string, serviceVisitId?: string): Promise<EquipmentAsset[]>;
  setPhotoIncludeInReport(installationId: string, photoId: string, includeInReport: boolean): Promise<boolean>;

  addEngineerNote(installationId: string, note: string): Promise<void>;
  addFaultRecord(installationId: string, faultSummary: string): Promise<void>;
  addVerifiedFix(
    installationId: string,
    input: {
      faultCode: string;
      symptoms: string;
      rootCause: string;
      actionsTaken: string;
      partsReplaced: string[];
      toolsUsed: string[];
      estimatedRepairTime: string;
      diagnosticStepsCompleted: string[];
      safetyWarningsReviewed: string[];
      result?: 'verified-fixed' | 'monitor';
    },
  ): Promise<void>;
  listVerifiedFixes(installationId: string): Promise<EquipmentRecord['verifiedFixWorkflow']>;
  addPartReplacement(installationId: string, partName: string): Promise<void>;
  saveReport(
    installationId: string,
    reportTitle: string,
    reportSummary: string,
    serviceVisitId?: string,
  ): Promise<void>;
  listReports(installationId: string): Promise<EquipmentAsset[]>;

  saveAiDiagnostic(
    installationId: string,
    input: Omit<AiDiagnosticRecord, 'id' | 'installationId' | 'createdAt'>,
  ): Promise<AiDiagnosticRecord>;
  listAiDiagnostics(installationId: string): Promise<AiDiagnosticRecord[]>;

  getEquipmentPassport(installationId: string): Promise<EquipmentPassportResult | undefined>;
}
