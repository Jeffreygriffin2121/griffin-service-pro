import { equipmentRecords } from '../../data/equipment-records';
import { getManufacturerByName } from '../../data';
import {
  EquipmentDashboardCard,
  EquipmentAsset,
  EquipmentQuickAction,
  EquipmentRecord,
  EquipmentStatus,
  EquipmentTimelineEvent,
  NewEquipmentRecordInput,
} from '../../types/equipment';

// Business logic for installation records stays in service functions to keep UI focused on rendering.
let inMemoryEquipmentRecords: EquipmentRecord[] = [...equipmentRecords];

export interface CompleteServiceVisitInput {
  serviceVisitId: string;
  arrivalDateTime: string;
  engineer: string;
  beforePhotos: string[];
  selectedPhotoIds: string[];
  checklistCompleted: string[];
  faultFound: boolean;
  faultSummary: string;
  partsReplaced: string[];
  commissioningAndPerformanceTests: string[];
  privateEngineerNotes: string;
  customerRecommendations: string;
  customerSignature: string;
  reportName: string;
  reportGeneratedAt: string;
}

export interface UploadInstallationPhotoInput {
  equipmentId: string;
  serviceVisitId: string;
  localUri: string;
  source: 'camera' | 'gallery';
  capturedAt?: string;
  includeInReport?: boolean;
  width?: number;
  height?: number;
}

export interface SaveInstallationVerifiedFixInput {
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

const fallbackQuickActions: EquipmentQuickAction[] = [
  { id: 'fault-finder', label: 'Fault Finder', href: '/fault-finder' },
  { id: 'commissioning-wizard', label: 'Commissioning Wizard', href: '/commissioning-wizard' },
  { id: 'service-checklist', label: 'Service Checklist', href: '/service-checklist' },
  { id: 'verified-field-fix', label: 'Verified Field Fixes', href: '/verified-field-fixes' },
  { id: 'ai-diagnostics', label: 'AI Diagnostics', href: '/ai-diagnostics' },
  { id: 'capture-photos', label: 'Photos', href: '/photos' },
  { id: 'reports', label: 'Reports', href: '/reports' },
];

const defaultQuickActions = equipmentRecords[0]?.quickActions || fallbackQuickActions;
const defaultModuleLinks = equipmentRecords[0]?.moduleLinks;
const defaultCapabilityConfig = equipmentRecords[0]?.capabilityConfig;

const buildDashboardCards = (record: EquipmentRecord): EquipmentDashboardCard[] => [
  {
    id: 'equipment-details',
    title: 'Equipment Details',
    value: `${record.equipment.manufacturer} ${record.equipment.model}`,
    subtitle: record.equipment.serialNumber,
  },
  {
    id: 'current-status',
    title: 'Current Status',
    value: record.status,
    subtitle: `Warranty expiry ${record.equipment.warrantyExpiry}`,
  },
  { id: 'fault-history', title: 'Fault History', value: `${record.faultHistory.length}`, subtitle: 'Logged events' },
  {
    id: 'verified-field-fixes',
    title: 'Verified Field Fixes',
    value: `${record.verifiedFieldFixes.length}`,
    subtitle: 'Fix records',
  },
  {
    id: 'commissioning-reports',
    title: 'Commissioning Reports',
    value: `${record.commissioningReports.length}`,
    subtitle: 'Reports attached',
  },
  { id: 'service-reports', title: 'Service Reports', value: `${record.serviceReports.length}`, subtitle: 'Reports attached' },
  {
    id: 'performance-history',
    title: 'Performance History',
    value: `${record.performanceHistory.length}`,
    subtitle: 'Baseline checks',
  },
  { id: 'parts-replaced', title: 'Parts Replaced', value: `${record.partsReplaced.length}`, subtitle: 'Lifecycle tracking' },
  { id: 'photo-library', title: 'Photo Library', value: `${record.photoLibrary.length}`, subtitle: 'Captured assets' },
  { id: 'documents', title: 'Documents', value: `${record.documents.length}`, subtitle: 'Files available' },
  { id: 'engineer-notes', title: 'Engineer Notes', value: `${record.engineerNotes.length}`, subtitle: 'Notes saved' },
  {
    id: 'ai-engineering-recommendations',
    title: 'AI Engineering Recommendations',
    value: `${record.aiEngineeringRecommendations.length}`,
    subtitle: 'Guidance entries',
  },
];

const buildTimeline = (record: EquipmentRecord): EquipmentTimelineEvent[] => [
  {
    id: `${record.id}-install`,
    type: 'Installation',
    title: 'Installation complete',
    date: record.equipment.installationDate,
    summary: `${record.equipment.installer} installed ${record.equipment.manufacturer} ${record.equipment.model}.`,
  },
  {
    id: `${record.id}-commissioning`,
    type: 'Commissioning',
    title: 'Commissioning pending',
    date: record.equipment.installationDate,
    summary: 'Ready for commissioning workflow and report handover.',
  },
  {
    id: `${record.id}-service`,
    type: 'Annual Service',
    title: record.serviceVisitSummary.visitCount ? 'Service visit completed' : 'Service schedule pending',
    date: record.serviceVisitSummary.lastServiceDate || record.equipment.installationDate,
    summary: record.serviceVisitSummary.visitCount
      ? `${record.serviceVisitSummary.latestEngineer} completed ${record.serviceVisitSummary.visitCount} visit(s). Next due ${record.serviceVisitSummary.nextServiceDue}.`
      : 'Annual service record will appear after first service report.',
  },
  {
    id: `${record.id}-note`,
    type: 'Engineer Note',
    title: 'Engineer note recorded',
    date: record.equipment.installationDate,
    summary: record.engineerNotes[0] || 'No engineer note provided.',
  },
];

const withDerivedViews = (record: EquipmentRecord): EquipmentRecord => ({
  ...record,
  dashboardCards: buildDashboardCards(record),
  timeline: buildTimeline(record),
  quickActions: [...defaultQuickActions],
});

const toDatePart = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return new Date().toISOString().slice(0, 10);
  }
  return trimmed.includes('T') ? trimmed.slice(0, 10) : trimmed;
};

