export type EquipmentStatus = 'Commissioned' | 'Active' | 'Out of Service' | 'Under Warranty';

export type EquipmentDashboardCardId =
  | 'equipment-details'
  | 'current-status'
  | 'fault-history'
  | 'verified-field-fixes'
  | 'commissioning-reports'
  | 'service-reports'
  | 'performance-history'
  | 'parts-replaced'
  | 'photo-library'
  | 'documents'
  | 'engineer-notes'
  | 'ai-engineering-recommendations';

export type EquipmentTimelineEventType =
  | 'Installation'
  | 'Commissioning'
  | 'Annual Service'
  | 'Fault'
  | 'Repair'
  | 'Photo'
  | 'Report'
  | 'Engineer Note';

export type QuickActionId =
  | 'fault-finder'
  | 'commissioning-wizard'
  | 'service-checklist'
  | 'verified-field-fix'
  | 'ai-diagnostics'
  | 'capture-photos'
  | 'reports';

export interface EquipmentCustomer {
  customerName: string;
  phone: string;
  email: string;
  eircodePostcode: string;
  propertyAddress: string;
}

export interface EquipmentDetails {
  manufacturer: string;
  model: string;
  serialNumber: string;
  indoorUnitSerial: string;
  outdoorUnitSerial: string;
  installationDate: string;
  installer: string;
  refrigerantType: string;
  refrigerantCharge: string;
  systemCapacity: string;
  warrantyStart: string;
  warrantyExpiry: string;
}

export interface NewEquipmentRecordInput {
  customerName: string;
  phone: string;
  email: string;
  eircodePostcode: string;
  propertyAddress: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  indoorUnitSerial: string;
  outdoorUnitSerial: string;
  installationDate: string;
  installer: string;
  warrantyStart: string;
  warrantyExpiry: string;
  status: EquipmentStatus;
  engineerNotes: string;
}

export interface EquipmentDashboardCard {
  id: EquipmentDashboardCardId;
  title: string;
  value: string;
  subtitle: string;
}

export interface EquipmentTimelineEvent {
  id: string;
  type: EquipmentTimelineEventType;
  title: string;
  date: string;
  summary: string;
}

export interface EquipmentQuickAction {
  id: QuickActionId;
  label: string;
  href: string;
}

export interface EquipmentAsset {
  id: string;
  label: string;
  uri: string;
  capturedAt: string;
  installationId?: string;
  serviceVisitId?: string;
  source?: 'camera' | 'gallery' | 'manual' | 'generated';
  localUri?: string;
  cloudUri?: string;
  includeInReport?: boolean;
  width?: number;
  height?: number;
}

export interface ServiceVisitReportSummary {
  id: string;
  name: string;
  generatedAt: string;
  uri: string;
  serviceVisitId: string;
  includedPhotoIds: string[];
}

export interface ModuleConnection {
  route: string;
  status: 'Connected' | 'Planned';
}

export interface EquipmentModuleLinks {
  faultFinder: ModuleConnection;
  commissioningWizard: ModuleConnection;
  serviceReports: ModuleConnection;
  verifiedFieldFixes: ModuleConnection;
  aiDiagnostics: ModuleConnection;
  photosAndReports: ModuleConnection;
}

export interface FutureCapabilityConfig {
  cloudSync: boolean;
  openAI: boolean;
  photoRecognition: boolean;
  qrCodeScanner: boolean;
  barcodeScanner: boolean;
  pdfExport: boolean;
  emailReports: boolean;
  calendar: boolean;
  offlineStorage: boolean;
  pushNotifications: boolean;
}

export type CatalogueAvailabilityStatus = 'available' | 'limited' | 'legacy' | 'unknown';

export type CatalogueConfigurationType = 'monobloc' | 'split' | 'all-in-one' | 'ground-source' | 'exhaust-air' | 'other' | 'unknown';

export type CatalogueElectricalPhase = 'single-phase' | 'three-phase' | 'unknown';

export interface ManufacturerCatalogueEntry {
  canonicalName: string;
  displayName: string;
  aliases: string[];
  availabilityStatus: CatalogueAvailabilityStatus;
}

export interface ModelFamilyCatalogueEntry {
  manufacturer: string;
  familyName: string;
  aliases: string[];
  availabilityStatus: CatalogueAvailabilityStatus;
  exactModels: HeatPumpModelCatalogueEntry[];
}

export interface HeatPumpModelCatalogueEntry {
  manufacturer: string;
  modelFamily: string;
  exactModel: string;
  capacityKw: number | null;
  refrigerant: string | null;
  configurationType: CatalogueConfigurationType;
  electricalPhase: CatalogueElectricalPhase;
  voltage: string | null;
  maximumFlowTemperature: string | null;
  scop: string | null;
  soundData: string | null;
  yearIntroduced: number | null;
  serviceManualReference: string | null;
  installerManualReference: string | null;
  wiringDiagramReference: string | null;
  sparePartsReference: string | null;
  faultCodeReference: string | null;
  commissioningChecklistReference: string | null;
  firmwareNotes: string | null;
  discontinued: boolean;
  availabilityStatus: CatalogueAvailabilityStatus;
  aliases: string[];
  technicalNotes: string | null;
}

export interface EquipmentSelectorSelection {
  manufacturerEntered: string;
  manufacturer: string;
  modelFamily: string;
  model: string;
  exactModelNumber: string;
  capacityKw: string;
  manualEntry: boolean;
}

export interface InstallationCatalogueSnapshot {
  manufacturer?: ManufacturerCatalogueEntry;
  modelFamily?: ModelFamilyCatalogueEntry;
  model?: HeatPumpModelCatalogueEntry;
}

export interface ServiceVisitSummary {
  currentVisitId: string;
  lastServiceDate: string;
  nextServiceDue: string;
  visitCount: number;
  latestEngineer: string;
  photos: EquipmentAsset[];
  report: EquipmentAsset | null;
  reportPhotos: EquipmentAsset[];
}

export interface VerifiedFixWorkflowRecord {
  id: string;
  createdAt: string;
  engineer: string;
  faultCode: string;
  symptoms: string;
  rootCause: string;
  actionsTaken: string;
  partsReplaced: string[];
  estimatedRepairTime: string;
  toolsUsed: string[];
  safetyWarningsReviewed: string[];
  diagnosticStepsCompleted: string[];
  result: 'verified-fixed' | 'monitor';
}

export interface EquipmentRecord {
  id: string;
  customer: EquipmentCustomer;
  equipment: EquipmentDetails;
  status: EquipmentStatus;
  serviceVisitSummary: ServiceVisitSummary;
  dashboardCards: EquipmentDashboardCard[];
  timeline: EquipmentTimelineEvent[];
  quickActions: EquipmentQuickAction[];
  faultHistory: string[];
  verifiedFieldFixes: string[];
  commissioningReports: string[];
  serviceReports: string[];
  performanceHistory: string[];
  partsReplaced: string[];
  photoLibrary: EquipmentAsset[];
  documents: EquipmentAsset[];
  generatedServiceReports: ServiceVisitReportSummary[];
  verifiedFixWorkflow: VerifiedFixWorkflowRecord[];
  engineerNotes: string[];
  aiEngineeringRecommendations: string[];
  moduleLinks: EquipmentModuleLinks;
  capabilityConfig: FutureCapabilityConfig;
}
