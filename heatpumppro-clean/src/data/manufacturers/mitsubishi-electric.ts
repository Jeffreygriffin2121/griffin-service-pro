import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['ECODAN PUZ-WM', 'ECODAN FTC6', 'ECODAN CYLINDER PACK'];

export const faultCodes: Record<string, string[]> = {
  'ECODAN PUZ-WM': ['P8', 'P9', 'U1', 'U8'],
  'ECODAN FTC6': ['L9', 'P1', 'P6', 'U4'],
  'ECODAN CYLINDER PACK': ['P5', 'P7', 'U2'],
};

export const diagnostics: Record<string, string> = {
  P8: 'Compressor discharge temperature high condition.',
  P9: 'Low pressure protection operation.',
  U1: 'Power supply irregularity detected.',
  U8: 'Communication fault with indoor controller.',
  L9: 'Inverter module overcurrent protection event.',
  P1: 'Outdoor fan rotational feedback abnormality.',
  P6: 'Heat exchanger sensor input error.',
  U4: 'Signal communication timeout.',
  P5: 'Water flow protection trigger.',
  P7: 'Defrost termination abnormality.',
  U2: 'Voltage imbalance protection event.',
};

export const likelyCauses: Record<string, string[]> = {
  P8: ['Reduced refrigerant flow', 'Faulty temperature sensor'],
  L9: ['Inverter drive stress', 'Compressor loading issue'],
  U8: ['Cable continuity fault', 'Indoor board communication failure'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  P8: ['Check discharge thermistor values', 'Review refrigerant operating conditions'],
  L9: ['Capture compressor current profile', 'Inspect inverter module cooling'],
  U8: ['Check communication line continuity', 'Inspect board terminals'],
};

export const expectedMeasurements: Record<string, string[]> = {
  P8: ['Discharge temperature within service manual limits'],
  L9: ['Current draw stable during ramp-up'],
  U8: ['Stable communication signal and voltage'],
};

export const repairRecommendations: Record<string, string[]> = {
  P8: ['Replace failed sensor or correct refrigerant condition'],
  L9: ['Replace damaged inverter components after verification'],
  U8: ['Repair harness and confirm clean communication'],
};

export const mitsubishiElectricData: ManufacturerDataFile = {
  manufacturer: 'Mitsubishi Electric',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'outdoor board diagnostics and thermistor health',
    commonComponents: ['outdoor control board', 'flow temperature sensor', 'compressor drive module'],
    preferredTools: ['megohmmeter', 'true RMS multimeter'],
  },
};

export default mitsubishiElectricData;