const addMonths = (datePart: string, months: number): string => {
  const parsed = new Date(`${datePart}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return datePart;
  }
  parsed.setUTCMonth(parsed.getUTCMonth() + months);
  return parsed.toISOString().slice(0, 10);
};

const nextServiceVisitId = (equipmentId: string, existingVisitCount: number): string =>
  `${equipmentId}-visit-${existingVisitCount + 1}`;

const createCloudPhotoUri = (equipmentId: string, serviceVisitId: string, source: 'camera' | 'gallery', localUri: string): string => {
  const localName = localUri.split('/').filter(Boolean).pop()?.replace(/[^a-zA-Z0-9_.-]/g, '-') || `photo-${Date.now()}.jpg`;
  return `https://cloud.heatpumppro.local/installations/${equipmentId}/${serviceVisitId}/${source}-${Date.now()}-${localName}`;
};

const createCloudPdfUri = (equipmentId: string, serviceVisitId: string): string =>
  `https://cloud.heatpumppro.local/installations/${equipmentId}/${serviceVisitId}/service-report-${Date.now()}.pdf`;

const createVisitPhotoAssets = (equipmentId: string, serviceDate: string, photos: string[], visitCount: number): EquipmentAsset[] =>
  photos.map((photo, index) => ({
    id: `${equipmentId}-visit-${visitCount}-photo-${index + 1}`,
    label: `Before Photo ${index + 1}`,
    uri: photo,
    capturedAt: serviceDate,
  }));

export const getEquipmentHubRecords = (): EquipmentRecord[] => inMemoryEquipmentRecords;

export const getEquipmentRecordById = (equipmentId: string): EquipmentRecord | undefined =>
  inMemoryEquipmentRecords.find((record) => record.id === equipmentId);

export const getEquipmentDashboardCards = (equipmentId: string): EquipmentDashboardCard[] =>
  getEquipmentRecordById(equipmentId)?.dashboardCards || [];

export const getEquipmentTimeline = (equipmentId: string): EquipmentTimelineEvent[] =>
  getEquipmentRecordById(equipmentId)?.timeline || [];

export const getEquipmentQuickActions = (equipmentId: string): EquipmentQuickAction[] =>
  getEquipmentRecordById(equipmentId)?.quickActions || [];

export const getCurrentServiceVisitId = (equipmentId: string): string => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return `${equipmentId}-visit-1`;
  }
  return existing.serviceVisitSummary.currentVisitId || nextServiceVisitId(equipmentId, existing.serviceVisitSummary.visitCount);
};

