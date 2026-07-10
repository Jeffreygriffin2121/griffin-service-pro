import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['F2040', 'F2120', 'S2125'];

export const faultCodes: Record<string, string[]> = {
  F2040: ['ALARM 163', 'ALARM 251', 'ALARM 291'],
  F2120: ['ALARM 160', 'ALARM 183', 'ALARM 229'],
  S2125: ['ALARM 162', 'ALARM 184', 'ALARM 221'],
};

export const diagnostics: Record<string, string> = {
  'ALARM 163': 'Compressor discharge temperature alarm state.',
  'ALARM 251': 'Communication fault in system bus.',
  'ALARM 291': 'Flow protection due to insufficient circulation.',
  'ALARM 160': 'Low pressure protection operation.',
  'ALARM 183': 'High pressure protection operation.',
  'ALARM 229': 'Sensor value implausibility detected.',
  'ALARM 162': 'Compressor start blocked by protection logic.',
  'ALARM 184': 'Condenser sensor error state.',
  'ALARM 221': 'Power supply anomaly event.',
};

export const likelyCauses: Record<string, string[]> = {
  'ALARM 163': ['Restricted refrigerant flow', 'Sensor calibration issue'],
  'ALARM 251': ['Wiring continuity fault', 'Controller bus instability'],
  'ALARM 291': ['Pump performance issue', 'Air in hydraulic circuit'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  'ALARM 163': ['Check refrigerant circuit temperatures', 'Verify thermistor readings'],
  'ALARM 251': ['Test bus continuity and terminal condition', 'Review controller event logs'],
  'ALARM 291': ['Measure system flow and pressure drop', 'Bleed circuit and retest'],
};

export const expectedMeasurements: Record<string, string[]> = {
  'ALARM 163': ['Discharge temperature remains in operating envelope'],
  'ALARM 251': ['Communication bus remains stable under load'],
  'ALARM 291': ['Flow rate meets minimum design threshold'],
};

export const repairRecommendations: Record<string, string[]> = {
  'ALARM 163': ['Repair sensor/refrigerant issues and verify'],
  'ALARM 251': ['Restore bus integrity and replace faulty module if needed'],
  'ALARM 291': ['Service pump and remove trapped air'],
};

export const nibeData: ManufacturerDataFile = {
  manufacturer: 'NIBE',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'brine/water temperature readings and compressor protection logic',
    commonComponents: ['brine sensors', 'compressor contactor', 'safety pressure switch'],
    preferredTools: ['probe thermometer set', 'electrical tester'],
  },
};

export default nibeData;
