import { InstallationRepository } from './types';

const unavailable = () => {
  throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.');
};

export const cloudInstallationRepository: InstallationRepository = {
  listInstallations: async () => unavailable(),
  getInstallationById: async () => unavailable(),
  createInstallation: async () => unavailable(),
  updateInstallation: async () => unavailable(),
  startServiceVisit: async () => unavailable(),
  saveServiceVisitDraft: async () => unavailable(),
  completeServiceVisit: async () => unavailable(),
  listServiceVisits: async () => unavailable(),
  addPhoto: async () => unavailable(),
  removePhoto: async () => unavailable(),
  listPhotos: async () => unavailable(),
  setPhotoIncludeInReport: async () => unavailable(),
  addEngineerNote: async () => unavailable(),
  addFaultRecord: async () => unavailable(),
  addVerifiedFix: async () => unavailable(),
  listVerifiedFixes: async () => unavailable(),
  addPartReplacement: async () => unavailable(),
  saveReport: async () => unavailable(),
  listReports: async () => unavailable(),
  saveAiDiagnostic: async () => unavailable(),
  listAiDiagnostics: async () => unavailable(),
  getEquipmentPassport: async () => unavailable(),
};
