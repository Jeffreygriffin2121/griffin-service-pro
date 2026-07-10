import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['ALTHERMA 3', 'ALTHERMA 3 H HT', 'ALTHERMA MONOBLOC'];

export const faultCodes: Record<string, string[]> = {
  'ALTHERMA 3': ['U0', 'U2', 'E6', 'L5'],
  'ALTHERMA 3 H HT': ['E7', 'H6', 'J3', 'U4'],
  'ALTHERMA MONOBLOC': ['A1', 'A3', 'C4', 'U9'],
};

export const diagnostics: Record<string, string> = {
  U0: 'Low refrigerant protection logic active.',
  U2: 'Supply voltage protection event.',
  E6: 'Compressor startup abnormality detected.',
  L5: 'Inverter overcurrent protection active.',
  E7: 'Outdoor fan operation fault.',
  H6: 'Compressor position detection issue.',
  J3: 'Discharge pipe temperature sensor fault.',
  U4: 'Indoor to outdoor communication fault.',
  A1: 'Main PCB control fault.',
  A3: 'Drain or flow related protection state.',
  C4: 'Heat exchanger sensor fault.',
  U9: 'Field setting mismatch or data conflict.',
};

export const likelyCauses: Record<string, string[]> = {
  U0: ['Refrigerant loss', 'Restricted metering device'],
  L5: ['IPM stress condition', 'Compressor current spike'],
  U4: ['Communication loom issue', 'Terminal oxidation'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  U0: ['Check pressure readings and superheat', 'Perform leak inspection'],
  L5: ['Measure inverter output current', 'Inspect compressor windings'],
  U4: ['Verify polarity and continuity of communication line', 'Inspect PCB terminals'],
};

export const expectedMeasurements: Record<string, string[]> = {
  U0: ['Suction and discharge pressures align with ambient conditions'],
  L5: ['Current draw within compressor envelope'],
  U4: ['No dropouts on communication line'],
};

export const repairRecommendations: Record<string, string[]> = {
  U0: ['Repair leaks and recharge to specification'],
  L5: ['Replace damaged inverter module after validation'],
  U4: ['Repair or replace communication harness'],
};

export const daikinData: ManufacturerDataFile = {
  manufacturer: 'Daikin',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'refrigerant circuit stability and sensor calibration',
    commonComponents: ['pressure transducers', 'fan motor module', 'four-way valve'],
    preferredTools: ['clamp meter with inrush capture', 'temperature probe kit'],
  },
};

export default daikinData;