export const getInstallationPhotoLibrary = (equipmentId: string, serviceVisitId?: string): EquipmentAsset[] => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return [];
  }
  if (!serviceVisitId) {
    return existing.photoLibrary;
  }
  return existing.photoLibrary.filter((asset) => asset.serviceVisitId === serviceVisitId);
};

export const getInstallationVerifiedFixWorkflow = (equipmentId: string) => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return [];
  }
  return existing.verifiedFixWorkflow;
};

export const saveInstallationVerifiedFixWorkflow = (
  equipmentId: string,
  input: SaveInstallationVerifiedFixInput,
) => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return undefined;
  }

  const createdAt = new Date().toISOString();
  const entry = {
    id: `${equipmentId}-verified-fix-${Date.now()}`,
    createdAt,
    engineer: input.engineer,
    faultCode: input.faultCode,
    symptoms: input.symptoms,
    rootCause: input.rootCause,
    actionsTaken: input.actionsTaken,
    partsReplaced: input.partsReplaced,
    estimatedRepairTime: input.estimatedRepairTime,
    toolsUsed: input.toolsUsed,
    safetyWarningsReviewed: input.safetyWarningsReviewed,
    diagnosticStepsCompleted: input.diagnosticStepsCompleted,
    result: input.result,
  };

  const verifiedFixSummary = [
    `${entry.faultCode || 'No fault code'}: ${entry.rootCause || 'Root cause not specified'}`,
    `${entry.actionsTaken || 'No actions recorded'}`,
  ]
    .filter(Boolean)
    .join(' - ');

  const updatedRecord = withDerivedViews({
    ...existing,
    verifiedFixWorkflow: [entry, ...existing.verifiedFixWorkflow],
    verifiedFieldFixes: verifiedFixSummary ? [verifiedFixSummary, ...existing.verifiedFieldFixes] : existing.verifiedFieldFixes,
    partsReplaced: input.partsReplaced.length ? [...input.partsReplaced, ...existing.partsReplaced] : existing.partsReplaced,
    engineerNotes: input.rootCause ? [`Verified fix: ${input.rootCause}`, ...existing.engineerNotes] : existing.engineerNotes,
  });

  inMemoryEquipmentRecords = inMemoryEquipmentRecords.map((record) =>
    record.id === equipmentId ? updatedRecord : record,
  );

  return updatedRecord;
};

export const uploadInstallationPhoto = (input: UploadInstallationPhotoInput): EquipmentAsset | undefined => {
  const existing = getEquipmentRecordById(input.equipmentId);
  if (!existing) {
    return undefined;
  }

  const capturedAt = input.capturedAt || new Date().toISOString().slice(0, 16);
  const photo: EquipmentAsset = {
    id: `${input.equipmentId}-${input.serviceVisitId}-${Date.now()}`,
    label: `${input.source === 'camera' ? 'Camera' : 'Gallery'} Photo ${existing.photoLibrary.length + 1}`,
    uri: input.localUri,
    localUri: input.localUri,
    cloudUri: createCloudPhotoUri(input.equipmentId, input.serviceVisitId, input.source, input.localUri),
    source: input.source,
    capturedAt,
    installationId: input.equipmentId,
    serviceVisitId: input.serviceVisitId,
    includeInReport: input.includeInReport ?? true,
    width: input.width,
    height: input.height,
  };

  const updatedRecord = withDerivedViews({
    ...existing,
    photoLibrary: [photo, ...existing.photoLibrary],
  });

  inMemoryEquipmentRecords = inMemoryEquipmentRecords.map((record) =>
    record.id === input.equipmentId ? updatedRecord : record,
  );

  return photo;
};

