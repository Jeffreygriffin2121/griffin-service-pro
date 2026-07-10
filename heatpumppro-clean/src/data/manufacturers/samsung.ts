import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['EHS MONO HT QUIET', 'EHS SPLIT', 'EHS TDM PLUS'];

export const faultCodes: Record<string, string[]> = {
  'EHS MONO HT QUIET': ['E101', 'E201', 'E458', 'E554'],
  'EHS SPLIT': ['E121', 'E202', 'E422'],
  'EHS TDM PLUS': ['E416', 'E451', 'E552'],
};

export const diagnostics: Record<string, string> = {
  E101: 'Water inlet sensor reporting outside expected limits.',
  E201: 'Outdoor unit communication timeout detected.',
  E458: 'Compressor frequency control excursion detected.',
  E554: 'Inverter drive protection trip registered.',
  E121: 'Indoor heat exchanger sensor mismatch.',
  E202: 'Communication checksum errors observed.',
  E422: 'Fan motor feedback unavailable.',
  E416: 'Low water flow protection event.',
  E451: 'High pressure protection event.',
  E552: 'Compressor overcurrent event logged.',
};

export const likelyCauses: Record<string, string[]> = {
  E101: ['Sensor drift', 'Harness resistance increase'],
  E201: ['Loose comms cable', 'Main PCB noise interference'],
  E458: ['Inverter cooling issue', 'Compressor mechanical drag'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  E101: ['Check sensor resistance at ambient', 'Compare to service table values'],
  E201: ['Test communication line continuity', 'Confirm board grounding quality'],
  E458: ['Capture compressor current and frequency trend', 'Inspect inverter heat sink airflow'],
};

export const expectedMeasurements: Record<string, string[]> = {
  E101: ['Sensor resistance within table tolerance'],
  E201: ['Stable communication voltage and no packet loss'],
  E458: ['Current ramp smooth with no spikes outside limits'],
};

export const repairRecommendations: Record<string, string[]> = {
  E101: ['Replace failed sensor and retest'],
  E201: ['Repair harness or replace communication PCB'],
  E458: ['Address cooling obstruction and verify compressor condition'],
};

export const samsungData: ManufacturerDataFile = {
  manufacturer: 'Samsung',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'communication bus integrity and compressor frequency control',
    commonComponents: ['main PCB', 'communication harness', 'inverter compressor module'],
    preferredTools: ['oscilloscope or signal probe', 'service app or commissioning tool'],
  },
};

export default samsungData;
