import { EquipmentAsset, EquipmentRecord } from '../../../types/equipment';
import { CompleteServiceVisitInput } from '../../equipment/equipment-hub-service';

export interface InstallationFormValues {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  siteAddress: string;
  addressLine1: string;
  addressLine2: string;
  townCity: string;
  county: string;
  eircode: string;
  manufacturerEntered: string;
  manufacturer: string;
  modelFamily: string;
  model: string;
  exactModelNumber: string;
  serialNumber: string;
  outdoorModel: string;
  indoorModel: string;
  outdoorSerial: string;
  indoorSerial: string;
  controllerModel: string;
  capacityKw: string;
  electricalPhase: string;
  voltage: string;
  refrigerant: string;
  refrigerantChargeKg: string;
  glycolType: string;
  glycolPercentage: string;
  designFlowTemperature: string;
  maximumFlowTemperature: string;
  bufferTank: string;
  bufferTankSizeLitres: string;
  cylinderManufacturer: string;
  cylinderModel: string;
  cylinderSizeLitres: string;
  installer: string;
  commissionDate: string;
  installationDate: string;
  warrantyExpiry: string;
  systemType: string;
  heatSource: string;
  configurationType: string;
  yearIntroduced: string;
  firmwareVersion: string;
  notes: string;
}

export interface LegacyInstallationValues {
  phone: string;
  email: string;
  address: string;
  eircodePostcode: string;
  heatPumpBrand: string;
  heatPumpModel: string;
  manufacturer: string;
  model: string;
  indoorUnitSerial: string;
  outdoorUnitSerial: string;
  installerName: string;
  installDate: string;
  warrantyStart: string;
  unitType: string;
  status: string;
  engineerNotes: string;
  createdBy: string;
  updatedBy: string;
  serialNumber: string;
}

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

export interface InstallationRecord extends InstallationFormValues, LegacyInstallationValues {
  id: string;
  companyId: string;
  customerId?: string;
  manufacturerCanonical: string;
  createdAt: string;
  updatedAt: string;
}

export type InstallationUpsertInput = Partial<InstallationFormValues> & Partial<LegacyInstallationValues> & {
  id?: string;
  companyId?: string;
  customerId?: string;
  manufacturerCanonical?: string;
};

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
  createInstallation(input: InstallationUpsertInput): Promise<InstallationRecord>;
  updateInstallation(
    installationId: string,
    updates: InstallationUpsertInput,
  ): Promise<InstallationRecord | undefined>;
  deleteInstallation(installationId: string): Promise<boolean>;

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