export const setPhotoIncludeInReport = (
  equipmentId: string,
  photoId: string,
  includeInReport: boolean,
): EquipmentRecord | undefined => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return undefined;
  }

  const updatedRecord = withDerivedViews({
    ...existing,
    photoLibrary: existing.photoLibrary.map((asset) =>
      asset.id === photoId ? { ...asset, includeInReport } : asset
    ),
  });

  inMemoryEquipmentRecords = inMemoryEquipmentRecords.map((record) => (record.id === equipmentId ? updatedRecord : record));
  return updatedRecord;
};

export const deleteInstallationPhoto = (equipmentId: string, photoId: string): EquipmentRecord | undefined => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return undefined;
  }

  const updatedRecord = withDerivedViews({
    ...existing,
    photoLibrary: existing.photoLibrary.filter((asset) => asset.id !== photoId),
    serviceVisitSummary: {
      ...existing.serviceVisitSummary,
      photos: existing.serviceVisitSummary.photos.filter((asset) => asset.id !== photoId),
      reportPhotos: existing.serviceVisitSummary.reportPhotos.filter((asset) => asset.id !== photoId),
    },
    generatedServiceReports: existing.generatedServiceReports.map((report) => ({
      ...report,
      includedPhotoIds: report.includedPhotoIds.filter((id) => id !== photoId),
    })),
  });

  inMemoryEquipmentRecords = inMemoryEquipmentRecords.map((record) => (record.id === equipmentId ? updatedRecord : record));
  return updatedRecord;
};

export const createEquipmentRecord = (input: NewEquipmentRecordInput): EquipmentRecord => {
  const manufacturer = input.manufacturer.trim();
  const model = input.model.trim();
  const knownManufacturer = getManufacturerByName(manufacturer);
  const refrigerantType = knownManufacturer ? 'Not recorded' : 'Unknown';

  const baseRecord: EquipmentRecord = {
    id: `equipment-${Date.now()}`,
    customer: {
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      eircodePostcode: input.eircodePostcode.trim(),
      propertyAddress: input.propertyAddress.trim(),
    },
    equipment: {
      manufacturer,
      model,
      serialNumber: input.serialNumber.trim(),
      indoorUnitSerial: input.indoorUnitSerial.trim(),
      outdoorUnitSerial: input.outdoorUnitSerial.trim(),
      installationDate: input.installationDate.trim(),
      installer: input.installer.trim(),
      refrigerantType,
      refrigerantCharge: 'Not recorded',
      systemCapacity: 'Not recorded',
      warrantyStart: input.warrantyStart.trim(),
      warrantyExpiry: input.warrantyExpiry.trim(),
    },
    status: input.status as EquipmentStatus,
    serviceVisitSummary: {
      currentVisitId: '',
      lastServiceDate: '',
      nextServiceDue: '',
      visitCount: 0,
      latestEngineer: '',
      photos: [],
      report: null,
      reportPhotos: [],
    },
    dashboardCards: [],
    timeline: [],
    quickActions: [],
    faultHistory: [],
    verifiedFieldFixes: [],
    commissioningReports: [],
    serviceReports: [],
    performanceHistory: [],
    partsReplaced: [],
    photoLibrary: [],
    documents: [],
    generatedServiceReports: [],
    verifiedFixWorkflow: [],
    engineerNotes: input.engineerNotes.trim() ? [input.engineerNotes.trim()] : [],
    aiEngineeringRecommendations: [
      'Run commissioning wizard to establish a baseline profile.',
      'Capture initial photos for future diagnostics comparisons.',
    ],
    moduleLinks: defaultModuleLinks || {
      faultFinder: { route: '/fault-finder', status: 'Connected' },
      commissioningWizard: { route: '/commissioning-wizard', status: 'Connected' },
      serviceReports: { route: '/coming-soon', status: 'Planned' },
      verifiedFieldFixes: { route: '/verified-field-fixes', status: 'Connected' },
      aiDiagnostics: { route: '/coming-soon', status: 'Planned' },
      photosAndReports: { route: '/coming-soon', status: 'Planned' },
    },
    capabilityConfig: defaultCapabilityConfig || {
      cloudSync: true,
      openAI: true,
      photoRecognition: true,
      qrCodeScanner: true,
      barcodeScanner: true,
      pdfExport: true,
      emailReports: true,
      calendar: true,
      offlineStorage: true,
      pushNotifications: true,
    },
  };

  const recordWithVisitId = {
    ...baseRecord,
    serviceVisitSummary: {
      ...baseRecord.serviceVisitSummary,
      currentVisitId: nextServiceVisitId(baseRecord.id, baseRecord.serviceVisitSummary.visitCount),
    },
  };

  return withDerivedViews(recordWithVisitId);
};

