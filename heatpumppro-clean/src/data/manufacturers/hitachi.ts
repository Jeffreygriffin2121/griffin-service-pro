import { ManufacturerDataFile } from '../../types/diagnostics';

export const models = ['YUTAKI S', 'YUTAKI M', 'YUTAKI S80'];

export const faultCodes: Record<string, string[]> = {
  'YUTAKI S': ['02', '05', '17', '38'],
  'YUTAKI M': ['03', '11', '24'],
  'YUTAKI S80': ['06', '19', '41'],
};

export const diagnostics: Record<string, string> = {
  '02': 'Outdoor coil temperature sensor fault.',
  '05': 'Compressor thermal protection event.',
  '17': 'Communication fault to indoor controller.',
  '38': 'High pressure protection event.',
  '03': 'Water outlet thermistor fault.',
  '11': 'Fan motor rotation fault.',
  '24': 'Low pressure protection event.',
  '06': 'Discharge sensor fault.',
  '19': 'Defrost logic timeout.',
  '41': 'Inverter communication fault.',
};

export const likelyCauses: Record<string, string[]> = {
  '05': ['Compressor overload', 'Inadequate cooling around inverter module'],
  '17': ['Communication loom interruption', 'Controller board issue'],
  '38': ['Heat rejection problem', 'Pressure sensor error'],
};

export const diagnosticProcedures: Record<string, string[]> = {
  '05': ['Measure compressor current and insulation', 'Check condenser and fan performance'],
  '17': ['Verify communication continuity and polarity', 'Inspect board connectors'],
  '38': ['Measure operating pressures and temperatures', 'Confirm adequate system flow'],
};

export const expectedMeasurements: Record<string, string[]> = {
  '05': ['Current profile within compressor limits'],
  '17': ['Stable communication without dropouts'],
  '38': ['Pressure values within operating range'],
};

export const repairRecommendations: Record<string, string[]> = {
  '05': ['Rectify overload cause and retest compressor'],
  '17': ['Repair communication wiring and update board if required'],
  '38': ['Correct flow/airflow issues and verify transducer operation'],
};

export const hitachiData: ManufacturerDataFile = {
  manufacturer: 'Hitachi',
  models,
  faultCodes,
  diagnostics,
  likelyCauses,
  diagnosticProcedures,
  expectedMeasurements,
  repairRecommendations,
  profile: {
    focus: 'defrost control and fan/compressor coordination',
    commonComponents: ['defrost sensor', 'outdoor fan motor', 'inverter power module'],
    preferredTools: ['multimeter', 'amp clamp'],
  },
};

export default hitachiData;
