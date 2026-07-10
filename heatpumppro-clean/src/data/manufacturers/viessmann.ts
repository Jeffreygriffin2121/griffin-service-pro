import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['VITOCAL 200-A', 'VITOCAL 222-S', 'VITOCAL 250-A'];

export const faultCodes: Record<string, string[]> = {
  'VITOCAL 200-A': ['A9', 'D3', 'EE'],
  'VITOCAL 222-S': ['0A', '0F', 'A7'],
  'VITOCAL 250-A': ['5D', 'A4', 'C2'],
};

export const diagnostics: Record<string, string> = {
  A9: 'High pressure operating limit exceeded.',
  D3: 'Communication conflict across system bus.',
  EE: 'Sensor plausibility error state.',
  '0A': 'Outdoor temperature sensor fault.',
  '0F': 'Defrost cycle did not complete.',
  A7: 'Compressor inverter protection event.',
  '5D': 'Flow switch not proving circulation.',
  A4: 'Low pressure protection threshold reached.',
  C2: 'Condenser temperature sensor fault.',
};

export const likelyCauses: Record<string, string[]> = {
  A9: ['Condenser airflow or water flow restriction', 'Pressure sensor drift'],
  D3: ['Bus wiring fault', 'Controller synchronization issue'],
  A7: ['Inverter thermal stress', 'Compressor overload'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  A9: ['Check pressure and condenser heat rejection', 'Confirm flow rates'],
  D3: ['Inspect bus topology and connectors', 'Verify module addressing'],
  A7: ['Capture inverter current trend', 'Check compressor mechanical condition'],
};

export const expectedMeasurements: Record<string, string[]> = {
  A9: ['Head pressure remains within design envelope'],
  D3: ['Communication bus stable with no dropouts'],
  A7: ['Drive temperature and current remain in limits'],
};

export const repairRecommendations: Record<string, string[]> = {
  A9: ['Correct restriction and validate transducer readings'],
  D3: ['Repair bus wiring and reinitialize modules'],
  A7: ['Resolve inverter cooling and compressor load issue'],
};

export const viessmannData: ManufacturerDataFile = {
  manufacturer: 'Viessmann',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'sensor plausibility and refrigerant-side operating envelope',
    commonComponents: ['sensor harness', 'expansion valve', 'compressor inverter board'],
    preferredTools: ['digital gauges', 'data logging thermometer'],
  },
};

export default viessmannData;