export const saveEquipmentRecord = (input: NewEquipmentRecordInput): EquipmentRecord => {
  const newRecord = createEquipmentRecord(input);
  inMemoryEquipmentRecords = [newRecord, ...inMemoryEquipmentRecords];
  return newRecord;
};

export const completeServiceVisit = (
  equipmentId: string,
  input: CompleteServiceVisitInput,
): EquipmentRecord | undefined => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return undefined;
  }

  const serviceDate = toDatePart(input.arrivalDateTime);
  const nextServiceDue = addMonths(serviceDate, 12);
  const nextVisitCount = existing.serviceVisitSummary.visitCount + 1;
  const selectedVisitPhotos = existing.photoLibrary.filter((asset) =>
    asset.serviceVisitId === input.serviceVisitId && input.selectedPhotoIds.includes(asset.id)
  );
  const manualVisitPhotos = createVisitPhotoAssets(equipmentId, serviceDate, input.beforePhotos, nextVisitCount).map((asset) => ({
    ...asset,
    installationId: equipmentId,
    serviceVisitId: input.serviceVisitId,
    source: 'manual' as const,
    includeInReport: true,
  }));
  const visitPhotos = [...selectedVisitPhotos, ...manualVisitPhotos];
  const includedPhotoIds = selectedVisitPhotos.map((asset) => asset.id);
  const generatedAt = input.reportGeneratedAt || new Date().toISOString().slice(0, 16);
  const reportAsset: EquipmentAsset = {
    id: `${equipmentId}-visit-${nextVisitCount}-report`,
    label: input.reportName,
    uri: createCloudPdfUri(equipmentId, input.serviceVisitId),
    capturedAt: serviceDate,
    installationId: equipmentId,
    serviceVisitId: input.serviceVisitId,
    source: 'generated',
  };

  const visitSummary = [
    `Visit #${nextVisitCount} completed by ${input.engineer} on ${serviceDate}.`,
    `Checklist: ${input.checklistCompleted.join(', ') || 'No checks recorded.'}.`,
    input.faultFound ? `Fault handled: ${input.faultSummary}.` : 'No new fault identified.',
    input.partsReplaced.length ? `Parts replaced: ${input.partsReplaced.join(', ')}.` : 'No parts replaced.',
    input.commissioningAndPerformanceTests.length
      ? `Commissioning and performance: ${input.commissioningAndPerformanceTests.join(', ')}.`
      : 'No commissioning and performance tests recorded.',
    `Report photos included: ${selectedVisitPhotos.length}.`,
    `Customer recommendations: ${input.customerRecommendations}.`,
    `Signed by: ${input.customerSignature}.`,
  ].join(' ');

  const generatedReport = {
    id: reportAsset.id,
    name: input.reportName,
    generatedAt,
    uri: reportAsset.uri,
    serviceVisitId: input.serviceVisitId,
    includedPhotoIds,
  };

  const updatedRecord = withDerivedViews({
    ...existing,
    serviceVisitSummary: {
      currentVisitId: nextServiceVisitId(equipmentId, nextVisitCount),
      lastServiceDate: serviceDate,
      nextServiceDue,
      visitCount: nextVisitCount,
      latestEngineer: input.engineer,
      photos: visitPhotos,
      report: reportAsset,
      reportPhotos: selectedVisitPhotos,
    },
    serviceReports: [visitSummary, ...existing.serviceReports],
    faultHistory: input.faultFound && input.faultSummary.trim()
      ? [input.faultSummary.trim(), ...existing.faultHistory]
      : existing.faultHistory,
    partsReplaced: input.partsReplaced.length
      ? [...input.partsReplaced, ...existing.partsReplaced]
      : existing.partsReplaced,
    performanceHistory: input.commissioningAndPerformanceTests.length
      ? [...input.commissioningAndPerformanceTests, ...existing.performanceHistory]
      : existing.performanceHistory,
    commissioningReports: [
      `Service visit #${nextVisitCount} commissioning and performance checks completed on ${serviceDate}.`,
      ...existing.commissioningReports,
    ],
    photoLibrary: [
      ...manualVisitPhotos,
      ...existing.photoLibrary,
    ],
    documents: [reportAsset, ...existing.documents],
    generatedServiceReports: [generatedReport, ...existing.generatedServiceReports],
    engineerNotes: input.privateEngineerNotes.trim()
      ? [input.privateEngineerNotes.trim(), ...existing.engineerNotes]
      : existing.engineerNotes,
    aiEngineeringRecommendations: input.customerRecommendations.trim()
      ? [input.customerRecommendations.trim(), ...existing.aiEngineeringRecommendations]
      : existing.aiEngineeringRecommendations,
  });

  inMemoryEquipmentRecords = inMemoryEquipmentRecords.map((record) =>
    record.id === equipmentId ? updatedRecord : record,
  );

  return updatedRecord;
};

