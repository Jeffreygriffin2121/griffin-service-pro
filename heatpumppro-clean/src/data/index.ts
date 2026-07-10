import { Manufacturer, ManufacturerDataFile } from '../types/diagnostics';
import { toManufacturer } from '../utils/diagnostic-mappers';

type ManufacturerModule = {
  default: ManufacturerDataFile;
};

// Architecture note:
// The data layer auto-loads manufacturer modules from /data/manufacturers.
// Adding a new manufacturer only requires creating one new file that default-exports ManufacturerDataFile.
const manufacturerContext = require.context('./manufacturers', false, /\.ts$/);

const manufacturerDataList: Manufacturer[] = manufacturerContext
  .keys()
  .map((key) => manufacturerContext(key) as ManufacturerModule)
  .filter((module) => module.default)
  .map((module) => toManufacturer(module.default));

export const manufacturerDataByName: Record<string, Manufacturer> = manufacturerDataList.reduce<
  Record<string, Manufacturer>
>((acc, item) => {
  acc[item.name] = item;
  return acc;
}, {});

export const getManufacturerByName = (manufacturerName: string): Manufacturer | undefined =>
  manufacturerDataByName[manufacturerName];

export const manufacturers = [...manufacturerDataList.map((item) => item.name), 'Other'];

export const defaultProfile = {
  focus: 'sensor readings, wiring integrity, and compressor protection circuits',
  commonComponents: ['control board', 'temperature sensors', 'pressure devices'],
  preferredTools: ['true RMS multimeter', 'temperature probe kit'],
};
