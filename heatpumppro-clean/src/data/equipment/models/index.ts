import {
  CatalogueAvailabilityStatus,
  CatalogueConfigurationType,
  CatalogueElectricalPhase,
  HeatPumpModelCatalogueEntry,
  ModelFamilyCatalogueEntry,
} from '../../../types/equipment';
import { normalizeManufacturerName } from '../manufacturers';

const buildModel = (
  manufacturer: string,
  modelFamily: string,
  exactModel: string,
  availabilityStatus: CatalogueAvailabilityStatus = 'unknown',
  aliases: string[] = [],
): HeatPumpModelCatalogueEntry => ({
  manufacturer,
  modelFamily,
  exactModel,
  capacityKw: null,
  refrigerant: null,
  configurationType: 'unknown' as CatalogueConfigurationType,
  electricalPhase: 'unknown' as CatalogueElectricalPhase,
  voltage: null,
  maximumFlowTemperature: null,
  scop: null,
  soundData: null,
  yearIntroduced: null,
  serviceManualReference: null,
  installerManualReference: null,
  wiringDiagramReference: null,
  sparePartsReference: null,
  faultCodeReference: null,
  commissioningChecklistReference: null,
  firmwareNotes: null,
  discontinued: false,
  availabilityStatus,
  aliases,
  technicalNotes: null,
});

const family = (manufacturer: string, familyName: string, aliases: string[] = []): ModelFamilyCatalogueEntry => ({
  manufacturer: normalizeManufacturerName(manufacturer),
  familyName,
  aliases,
  availabilityStatus: 'unknown',
  exactModels: [
    buildModel(normalizeManufacturerName(manufacturer), familyName, 'Other model'),
    buildModel(normalizeManufacturerName(manufacturer), familyName, 'Unknown model'),
  ],
});

