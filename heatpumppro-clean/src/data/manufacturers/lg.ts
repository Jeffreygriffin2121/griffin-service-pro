import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['THERMA V R32 MONOBLOC', 'THERMA V SPLIT', 'THERMA V HYDROSPLIT'];

export const faultCodes: Record<string, string[]> = {
  'THERMA V R32 MONOBLOC': ['CH05', 'CH14', 'CH38', 'CH67'],
  'THERMA V SPLIT': ['CH10', 'CH21', 'CH40'],
  'THERMA V HYDROSPLIT': ['CH34', 'CH41', 'CH45'],
};

export const diagnostics: Record<string, string> = {
  CH05: 'Communication error between indoor and outdoor modules.',
  CH14: 'Water outlet temperature sensor open/short condition.',
  CH38: 'Refrigerant pressure abnormal condition.',
  CH67: 'Outdoor fan motor feedback fault.',
  CH10: 'Discharge sensor abnormal reading.',
  CH21: 'High pressure protection event.',
  CH40: 'Low pressure condition detected.',
  CH34: 'Inverter current limit event.',
  CH41: 'Suction temperature sensor fault.',
  CH45: 'Condenser inlet thermistor fault.',
};

export const likelyCauses: Record<string, string[]> = {
  CH05: ['Damaged communication wiring', 'PCB communication interface fault'],
  CH38: ['Charge imbalance', 'Pressure sensor drift'],
  CH67: ['Fan motor seizure', 'Motor drive output issue'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  CH05: ['Check communication line resistance', 'Inspect connectors and PCB terminals'],
  CH38: ['Verify transducer output and gauge pressure', 'Inspect for system restrictions'],
  CH67: ['Check motor winding resistance', 'Confirm fan drive voltage'],
};

export const expectedMeasurements: Record<string, string[]> = {
  CH05: ['Stable communication values without dropouts'],
  CH38: ['Pressure readings aligned with temperature conditions'],
  CH67: ['Motor current and drive voltage within range'],
};

export const repairRecommendations: Record<string, string[]> = {
  CH05: ['Repair communication loom and retest'],
  CH38: ['Correct pressure sensor or refrigerant charge issue'],
  CH67: ['Replace failed fan motor or driver'],
};

export const lgData: ManufacturerDataFile = {
  manufacturer: 'LG',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'water-side flow protection and pressure sensor reliability',
    commonComponents: ['plate heat exchanger thermistors', 'flow switch', 'pressure sensor'],
    preferredTools: ['digital pressure probes', 'pipe thermocouples'],
  },
};

export default lgData;
