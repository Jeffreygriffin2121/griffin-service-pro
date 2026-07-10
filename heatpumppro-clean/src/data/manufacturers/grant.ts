import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['AERONA3 R32 6KW', 'AERONA3 R32 10KW', 'AERONA3 R32 13KW'];

export const faultCodes: Record<string, string[]> = {
  'AERONA3 R32 6KW': ['E01', 'E03', 'E07', 'E12'],
  'AERONA3 R32 10KW': ['E02', 'E08', 'E11'],
  'AERONA3 R32 13KW': ['E04', 'E09', 'E13'],
};

export const diagnostics: Record<string, string> = {
  E01: 'Flow switch open condition detected.',
  E03: 'Discharge temperature protection event.',
  E07: 'Communication fault between controller and outdoor unit.',
  E12: 'Compressor overcurrent event.',
  E02: 'Low pressure safety event.',
  E08: 'Outdoor fan operation fault.',
  E11: 'Water outlet sensor abnormal reading.',
  E04: 'High pressure safety event.',
  E09: 'Defrost logic timeout.',
  E13: 'Input voltage protection event.',
};

export const likelyCauses: Record<string, string[]> = {
  E01: ['Pump underperformance', 'Air lock in water circuit'],
  E03: ['Sensor bias', 'High compression ratio condition'],
  E07: ['Harness damage', 'Controller communications failure'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  E01: ['Measure flow rate and pump differential', 'Bleed and repressurize hydraulic loop'],
  E03: ['Check discharge thermistor and refrigerant conditions', 'Review compressor loading'],
  E07: ['Validate comms cable continuity', 'Confirm terminal security'],
};

export const expectedMeasurements: Record<string, string[]> = {
  E01: ['Flow meets minimum controller threshold'],
  E03: ['Discharge temperature stable in design range'],
  E07: ['Stable communication signal without interruptions'],
};

export const repairRecommendations: Record<string, string[]> = {
  E01: ['Service or replace circulation pump'],
  E03: ['Repair sensor circuit or correct refrigerant condition'],
  E07: ['Repair communication wiring and retest'],
};

export const grantData: ManufacturerDataFile = {
  manufacturer: 'Grant',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'hydraulic flow conditions and backup heater sequencing',
    commonComponents: ['circulation pump', 'flow sensor', 'backup immersion control'],
    preferredTools: ['differential temperature meter', 'system pressure gauge'],
  },
};

export default grantData;