const familiesByManufacturer: ModelFamilyCatalogueEntry[] = [
  family('Panasonic', 'Aquarea J Generation'),
  family('Panasonic', 'Aquarea K Generation'),
  family('Panasonic', 'Aquarea L Generation'),
  family('Panasonic', 'Aquarea M Generation'),
  family('Panasonic', 'Aquarea T-CAP J Generation'),
  family('Panasonic', 'Aquarea T-CAP K Generation'),
  family('Panasonic', 'Aquarea High Performance'),
  family('Panasonic', 'Aquarea All-in-One'),
  family('Panasonic', 'Aquarea Monobloc'),
  family('Panasonic', 'Other Panasonic model'),
  family('Panasonic', 'Other model'),
  family('Panasonic', 'Unknown model'),

  family('Daikin', 'Altherma 3'),
  family('Daikin', 'Altherma 3 H HT'),
  family('Daikin', 'Altherma 3 M'),
  family('Daikin', 'Altherma 4'),
  family('Daikin', 'Altherma Monobloc'),
  family('Daikin', 'Altherma Split'),
  family('Daikin', 'Altherma Ground Source'),
  family('Daikin', 'Other Daikin model'),
  family('Daikin', 'Other model'),
  family('Daikin', 'Unknown model'),

  family('Mitsubishi Electric', 'Ecodan'),
  family('Mitsubishi Electric', 'Ecodan R32'),
  family('Mitsubishi Electric', 'Ecodan R290'),
  family('Mitsubishi Electric', 'Ecodan Hydrobox'),
  family('Mitsubishi Electric', 'Ecodan Cylinder Unit'),
  family('Mitsubishi Electric', 'Other Mitsubishi Electric model'),
  family('Mitsubishi Electric', 'Other model'),
  family('Mitsubishi Electric', 'Unknown model'),

  family('Samsung', 'EHS Mono'),
  family('Samsung', 'EHS Mono HT Quiet'),
  family('Samsung', 'EHS Split'),
  family('Samsung', 'EHS TDM Plus'),
  family('Samsung', 'ClimateHub'),
  family('Samsung', 'Other Samsung model'),
  family('Samsung', 'Other model'),
  family('Samsung', 'Unknown model'),

  family('LG', 'Therma V Monobloc'),
  family('LG', 'Therma V Split'),
  family('LG', 'Therma V R32'),
  family('LG', 'Therma V R290'),
  family('LG', 'Therma V High Temperature'),
  family('LG', 'Other LG model'),
  family('LG', 'Other model'),
  family('LG', 'Unknown model'),

  family('Firebird', 'Enviroair', ['Enviro Air']),
  family('Firebird', 'Enviro Air', ['Enviroair']),
  family('Firebird', 'Enviroair Monobloc'),
  family('Firebird', 'Enviroair Compact'),
  family('Firebird', 'Enviroair 7 kW'),
  family('Firebird', 'Enviroair 9 kW'),
  family('Firebird', 'Enviroair 11 kW'),
  family('Firebird', 'Enviroair 14 kW'),
  family('Firebird', 'Enviroair 16 kW'),
  family('Firebird', 'Enviroair 18 kW'),
  family('Firebird', 'Other Firebird model'),
  family('Firebird', 'Other model'),
  family('Firebird', 'Unknown model'),

  family('Grant', 'Aerona'),
  family('Grant', 'Aerona³'),
  family('Grant', 'Aerona 290'),
  family('Grant', 'Other Grant model'),
  family('Grant', 'Other model'),
  family('Grant', 'Unknown model'),

  family('NIBE', 'F2040'),
  family('NIBE', 'F2120'),
  family('NIBE', 'S2125'),
  family('NIBE', 'F1145'),
  family('NIBE', 'F1155'),
  family('NIBE', 'F1245'),
  family('NIBE', 'F1255'),
  family('NIBE', 'Other NIBE model'),
  family('NIBE', 'Other model'),
  family('NIBE', 'Unknown model'),

  family('Vaillant', 'aroTHERM'),
  family('Vaillant', 'aroTHERM Plus'),
  family('Vaillant', 'aroTHERM Split'),
  family('Vaillant', 'flexoTHERM'),
  family('Vaillant', 'geoTHERM'),
  family('Vaillant', 'Other Vaillant model'),
  family('Vaillant', 'Other model'),
  family('Vaillant', 'Unknown model'),

  family('Viessmann', 'Vitocal 100'),
  family('Viessmann', 'Vitocal 150'),
  family('Viessmann', 'Vitocal 200'),
  family('Viessmann', 'Vitocal 222'),
  family('Viessmann', 'Vitocal 250'),
  family('Viessmann', 'Vitocal 300'),
  family('Viessmann', 'Other Viessmann model'),
  family('Viessmann', 'Other model'),
  family('Viessmann', 'Unknown model'),

  family('Bosch', 'Compress 2000'),
  family('Bosch', 'Compress 3000'),
  family('Bosch', 'Compress 5000'),
  family('Bosch', 'Compress 5800i'),
  family('Bosch', 'Compress 7000'),
  family('Bosch', 'Other Bosch model'),
  family('Bosch', 'Other model'),
  family('Bosch', 'Unknown model'),

  family('Aermec', 'Other Aermec model'),
  family('Aermec', 'Other model'),
  family('Aermec', 'Unknown model'),

  family('Hitachi', 'Yutaki S'),
  family('Hitachi', 'Yutaki S Combi'),
  family('Hitachi', 'Yutaki M'),
  family('Hitachi', 'Yutaki S80'),
  family('Hitachi', 'Other Hitachi model'),
  family('Hitachi', 'Other model'),
  family('Hitachi', 'Unknown model'),

  family('Stiebel Eltron', 'WPL'),
  family('Stiebel Eltron', 'WPL-A'),
  family('Stiebel Eltron', 'WPL Classic'),
  family('Stiebel Eltron', 'WPF'),
  family('Stiebel Eltron', 'Other Stiebel Eltron model'),
  family('Stiebel Eltron', 'Other model'),
  family('Stiebel Eltron', 'Unknown model'),

  family('Midea', 'M-Thermal'),
  family('Midea', 'M-Thermal Arctic'),
  family('Midea', 'M-Thermal Monobloc'),
  family('Midea', 'M-Thermal Split'),
  family('Midea', 'Other Midea model'),
  family('Midea', 'Other model'),
  family('Midea', 'Unknown model'),

  family('Lennox', 'Other Lennox model'),
  family('Lennox', 'Other model'),
  family('Lennox', 'Unknown model'),

  family('Swegon', 'Other Swegon model'),
  family('Swegon', 'Other model'),
  family('Swegon', 'Unknown model'),

  family('IVT', 'Other IVT model'),
  family('IVT', 'Other model'),
  family('IVT', 'Unknown model'),

  family('IDM', 'Other IDM model'),
  family('IDM', 'Other model'),
  family('IDM', 'Unknown model'),

  family('ACOND', 'Grandis'),
  family('ACOND', 'PRO'),
  family('ACOND', 'Other ACOND model'),
  family('ACOND', 'Other model'),
  family('ACOND', 'Unknown model'),

  family('Thermia', 'Atlas'),
  family('Thermia', 'Calibra'),
  family('Thermia', 'Diplomat'),
  family('Thermia', 'iTec'),
  family('Thermia', 'Other Thermia model'),
  family('Thermia', 'Other model'),
  family('Thermia', 'Unknown model'),

  family('CTC', 'EcoAir'),
  family('CTC', 'EcoPart'),
  family('CTC', 'EcoHeat'),
  family('CTC', 'Other CTC model'),
  family('CTC', 'Other model'),
  family('CTC', 'Unknown model'),

  family('Warmflow', 'Zeno'),
  family('Warmflow', 'Other Warmflow model'),
  family('Warmflow', 'Other model'),
  family('Warmflow', 'Unknown model'),

  family('Ideal', 'Logic Air'),
  family('Ideal', 'Other Ideal model'),
  family('Ideal', 'Other model'),
  family('Ideal', 'Unknown model'),

  family('Mitsubishi Heavy Industries', 'SRK / SRC'),
  family('Mitsubishi Heavy Industries', 'FDK / FDC'),
  family('Mitsubishi Heavy Industries', 'Other Mitsubishi Heavy Industries model'),
  family('Mitsubishi Heavy Industries', 'Other model'),
  family('Mitsubishi Heavy Industries', 'Unknown model'),

  family('Dimplex', 'LA / LI'),
  family('Dimplex', 'Other Dimplex model'),
  family('Dimplex', 'Other model'),
  family('Dimplex', 'Unknown model'),

  family('De Dietrich', 'Kalista'),
  family('De Dietrich', 'Other De Dietrich model'),
  family('De Dietrich', 'Other model'),
  family('De Dietrich', 'Unknown model'),

  family('Alpha Innotec', 'LW / LA'),
  family('Alpha Innotec', 'Other Alpha Innotec model'),
  family('Alpha Innotec', 'Other model'),
  family('Alpha Innotec', 'Unknown model'),

  family('Kensa', 'Guardian'),
  family('Kensa', 'Compact'),
  family('Kensa', 'Other Kensa model'),
  family('Kensa', 'Other model'),
  family('Kensa', 'Unknown model'),

  family('WaterFurnace', 'Envision'),
  family('WaterFurnace', 'Aurora'),
  family('WaterFurnace', 'Other WaterFurnace model'),
  family('WaterFurnace', 'Other model'),
  family('WaterFurnace', 'Unknown model'),

  family('Ecoforest', 'Aerothermal'),
  family('Ecoforest', 'Geothermal'),
  family('Ecoforest', 'Other Ecoforest model'),
  family('Ecoforest', 'Other model'),
  family('Ecoforest', 'Unknown model'),

  family('Ochsner', 'Air / Ground'),
  family('Ochsner', 'Combi Hybrid'),
  family('Ochsner', 'Other Ochsner model'),
  family('Ochsner', 'Other model'),
  family('Ochsner', 'Unknown model'),

  family('Calorex', 'DH / DS series'),
  family('Calorex', 'Other Calorex model'),
  family('Calorex', 'Other model'),
  family('Calorex', 'Unknown model'),

  family('Dantherm', 'CHA Compact'),
  family('Dantherm', 'Other Dantherm model'),
  family('Dantherm', 'Other model'),
  family('Dantherm', 'Unknown model'),

  family('Gree', 'GWHC Air Source'),
  family('Gree', 'GWCS Ground Source'),
  family('Gree', 'Other Gree model'),
  family('Gree', 'Other model'),
  family('Gree', 'Unknown model'),

  family('Haier', 'Flexis'),
  family('Haier', 'Tibro'),
  family('Haier', 'Other Haier model'),
  family('Haier', 'Other model'),
  family('Haier', 'Unknown model'),

  family('Ariston', 'Nimbus Flex'),
  family('Ariston', 'Other Ariston model'),
  family('Ariston', 'Other model'),
  family('Ariston', 'Unknown model'),

  family('Immergas', 'Magis Pro'),
  family('Immergas', 'Other Immergas model'),
  family('Immergas', 'Other model'),
  family('Immergas', 'Unknown model'),

  family('Riello', 'Sentinella'),
  family('Riello', 'Other Riello model'),
  family('Riello', 'Other model'),
  family('Riello', 'Unknown model'),

  family('Baxi', 'Heat'),
  family('Baxi', 'Other Baxi model'),
  family('Baxi', 'Other model'),
  family('Baxi', 'Unknown model'),
];

export const equipmentModelFamilies = familiesByManufacturer;

export const equipmentModels = familiesByManufacturer.flatMap((item) => item.exactModels);

export const getModelFamiliesForManufacturer = (manufacturerName: string): ModelFamilyCatalogueEntry[] => {
  const normalized = normalizeManufacturerName(manufacturerName).toLowerCase();
  return equipmentModelFamilies.filter((familyEntry) => familyEntry.manufacturer.toLowerCase() === normalized);
};

export const getModelsForManufacturer = (manufacturerName: string): HeatPumpModelCatalogueEntry[] => {
  const normalized = normalizeManufacturerName(manufacturerName).toLowerCase();
  return equipmentModels.filter((model) => model.manufacturer.toLowerCase() === normalized);
};

export const getModelsForFamily = (manufacturerName: string, familyName: string): HeatPumpModelCatalogueEntry[] => {
  const normalized = normalizeManufacturerName(manufacturerName).toLowerCase();
  return equipmentModels.filter(
    (model) => model.manufacturer.toLowerCase() === normalized && model.modelFamily.toLowerCase() === familyName.toLowerCase(),
  );
};