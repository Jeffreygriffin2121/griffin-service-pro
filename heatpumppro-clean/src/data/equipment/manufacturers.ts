import { ManufacturerCatalogueEntry } from '../../types/equipment';

export const equipmentManufacturers: ManufacturerCatalogueEntry[] = [
  { canonicalName: 'Panasonic', displayName: 'Panasonic', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Daikin', displayName: 'Daikin', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Mitsubishi Electric', displayName: 'Mitsubishi Electric', aliases: ['Mitsubishi'], availabilityStatus: 'available' },
  { canonicalName: 'Mitsubishi Heavy Industries', displayName: 'Mitsubishi Heavy Industries', aliases: ['Mitsubishi Heavy'], availabilityStatus: 'available' },
  { canonicalName: 'Samsung', displayName: 'Samsung', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'LG', displayName: 'LG', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Firebird', displayName: 'Firebird', aliases: ['Firebird Enviroair', 'Firebird Enviro Air'], availabilityStatus: 'available' },
  { canonicalName: 'Grant', displayName: 'Grant', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'NIBE', displayName: 'NIBE', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Worcester Bosch', displayName: 'Worcester Bosch', aliases: ['Worcester', 'WB'], availabilityStatus: 'available' },
  { canonicalName: 'Vaillant', displayName: 'Vaillant', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Viessmann', displayName: 'Viessmann', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Bosch', displayName: 'Bosch', aliases: ['Worcester Bosch'], availabilityStatus: 'available' },
  { canonicalName: 'Hitachi', displayName: 'Hitachi', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Stiebel Eltron', displayName: 'Stiebel Eltron', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Midea', displayName: 'Midea', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Aermec', displayName: 'Aermec', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'ACOND', displayName: 'ACOND', aliases: [], availabilityStatus: 'limited' },
  { canonicalName: 'Thermia', displayName: 'Thermia', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'CTC', displayName: 'CTC', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Dimplex', displayName: 'Dimplex', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Joule', displayName: 'Joule', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Warmflow', displayName: 'Warmflow', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Ideal', displayName: 'Ideal', aliases: [], availabilityStatus: 'limited' },
  { canonicalName: 'Unitherm', displayName: 'Unitherm', aliases: [], availabilityStatus: 'limited' },
  { canonicalName: 'Pipelife', displayName: 'Pipelife', aliases: [], availabilityStatus: 'limited' },
  { canonicalName: 'Clivet', displayName: 'Clivet', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Climaveneta', displayName: 'Climaveneta', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Carrier', displayName: 'Carrier', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Trane', displayName: 'Trane', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Toshiba', displayName: 'Toshiba', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Fujitsu', displayName: 'Fujitsu', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Lennox', displayName: 'Lennox', aliases: [], availabilityStatus: 'limited' },
  { canonicalName: 'Swegon', displayName: 'Swegon', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'IVT', displayName: 'IVT', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'IDM', displayName: 'IDM', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Atlantic', displayName: 'Atlantic', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'De Dietrich', displayName: 'De Dietrich', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Alpha Innotec', displayName: 'Alpha Innotec', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Kensa', displayName: 'Kensa', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'WaterFurnace', displayName: 'WaterFurnace', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Ecoforest', displayName: 'Ecoforest', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Ochsner', displayName: 'Ochsner', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Calorex', displayName: 'Calorex', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Dantherm', displayName: 'Dantherm', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Gree', displayName: 'Gree', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Haier', displayName: 'Haier', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Ariston', displayName: 'Ariston', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Immergas', displayName: 'Immergas', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Riello', displayName: 'Riello', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Baxi', displayName: 'Baxi', aliases: [], availabilityStatus: 'available' },
  { canonicalName: 'Other / Unknown', displayName: 'Other / Unknown', aliases: ['Other', 'Unknown'], availabilityStatus: 'unknown' },
];

export const manufacturerLabels = equipmentManufacturers.map((manufacturer) => ({
  label: manufacturer.aliases.length ? `${manufacturer.displayName} (${manufacturer.aliases.join(', ')})` : manufacturer.displayName,
  value: manufacturer.canonicalName,
}));

export const manufacturerLookup = equipmentManufacturers.reduce<Record<string, ManufacturerCatalogueEntry>>((acc, manufacturer) => {
  acc[manufacturer.canonicalName.toLowerCase()] = manufacturer;
  acc[manufacturer.displayName.toLowerCase()] = manufacturer;
  return acc;
}, {});

equipmentManufacturers.forEach((manufacturer) => {
  manufacturer.aliases.forEach((alias) => {
    const key = alias.toLowerCase();
    if (!manufacturerLookup[key]) {
      manufacturerLookup[key] = manufacturer;
    }
  });
});

export const normalizeManufacturerName = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  const direct = manufacturerLookup[trimmed.toLowerCase()];
  return direct?.canonicalName || trimmed;
};

export const findManufacturerByInput = (input: string): ManufacturerCatalogueEntry | undefined =>
  manufacturerLookup[input.trim().toLowerCase()];