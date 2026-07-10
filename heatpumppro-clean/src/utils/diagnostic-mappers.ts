import { FaultCode, Manufacturer, ManufacturerDataFile } from '../types/diagnostics';

const normalizeCode = (code: string) => code.trim().toUpperCase();

export const toManufacturer = (dataFile: ManufacturerDataFile): Manufacturer => {
  const diagnosticsByCode: Record<string, FaultCode> = {};

  Object.keys(dataFile.diagnostics).forEach((rawCode) => {
    const code = normalizeCode(rawCode);
    diagnosticsByCode[code] = {
      code,
      summary: dataFile.diagnostics[rawCode] || '',
      likelyCauses: dataFile.likelyCauses[rawCode] || dataFile.likelyCauses[code] || [],
      diagnosticProcedures:
        dataFile.diagnosticProcedures[rawCode] || dataFile.diagnosticProcedures[code] || [],
      expectedMeasurements:
        dataFile.expectedMeasurements[rawCode] || dataFile.expectedMeasurements[code] || [],
      repairRecommendations:
        dataFile.repairRecommendations[rawCode] || dataFile.repairRecommendations[code] || [],
    };
  });

  return {
    name: dataFile.manufacturer,
    models: dataFile.models.map((name) => ({
      name,
      faultCodes: dataFile.faultCodes[name] || [],
    })),
    diagnostics: diagnosticsByCode,
    profile: dataFile.profile,
  };
};
