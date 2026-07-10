import {
  addInstallationEngineerNote,
  addInstallationFaultRecord,
  addInstallationPartReplacement,
  completeServiceVisit,
  getInstallationPhotoLibrary,
  getInstallationVerifiedFixWorkflow,
  getCurrentServiceVisitId,
  getEquipmentHubRecords,
  getEquipmentRecordById,
  saveEquipmentRecord,
  saveInstallationReport,
  saveInstallationVerifiedFixWorkflow,
  updateEquipmentRecord,
  uploadInstallationPhoto,
  deleteInstallationPhoto,
  setPhotoIncludeInReport,
} from '../../equipment/equipment-hub-service';
import { getCurrentSession } from '../auth/auth-session-service';
import {
  AiDiagnosticRecord,
  InstallationRecord,
  InstallationRepository,
  InstallationUpsertInput,
  ServiceVisitRecord,
} from './types';
import { normalizeManufacturerName } from '../../../data/equipment';

const demoCompanyId = 'company-demo-1';
const demoEngineerId = 'engineer-demo-1';

const nowIso = () => new Date().toISOString();
const createId = () => `installation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const installationStore = new Map<string, InstallationRecord>();
let installationsSeeded = false;
const aiDiagnosticsByInstallation = new Map<string, AiDiagnosticRecord[]>();

const pick = (...values: Array<string | null | undefined>) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

const getSessionScope = async () => {
  const session = await getCurrentSession();

  // Local mode allows an implicit demo scope when auth is not yet initialized.
  return {
    companyId: session?.companyId || demoCompanyId,
    engineerId: session?.engineerId || demoEngineerId,
  };
};

const resolveInstallationCompanyId = (installationId: string): string => {
  const existing = installationStore.get(installationId);
  return existing?.companyId || demoCompanyId;
};

const assertCompanyAccess = async (installationId?: string) => {
  const scope = await getSessionScope();

  if (installationId) {
    const companyId = resolveInstallationCompanyId(installationId);
    if (companyId !== scope.companyId) {
      throw new Error('Cross-company access denied.');
    }
  }

  return scope;
};

const toInstallationRecord = (equipmentId: string, companyId: string, engineerId: string): InstallationRecord | undefined => {
  const equipment = getEquipmentRecordById(equipmentId);
  if (!equipment) {
    return undefined;
  }

  const manufacturerEntered = equipment.equipment.manufacturer;
  const manufacturer = normalizeManufacturerName(manufacturerEntered);
  const modelFamily = equipment.equipment.model;

  return {
    id: equipment.id,
    companyId,
    customerId: undefined,
    manufacturerCanonical: manufacturer,
    customerName: equipment.customer.customerName,
    customerPhone: equipment.customer.phone,
    customerEmail: equipment.customer.email,
    siteAddress: equipment.customer.propertyAddress,
    addressLine1: equipment.customer.propertyAddress,
    addressLine2: '',
    townCity: '',
    county: '',
    eircode: equipment.customer.eircodePostcode,
    manufacturerEntered,
    manufacturer,
    modelFamily,
    model: equipment.equipment.model,
    exactModelNumber: equipment.equipment.serialNumber,
    serialNumber: equipment.equipment.serialNumber,
    outdoorModel: equipment.equipment.model,
    indoorModel: equipment.equipment.model,
    controllerModel: '',
    capacityKw: '',
    indoorSerial: equipment.equipment.indoorUnitSerial,
    outdoorSerial: equipment.equipment.outdoorUnitSerial,
    electricalPhase: '',
    voltage: '',
    refrigerantChargeKg: equipment.equipment.refrigerantCharge,
    glycolType: '',
    glycolPercentage: '',
    designFlowTemperature: '',
    maximumFlowTemperature: '',
    bufferTankSizeLitres: '',
    cylinderManufacturer: '',
    cylinderSizeLitres: '',
    installer: equipment.equipment.installer,
    commissionDate: equipment.equipment.installationDate,
    installationDate: equipment.equipment.installationDate,
    warrantyExpiry: equipment.equipment.warrantyExpiry,
    systemType: 'Heat Pump',
    heatSource: 'Air source',
    configurationType: 'unknown',
    yearIntroduced: '',
    firmwareVersion: '',
    bufferTank: '',
    cylinderModel: '',
    refrigerant: equipment.equipment.refrigerantType,
    notes: equipment.engineerNotes[0] || '',
    phone: equipment.customer.phone,
    email: equipment.customer.email,
    address: equipment.customer.propertyAddress,
    eircodePostcode: equipment.customer.eircodePostcode,
    heatPumpBrand: manufacturer,
    heatPumpModel: modelFamily,
    manufacturer: equipment.equipment.manufacturer,
    model: equipment.equipment.model,
    indoorUnitSerial: equipment.equipment.indoorUnitSerial,
    outdoorUnitSerial: equipment.equipment.outdoorUnitSerial,
    installerName: equipment.equipment.installer,
    installDate: equipment.equipment.installationDate,
    warrantyStart: equipment.equipment.installationDate,
    unitType: 'Heat Pump',
    status: equipment.status,
    createdBy: engineerId,
    updatedBy: engineerId,
    engineerNotes: equipment.engineerNotes[0] || '',
    createdAt: `${equipment.equipment.installationDate}T12:00:00.000Z`,
    updatedAt: `${equipment.equipment.installationDate}T12:00:00.000Z`,
  };
};

const normalizeInstallationInput = (
  input: InstallationUpsertInput,
  previous?: InstallationRecord,
): InstallationRecord => {
  const manufacturerEntered = pick(input.manufacturerEntered, input.heatPumpBrand, input.manufacturer, previous?.manufacturerEntered, previous?.heatPumpBrand, previous?.manufacturer);
  const manufacturer = normalizeManufacturerName(pick(input.manufacturer, input.heatPumpBrand, previous?.manufacturer, previous?.heatPumpBrand, manufacturerEntered));
  const modelFamily = pick(input.modelFamily, input.heatPumpModel, previous?.modelFamily, previous?.heatPumpModel, input.model, previous?.model);
  const model = pick(input.model, input.heatPumpModel, previous?.model, previous?.heatPumpModel, modelFamily);
  const exactModelNumber = pick(input.exactModelNumber, previous?.exactModelNumber, input.serialNumber, previous?.serialNumber);
  const serialNumber = pick(input.serialNumber, previous?.serialNumber, input.exactModelNumber, previous?.exactModelNumber);
  const customerName = pick(input.customerName, previous?.customerName);
  const customerPhone = pick(input.customerPhone, input.phone, previous?.customerPhone, previous?.phone);
  const customerEmail = pick(input.customerEmail, input.email, previous?.customerEmail, previous?.email);
  const siteAddress = pick(input.siteAddress, input.address, previous?.siteAddress, previous?.address);
  const addressLine1 = pick(input.addressLine1, previous?.addressLine1, siteAddress);
  const addressLine2 = pick(input.addressLine2, previous?.addressLine2);
  const townCity = pick(input.townCity, previous?.townCity);
  const county = pick(input.county, previous?.county);
  const eircode = pick(input.eircode, input.eircodePostcode, previous?.eircode, previous?.eircodePostcode);
  const outdoorModel = pick(input.outdoorModel, previous?.outdoorModel, model);
  const indoorModel = pick(input.indoorModel, previous?.indoorModel, model);
  const outdoorSerial = pick(input.outdoorSerial, input.outdoorUnitSerial, previous?.outdoorSerial, previous?.outdoorUnitSerial);
  const indoorSerial = pick(input.indoorSerial, input.indoorUnitSerial, previous?.indoorSerial, previous?.indoorUnitSerial);
  const controllerModel = pick(input.controllerModel, previous?.controllerModel);
  const capacityKw = pick(input.capacityKw, previous?.capacityKw);
  const electricalPhase = pick(input.electricalPhase, previous?.electricalPhase);
  const voltage = pick(input.voltage, previous?.voltage);
  const refrigerant = pick(input.refrigerant, previous?.refrigerant);
  const refrigerantChargeKg = pick(input.refrigerantChargeKg, previous?.refrigerantChargeKg);
  const glycolType = pick(input.glycolType, previous?.glycolType);
  const glycolPercentage = pick(input.glycolPercentage, previous?.glycolPercentage);
  const designFlowTemperature = pick(input.designFlowTemperature, previous?.designFlowTemperature);
  const maximumFlowTemperature = pick(input.maximumFlowTemperature, previous?.maximumFlowTemperature);
  const bufferTank = pick(input.bufferTank, previous?.bufferTank);
  const bufferTankSizeLitres = pick(input.bufferTankSizeLitres, previous?.bufferTankSizeLitres);
  const cylinderManufacturer = pick(input.cylinderManufacturer, previous?.cylinderManufacturer);
  const cylinderModel = pick(input.cylinderModel, previous?.cylinderModel);
  const cylinderSizeLitres = pick(input.cylinderSizeLitres, previous?.cylinderSizeLitres);
  const installer = pick(input.installer, input.installerName, previous?.installer, previous?.installerName);
  const commissionDate = pick(input.commissionDate, input.installationDate, input.installDate, previous?.commissionDate, previous?.installationDate, previous?.installDate, nowIso().slice(0, 10));
  const installationDate = pick(input.installationDate, input.commissionDate, input.installDate, previous?.installationDate, previous?.commissionDate, previous?.installDate, commissionDate);
  const warrantyExpiry = pick(input.warrantyExpiry, previous?.warrantyExpiry, commissionDate);
  const systemType = pick(input.systemType, input.unitType, previous?.systemType, previous?.unitType, 'Heat Pump');
  const heatSource = pick(input.heatSource, previous?.heatSource);
  const configurationType = pick(input.configurationType, previous?.configurationType, 'unknown');
  const yearIntroduced = pick(input.yearIntroduced, previous?.yearIntroduced);
  const firmwareVersion = pick(input.firmwareVersion, previous?.firmwareVersion);
  const notes = pick(input.notes, input.engineerNotes, previous?.notes, previous?.engineerNotes);
  const status = pick(input.status, previous?.status, 'Commissioned');
  const createdBy = input.createdBy || previous?.createdBy || demoEngineerId;
  const updatedBy = input.updatedBy || demoEngineerId;

  return {
    id: input.id || previous?.id || createId(),
    companyId: previous?.companyId || input.companyId || demoCompanyId,
    customerId: previous?.customerId,
    manufacturerCanonical: manufacturer,
    customerName,
    customerPhone,
    customerEmail,
    siteAddress,
    addressLine1,
    addressLine2,
    townCity,
    county,
    eircode,
    manufacturerEntered,
    manufacturer,
    modelFamily,
    model,
    exactModelNumber,
    serialNumber,
    outdoorModel,
    indoorModel,
    indoorSerial,
    outdoorSerial,
    controllerModel,
    capacityKw,
    electricalPhase,
    voltage,
    refrigerant,
    refrigerantChargeKg,
    glycolType,
    glycolPercentage,
    designFlowTemperature,
    maximumFlowTemperature,
    installer,
    commissionDate,
    installationDate,
    warrantyExpiry,
    systemType,
    heatSource,
    configurationType,
    yearIntroduced,
    firmwareVersion,
    bufferTank,
    bufferTankSizeLitres,
    cylinderManufacturer,
    cylinderModel,
    notes,
    createdAt: previous?.createdAt || nowIso(),
    updatedAt: nowIso(),
    phone: customerPhone,
    email: customerEmail,
    address: siteAddress,
    eircodePostcode: eircode,
    heatPumpBrand: manufacturer,
    heatPumpModel: modelFamily,
    manufacturer,
    model,
    indoorUnitSerial: indoorSerial,
    outdoorUnitSerial: outdoorSerial,
    installerName: installer,
    installDate: installationDate,
    warrantyStart: previous?.warrantyStart || commissionDate,
    unitType: systemType,
    status,
    engineerNotes: notes,
    createdBy,
    updatedBy,
  };
};

const seedInstallations = () => {
  if (installationsSeeded) {
    return;
  }

  getEquipmentHubRecords().forEach((record) => {
    const installation = toInstallationRecord(record.id, demoCompanyId, demoEngineerId);
    if (installation) {
      installationStore.set(record.id, installation);
    }
  });

  installationsSeeded = true;
};

const installationList = async () => {
  seedInstallations();
  const scope = await assertCompanyAccess();

  return Array.from(installationStore.values())
    .filter((record) => record.companyId === scope.companyId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
};

export const localInstallationRepository: InstallationRepository = {
  listInstallations: async () => {
    return installationList();
  },

  getInstallationById: async (installationId) => {
    seedInstallations();
    const scope = await assertCompanyAccess(installationId);
    const record = installationStore.get(installationId);
    if (!record || record.companyId !== scope.companyId) {
      return undefined;
    }
    return record;
  },

  createInstallation: async (input) => {
    const scope = await assertCompanyAccess();

    const created = normalizeInstallationInput({ ...input, companyId: scope.companyId, createdBy: scope.engineerId, updatedBy: scope.engineerId });
    installationStore.set(created.id, created);
    return created;
  },

  updateInstallation: async (installationId, updates) => {
    seedInstallations();
    const scope = await assertCompanyAccess(installationId);
    const existing = installationStore.get(installationId);
    if (!existing || existing.companyId !== scope.companyId) {
      return undefined;
    }

    const updated = normalizeInstallationInput({ ...updates, id: installationId, companyId: scope.companyId, updatedBy: scope.engineerId }, existing);
    installationStore.set(installationId, updated);
    return updated;
  },

  deleteInstallation: async (installationId) => {
    seedInstallations();
    const scope = await assertCompanyAccess(installationId);
    const existing = installationStore.get(installationId);
    if (!existing || existing.companyId !== scope.companyId) {
      return false;
    }

    return installationStore.delete(installationId);
  },

  startServiceVisit: async (installationId, engineerName) => {
    await assertCompanyAccess(installationId);

    const currentId = getCurrentServiceVisitId(installationId);
    const existing = getEquipmentRecordById(installationId);
    if (!existing) {
      return undefined;
    }

    const visit: ServiceVisitRecord = {
      id: currentId,
      date: new Date().toISOString().slice(0, 10),
      engineer: engineerName || 'Engineer',
      summary: 'Service visit started.',
      status: 'Open',
      checklist: [],
      measurements: [],
      photos: [],
    };

    return visit;
  },

  saveServiceVisitDraft: async (installationId, serviceVisitId, updates) => {
    await assertCompanyAccess(installationId);

    return {
      id: serviceVisitId,
      date: updates.date || new Date().toISOString().slice(0, 10),
      engineer: updates.engineer || 'Engineer',
      summary: updates.summary || 'Service visit draft saved.',
      status: updates.status || 'Open',
      checklist: updates.checklist || [],
      measurements: updates.measurements || [],
      photos: updates.photos || [],
    };
  },

  completeServiceVisit: async (installationId, input) => {
    await assertCompanyAccess(installationId);

    const completed = completeServiceVisit(installationId, input);

    if (!completed) {
      return undefined;
    }

    return {
      id: input.serviceVisitId,
      date: completed.serviceVisitSummary.lastServiceDate || new Date().toISOString().slice(0, 10),
      engineer: completed.serviceVisitSummary.latestEngineer || 'Engineer',
      summary: input.customerRecommendations || 'Service visit completed.',
      status: 'Completed',
      checklist: input.checklistCompleted || [],
      measurements: input.commissioningAndPerformanceTests || [],
      photos: completed.photoLibrary
        .filter((photo) => photo.serviceVisitId === input.serviceVisitId)
        .map((photo) => photo.id),
    };
  },

  listServiceVisits: async (installationId) => {
    await assertCompanyAccess(installationId);

    const record = getEquipmentRecordById(installationId);
    if (!record) {
      return [];
    }

    return record.generatedServiceReports.map((item) => ({
      id: item.serviceVisitId,
      date: item.generatedAt.slice(0, 10),
      engineer: record.serviceVisitSummary.latestEngineer || 'Engineer',
      summary: record.serviceReports.find((entry) => entry.includes(item.serviceVisitId)) || 'Service visit saved.',
      status: 'Completed' as const,
      checklist: [],
      measurements: [],
      photos: item.includedPhotoIds,
    }));
  },

  addPhoto: async (installationId, photo) => {
    await assertCompanyAccess(installationId);

    const saved = uploadInstallationPhoto({
      equipmentId: installationId,
      serviceVisitId: photo.serviceVisitId || getCurrentServiceVisitId(installationId),
      localUri: photo.localUri || photo.uri,
      source: photo.source === 'gallery' ? 'gallery' : 'camera',
      capturedAt: nowIso().slice(0, 16),
      includeInReport: photo.includeInReport,
      width: photo.width,
      height: photo.height,
    });

    if (!saved) {
      return undefined;
    }

    return {
      ...saved,
      localUri: saved.localUri || saved.uri,
      remoteStoragePath: photo.remoteStoragePath || saved.cloudUri || '',
      uploadStatus: photo.uploadStatus || 'local',
      uploadedBy: photo.uploadedBy || demoEngineerId,
    };
  },

  removePhoto: async (installationId, photoId) => {
    await assertCompanyAccess(installationId);
    return Boolean(deleteInstallationPhoto(installationId, photoId));
  },

  listPhotos: async (installationId, serviceVisitId) => {
    await assertCompanyAccess(installationId);
    return getInstallationPhotoLibrary(installationId, serviceVisitId);
  },

  setPhotoIncludeInReport: async (installationId, photoId, includeInReport) => {
    await assertCompanyAccess(installationId);
    return Boolean(setPhotoIncludeInReport(installationId, photoId, includeInReport));
  },

  addEngineerNote: async (installationId, note) => {
    await assertCompanyAccess(installationId);
    addInstallationEngineerNote(installationId, note);
  },

  addFaultRecord: async (installationId, faultSummary) => {
    await assertCompanyAccess(installationId);
    addInstallationFaultRecord(installationId, faultSummary);
  },

  addVerifiedFix: async (installationId, input) => {
    const scope = await assertCompanyAccess(installationId);

    saveInstallationVerifiedFixWorkflow(installationId, {
      engineer: scope.engineerId,
      faultCode: input.faultCode,
      symptoms: input.symptoms,
      rootCause: input.rootCause,
      actionsTaken: input.actionsTaken,
      partsReplaced: input.partsReplaced,
      estimatedRepairTime: input.estimatedRepairTime,
      toolsUsed: input.toolsUsed,
      safetyWarningsReviewed: input.safetyWarningsReviewed,
      diagnosticStepsCompleted: input.diagnosticStepsCompleted,
      result: input.result || 'verified-fixed',
    });
  },

  listVerifiedFixes: async (installationId) => {
    await assertCompanyAccess(installationId);
    return getInstallationVerifiedFixWorkflow(installationId);
  },

  addPartReplacement: async (installationId, partName) => {
    await assertCompanyAccess(installationId);
    addInstallationPartReplacement(installationId, partName);
  },

  saveReport: async (installationId, reportTitle, reportSummary, serviceVisitId) => {
    await assertCompanyAccess(installationId);

    // Customer-facing report summary intentionally excludes private engineer notes.
    saveInstallationReport(installationId, reportTitle, reportSummary, serviceVisitId);
  },

  listReports: async (installationId) => {
    await assertCompanyAccess(installationId);

    const record = getEquipmentRecordById(installationId);
    return record?.documents || [];
  },

  saveAiDiagnostic: async (installationId, input) => {
    await assertCompanyAccess(installationId);

    const next: AiDiagnosticRecord = {
      id: `${installationId}-ai-${Date.now()}`,
      installationId,
      createdAt: nowIso(),
      ...input,
    };

    const existing = aiDiagnosticsByInstallation.get(installationId) || [];
    aiDiagnosticsByInstallation.set(installationId, [next, ...existing]);

    updateEquipmentRecord(installationId, (current) => ({
      ...current,
      aiEngineeringRecommendations: [
        `${input.faultCode}: ${input.rootCause} (${input.confidenceScore}% confidence)`,
        ...current.aiEngineeringRecommendations,
      ],
    }));

    return next;
  },

  listAiDiagnostics: async (installationId) => {
    await assertCompanyAccess(installationId);
    return aiDiagnosticsByInstallation.get(installationId) || [];
  },

  getEquipmentPassport: async (installationId) => {
    await assertCompanyAccess(installationId);

    const equipment = getEquipmentRecordById(installationId);
    if (!equipment) {
      return undefined;
    }

    return { equipment };
  },
};
