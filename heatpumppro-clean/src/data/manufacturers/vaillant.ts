import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['AROTHERM PLUS', 'AROTHERM SPLIT', 'FLEXOTHERM'];

export const faultCodes: Record<string, string[]> = {
  'AROTHERM PLUS': ['F.022', 'F.028', 'F.732'],
  'AROTHERM SPLIT': ['F.010', 'F.111', 'F.788'],
  FLEXOTHERM: ['F.074', 'F.083', 'F.707'],
};

export const diagnostics: Record<string, string> = {
  'F.022': 'Low water pressure protection condition.',
  'F.028': 'Ignition sequence failed in auxiliary stage.',
  'F.732': 'Compressor lockout state active.',
  'F.010': 'Flow temperature sensor signal implausible.',
  'F.111': 'Return temperature sensor signal implausible.',
  'F.788': 'Outdoor communication fault.',
  'F.074': 'Water pressure sensor signal invalid.',
  'F.083': 'Temperature spread outside expected range.',
  'F.707': 'Defrost function did not complete correctly.',
};

export const likelyCauses: Record<string, string[]> = {
  'F.022': ['System pressure loss', 'Pressure transducer fault'],
  'F.788': ['Communication wiring issue', 'Controller fault'],
  'F.732': ['Compressor protection event', 'Inverter module stress'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  'F.022': ['Check sealed system pressure', 'Inspect for water leaks'],
  'F.788': ['Test communication continuity', 'Review error memory'],
  'F.732': ['Measure compressor current and insulation', 'Review inverter status data'],
};

export const expectedMeasurements: Record<string, string[]> = {
  'F.022': ['System pressure in recommended band'],
  'F.788': ['Communication signal stable'],
  'F.732': ['Compressor current and insulation within limits'],
};

export const repairRecommendations: Record<string, string[]> = {
  'F.022': ['Restore pressure and repair leaks'],
  'F.788': ['Repair comms harness or replace controller'],
  'F.732': ['Resolve compressor drive issue before reset'],
};

export const vaillantData: ManufacturerDataFile = {
  manufacturer: 'Vaillant',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'hydraulic module operation and control board error logging',
    commonComponents: ['hydraulic station', 'temperature sensors', 'system PCB'],
    preferredTools: ['manufacturer service menu access', 'contact thermometer'],
  },
};

export default vaillantData;