export const updateEquipmentRecord = (
  equipmentId: string,
  updater: (current: EquipmentRecord) => EquipmentRecord,
): EquipmentRecord | undefined => {
  const existing = getEquipmentRecordById(equipmentId);
  if (!existing) {
    return undefined;
  }

  const next = withDerivedViews(updater(existing));
  inMemoryEquipmentRecords = inMemoryEquipmentRecords.map((record) => (record.id === equipmentId ? next : record));
  return next;
};

export const addInstallationEngineerNote = (
  equipmentId: string,
  note: string,
): EquipmentRecord | undefined => {
  const trimmed = note.trim();
  if (!trimmed) {
    return getEquipmentRecordById(equipmentId);
  }

  return updateEquipmentRecord(equipmentId, (current) => ({
    ...current,
    engineerNotes: [trimmed, ...current.engineerNotes],
    timeline: [
      {
        id: `${equipmentId}-note-${Date.now()}`,
        type: 'Engineer Note',
        title: 'Engineer note added',
        date: new Date().toISOString().slice(0, 10),
        summary: trimmed,
      },
      ...current.timeline,
    ],
  }));
};

export const addInstallationFaultRecord = (
  equipmentId: string,
  faultSummary: string,
): EquipmentRecord | undefined => {
  const trimmed = faultSummary.trim();
  if (!trimmed) {
    return getEquipmentRecordById(equipmentId);
  }

  return updateEquipmentRecord(equipmentId, (current) => ({
    ...current,
    faultHistory: [trimmed, ...current.faultHistory],
  }));
};

export const addInstallationPartReplacement = (
  equipmentId: string,
  partName: string,
): EquipmentRecord | undefined => {
  const trimmed = partName.trim();
  if (!trimmed) {
    return getEquipmentRecordById(equipmentId);
  }

  return updateEquipmentRecord(equipmentId, (current) => ({
    ...current,
    partsReplaced: [trimmed, ...current.partsReplaced],
  }));
};

export const saveInstallationReport = (
  equipmentId: string,
  title: string,
  summary: string,
  serviceVisitId?: string,
): EquipmentRecord | undefined => {
  const now = new Date().toISOString().slice(0, 16);
  const trimmedTitle = title.trim() || 'Service report';
  const trimmedSummary = summary.trim();
  const reportId = `${equipmentId}-manual-report-${Date.now()}`;

  return updateEquipmentRecord(equipmentId, (current) => ({
    ...current,
    serviceReports: trimmedSummary ? [trimmedSummary, ...current.serviceReports] : current.serviceReports,
    documents: [
      {
        id: reportId,
        label: trimmedTitle,
        uri: `https://cloud.heatpumppro.local/installations/${equipmentId}/manual-report-${Date.now()}.pdf`,
        capturedAt: now,
        installationId: equipmentId,
        serviceVisitId,
        source: 'generated',
      },
      ...current.documents,
    ],
  }));
};
