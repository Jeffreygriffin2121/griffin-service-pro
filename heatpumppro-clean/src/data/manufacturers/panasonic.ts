import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['AQUAREA J GEN', 'AQUAREA T-CAP', 'AQUAREA HIGH PERFORMANCE'];

export const faultCodes: Record<string, string[]> = {
  'AQUAREA J GEN': ['H62', 'H70', 'H90', 'F12'],
  'AQUAREA T-CAP': ['H59', 'H64', 'H76', 'F40'],
  'AQUAREA HIGH PERFORMANCE': ['H75', 'H91', 'F22'],
};

export const diagnostics: Record<string, string> = {
  H62: 'Compressor control irregularity detected during startup sequencing.',
  H70: 'Indoor and outdoor communication quality degraded.',
  H90: 'Abnormal discharge temperature trend recorded.',
  F12: 'Water circuit protection trip due to unstable flow conditions.',
  H59: 'Outdoor fan control feedback outside expected range.',
  H64: 'IPM thermal protection event detected.',
  H76: 'Pump protection logic triggered by low circulation.',
  F40: 'High pressure protection lockout recorded.',
  H75: 'Sensor mismatch across water-side temperature inputs.',
  H91: 'Thermistor out-of-range reading detected.',
  F22: 'Low pressure safety threshold breached.',
};

export const likelyCauses: Record<string, string[]> = {
  H62: ['Inverter board instability', 'Compressor winding imbalance'],
  H70: ['Loose communication harness', 'Intermittent PCB signal loss'],
  H90: ['Restricted refrigerant flow', 'Faulty discharge sensor'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  H62: ['Check compressor insulation resistance', 'Measure startup current profile'],
  H70: ['Verify bus voltage and continuity', 'Inspect connectors for moisture ingress'],
  H90: ['Log discharge and suction temperatures', 'Confirm expansion valve operation'],
};

export const expectedMeasurements: Record<string, string[]> = {
  H62: ['Startup current stable against nameplate range', 'Compressor insulation above 1 Mohm'],
  H70: ['Communication bus voltage stable', 'No intermittent continuity drops'],
  H90: ['Discharge temperature within manufacturer envelope', 'Suction superheat stable'],
};

export const repairRecommendations: Record<string, string[]> = {
  H62: ['Repair drive wiring', 'Replace inverter module if fault persists'],
  H70: ['Reseat communication loom', 'Replace damaged communication board'],
  H90: ['Replace failed sensor', 'Correct refrigerant charge after leak check'],
};

export const panasonicData: ManufacturerDataFile = {
  manufacturer: 'Panasonic',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'control PCB communication and thermistor consistency',
    commonComponents: ['outdoor inverter PCB', 'NTC thermistors', 'electronic expansion valve'],
    preferredTools: ['digital manifold gauge set', 'insulation resistance tester'],
  },
};

export default panasonicData;
