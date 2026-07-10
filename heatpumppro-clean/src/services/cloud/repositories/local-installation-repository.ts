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
import { AiDiagnosticRecord, InstallationRecord, InstallationRepository, ServiceVisitRecord } from './types';

const demoCompanyId = 'company-demo-1';
const demoEngineerId = 'engineer-demo-1';

const nowIso = () => new Date().toISOString();

const installationOwnership = new Map<string, string>();
const aiDiagnosticsByInstallation = new Map<string, AiDiagnosticRecord[]>();

const getSessionScope = async () => {
  const session = await getCurrentSession();

  // Local mode allows an implicit demo scope when auth is not yet initialized.
  return {
    companyId: session?.companyId || demoCompanyId,
    engineerId: session?.engineerId || demoEngineerId,
  };
};

const resolveInstallationCompanyId = (installationId: string): string => {
  const existing = installationOwnership.get(installationId);
  if (existing) {
    return existing;
  }

  // Existing seed/demo installations are owned by the demo company.
  installationOwnership.set(installationId, demoCompanyId);
  return demoCompanyId;
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

  return {
    id: equipment.id,
    companyId,
    customerName: equipment.customer.customerName,
    phone: equipment.customer.phone,
    email: equipment.customer.email,
    address: equipment.customer.propertyAddress,
    eircodePostcode: equipment.customer.eircodePostcode,
    unitType: 'Heat Pump',
    manufacturer: equipment.equipment.manufacturer,
    model: equipment.equipment.model,
    serialNumber: equipment.equipment.serialNumber,
    installDate: equipment.equipment.installationDate,
    installerName: equipment.equipment.installer,
    status: equipment.status,
    notes: equipment.engineerNotes[0] || '',
    createdBy: engineerId,
    updatedBy: engineerId,
  };
};

const applyInstallationUpdates = (
  installationId: string,
  updates: Partial<Omit<InstallationRecord, 'id' | 'companyId'>>,
) => {
  updateEquipmentRecord(installationId, (current) => ({
    ...current,
    customer: {
      ...current.customer,
      customerName: updates.customerName ?? current.customer.customerName,
      phone: updates.phone ?? current.customer.phone,
      email: updates.email ?? current.customer.email,
      propertyAddress: updates.address ?? current.customer.propertyAddress,
      eircodePostcode: updates.eircodePostcode ?? current.customer.eircodePostcode,
    },
    equipment: {
      ...current.equipment,
      manufacturer: updates.manufacturer ?? current.equipment.manufacturer,
      model: updates.model ?? current.equipment.model,
      serialNumber: updates.serialNumber ?? current.equipment.serialNumber,
      installationDate: updates.installDate ?? current.equipment.installationDate,
      installer: updates.installerName ?? current.equipment.installer,
    },
    status: (updates.status as typeof current.status | undefined) ?? current.status,
    engineerNotes: updates.notes ? [updates.notes, ...current.engineerNotes] : current.engineerNotes,
  }));
};

export const localInstallationRepository: InstallationRepository = {
  listInstallations: async () => {
    const scope = await assertCompanyAccess();

    return getEquipmentHubRecords()
      .map((record) => {
        installationOwnership.set(record.id, resolveInstallationCompanyId(record.id));
        return toInstallationRecord(record.id, scope.companyId, scope.engineerId);
      })
      .filter((record): record is InstallationRecord => Boolean(record))
      .filter((record) => record.companyId === scope.companyId);
  },

  getInstallationById: async (installationId) => {
    const scope = await assertCompanyAccess(installationId);
    return toInstallationRecord(installationId, scope.companyId, scope.engineerId);
  },

  createInstallation: async (input) => {
    const scope = await assertCompanyAccess();

    const created = saveEquipmentRecord({
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      eircodePostcode: input.eircodePostcode,
      propertyAddress: input.address,
      manufacturer: input.manufacturer,
      model: input.model,
      serialNumber: input.serialNumber,
      indoorUnitSerial: '',
      outdoorUnitSerial: '',
      installationDate: input.installDate,
      installer: input.installerName,
      warrantyStart: input.installDate,
      warrantyExpiry: input.installDate,
      status: (input.status as 'Commissioned' | 'Active' | 'Out of Service' | 'Under Warranty') || 'Active',
      engineerNotes: input.notes,
    });

    installationOwnership.set(created.id, scope.companyId);

    return {
      id: created.id,
      companyId: scope.companyId,
      customerName: created.customer.customerName,
      phone: created.customer.phone,
      email: created.customer.email,
      address: created.customer.propertyAddress,
      eircodePostcode: created.customer.eircodePostcode,
      unitType: input.unitType,
      manufacturer: created.equipment.manufacturer,
      model: created.equipment.model,
      serialNumber: created.equipment.serialNumber,
      installDate: created.equipment.installationDate,
      installerName: created.equipment.installer,
      status: created.status,
      notes: created.engineerNotes[0] || '',
      createdBy: scope.engineerId,
      updatedBy: scope.engineerId,
    };
  },

  updateInstallation: async (installationId, updates) => {
    const scope = await assertCompanyAccess(installationId);
    applyInstallationUpdates(installationId, updates);
    return toInstallationRecord(installationId, scope.companyId, scope.engineerId);
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
