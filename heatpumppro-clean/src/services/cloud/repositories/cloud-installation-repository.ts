import { supabase } from '../supabase-client';
import { getCurrentSession } from '../auth/auth-session-service';
import { InstallationRecord, InstallationRepository, InstallationUpsertInput } from './types';
import { normalizeManufacturerName } from '../../../data/equipment';

type InstallationRow = {
  id: string;
  company_id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  site_address?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  town_city?: string | null;
  county?: string | null;
  eircode?: string | null;
  manufacturer_entered?: string | null;
  heat_pump_brand?: string | null;
  model_family?: string | null;
  heat_pump_model?: string | null;
  exact_model_number?: string | null;
  serial_number?: string | null;
  outdoor_model?: string | null;
  indoor_model?: string | null;
  indoor_serial?: string | null;
  outdoor_serial?: string | null;
  controller_model?: string | null;
  capacity_kw?: number | string | null;
  electrical_phase?: string | null;
  voltage?: string | null;
  installer?: string | null;
  commission_date?: string | null;
  installation_date?: string | null;
  warranty_expiry?: string | null;
  system_type?: string | null;
  heat_source?: string | null;
  configuration_type?: string | null;
  refrigerant_charge_kg?: string | null;
  glycol_type?: string | null;
  glycol_percentage?: string | null;
  design_flow_temperature?: string | null;
  maximum_flow_temperature?: string | null;
  buffer_tank?: string | null;
  buffer_tank_size_litres?: string | null;
  cylinder_manufacturer?: string | null;
  cylinder_model?: string | null;
  cylinder_size_litres?: string | null;
  year_introduced?: string | null;
  firmware_version?: string | null;
  refrigerant?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  eircode_postcode?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  indoor_unit_serial?: string | null;
  outdoor_unit_serial?: string | null;
  installer_name?: string | null;
  install_date?: string | null;
  warranty_start?: string | null;
  unit_type?: string | null;
  status?: string | null;
  engineer_notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
};

const nowIso = () => new Date().toISOString();

const pick = (...values: Array<string | number | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value}`;
    }
  }

  return '';
};

const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const requireSession = async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error('Sign in required to manage installations.');
  }
  return session;
};

const mapRowToInstallation = (row: InstallationRow): InstallationRecord => {
  const customerName = row.customer_name || '';
  const customerPhone = row.customer_phone || row.phone || '';
  const customerEmail = row.customer_email || row.email || '';
  const siteAddress = row.site_address || row.address || '';
  const addressLine1 = row.address_line_1 || siteAddress;
  const addressLine2 = row.address_line_2 || '';
  const townCity = row.town_city || '';
  const county = row.county || '';
  const eircode = row.eircode || row.eircode_postcode || '';
  const manufacturerEntered = row.manufacturer_entered || row.heat_pump_brand || row.manufacturer || '';
  const manufacturer = normalizeManufacturerName(row.heat_pump_brand || row.manufacturer || manufacturerEntered);
  const modelFamily = row.model_family || row.heat_pump_model || row.model || '';
  const model = row.heat_pump_model || row.model || modelFamily;
  const exactModelNumber = row.exact_model_number || row.serial_number || '';
  const serialNumber = row.serial_number || '';
  const outdoorModel = row.outdoor_model || model;
  const indoorModel = row.indoor_model || model;
  const indoorSerial = row.indoor_serial || row.indoor_unit_serial || '';
  const outdoorSerial = row.outdoor_serial || row.outdoor_unit_serial || '';
  const controllerModel = row.controller_model || '';
  const capacityKw = row.capacity_kw ? `${row.capacity_kw}` : '';
  const electricalPhase = row.electrical_phase || '';
  const voltage = row.voltage || '';
  const installer = row.installer || row.installer_name || '';
  const commissionDate = row.commission_date || row.install_date || nowIso().slice(0, 10);
  const installationDate = row.installation_date || commissionDate;
  const warrantyExpiry = row.warranty_expiry || commissionDate;
  const systemType = row.system_type || row.unit_type || 'Heat Pump';
  const heatSource = row.heat_source || '';
  const configurationType = row.configuration_type || 'unknown';
  const bufferTank = row.buffer_tank || '';
  const bufferTankSizeLitres = row.buffer_tank_size_litres || '';
  const cylinderManufacturer = row.cylinder_manufacturer || '';
  const cylinderModel = row.cylinder_model || '';
  const cylinderSizeLitres = row.cylinder_size_litres || '';
  const refrigerantChargeKg = row.refrigerant_charge_kg || '';
  const glycolType = row.glycol_type || '';
  const glycolPercentage = row.glycol_percentage || '';
  const designFlowTemperature = row.design_flow_temperature || '';
  const maximumFlowTemperature = row.maximum_flow_temperature || '';
  const yearIntroduced = row.year_introduced || '';
  const firmwareVersion = row.firmware_version || '';
  const refrigerant = row.refrigerant || '';
  const notes = row.notes || row.engineer_notes || '';
  const createdAt = row.created_at || nowIso();
  const updatedAt = row.updated_at || createdAt;

  return {
    id: row.id,
    companyId: row.company_id,
    customerId: row.customer_id || undefined,
    manufacturerCanonical: manufacturer,
    customerName,
    customerPhone,
    customerEmail,
    siteAddress,
    addressLine1,
    addressLine2,
    townCity,
    county,
    eircode,
    manufacturerEntered,
    manufacturer,
    modelFamily,
    model,
    exactModelNumber,
    serialNumber,
    outdoorModel,
    indoorModel,
    indoorSerial,
    outdoorSerial,
    controllerModel,
    capacityKw,
    electricalPhase,
    voltage,
    installer,
    commissionDate,
    installationDate,
    warrantyExpiry,
    systemType,
    heatSource,
    configurationType,
    refrigerantChargeKg,
    glycolType,
    glycolPercentage,
    designFlowTemperature,
    maximumFlowTemperature,
    bufferTank,
    bufferTankSizeLitres,
    cylinderManufacturer,
    cylinderModel,
    cylinderSizeLitres,
    yearIntroduced,
    firmwareVersion,
    refrigerant,
    notes,
    createdAt,
    updatedAt,
    phone: customerPhone,
    email: customerEmail,
    address: siteAddress,
    eircodePostcode: eircode,
    heatPumpBrand: manufacturer,
    heatPumpModel: modelFamily,
    indoorUnitSerial: indoorSerial,
    outdoorUnitSerial: outdoorSerial,
    installerName: installer,
    installDate: installationDate,
    warrantyStart: row.warranty_start || commissionDate,
    unitType: systemType,
    status: row.status || 'Commissioned',
    engineerNotes: notes,
    createdBy: row.created_by || '',
    updatedBy: row.updated_by || '',
  };
};

const buildRowFromInput = (input: InstallationUpsertInput, companyId: string) => {
  const customerName = pick(input.customerName);
  const customerPhone = pick(input.customerPhone, input.phone);
  const customerEmail = pick(input.customerEmail, input.email);
  const siteAddress = pick(input.siteAddress, input.address);
  const addressLine1 = pick(input.addressLine1, siteAddress);
  const addressLine2 = pick(input.addressLine2);
  const townCity = pick(input.townCity);
  const county = pick(input.county);
  const eircode = pick(input.eircode, input.eircodePostcode);
  const manufacturerEntered = pick(input.manufacturerEntered, input.heatPumpBrand, input.manufacturer);
  const manufacturer = normalizeManufacturerName(pick(input.manufacturer, input.heatPumpBrand, manufacturerEntered));
  const modelFamily = pick(input.modelFamily, input.heatPumpModel, input.model);
  const model = pick(input.model, input.heatPumpModel, modelFamily);
  const exactModelNumber = pick(input.exactModelNumber, input.serialNumber);
  const serialNumber = pick(input.serialNumber, input.exactModelNumber);
  const outdoorModel = pick(input.outdoorModel, model);
  const indoorModel = pick(input.indoorModel, model);
  const indoorSerial = pick(input.indoorSerial, input.indoorUnitSerial);
  const outdoorSerial = pick(input.outdoorSerial, input.outdoorUnitSerial);
  const controllerModel = pick(input.controllerModel);
  const capacityKw = pick(input.capacityKw);
  const electricalPhase = pick(input.electricalPhase);
  const voltage = pick(input.voltage);
  const installer = pick(input.installer, input.installerName);
  const commissionDate = pick(input.commissionDate, input.installationDate, input.installDate, nowIso().slice(0, 10));
  const installationDate = pick(input.installationDate, input.commissionDate, input.installDate, commissionDate);
  const warrantyExpiry = pick(input.warrantyExpiry, input.warrantyStart, commissionDate);
  const systemType = pick(input.systemType, input.unitType, 'Heat Pump');
  const heatSource = pick(input.heatSource);
  const configurationType = pick(input.configurationType, 'unknown');
  const refrigerant = pick(input.refrigerant);
  const refrigerantChargeKg = pick(input.refrigerantChargeKg);
  const glycolType = pick(input.glycolType);
  const glycolPercentage = pick(input.glycolPercentage);
  const designFlowTemperature = pick(input.designFlowTemperature);
  const maximumFlowTemperature = pick(input.maximumFlowTemperature);
  const bufferTank = pick(input.bufferTank);
  const bufferTankSizeLitres = pick(input.bufferTankSizeLitres);
  const cylinderManufacturer = pick(input.cylinderManufacturer);
  const cylinderModel = pick(input.cylinderModel);
  const cylinderSizeLitres = pick(input.cylinderSizeLitres);
  const yearIntroduced = pick(input.yearIntroduced);
  const firmwareVersion = pick(input.firmwareVersion);
  const notes = pick(input.notes, input.engineerNotes);

  return {
    company_id: companyId,
    customer_id: input.customerId || null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    site_address: siteAddress,
    address_line_1: addressLine1,
    address_line_2: addressLine2,
    town_city: townCity,
    county,
    eircode,
    manufacturer_entered: manufacturerEntered,
    manufacturer,
    model_family: modelFamily,
    model,
    exact_model_number: exactModelNumber,
    serial_number: serialNumber,
    outdoor_model: outdoorModel,
    indoor_model: indoorModel,
    indoor_serial: indoorSerial,
    outdoor_serial: outdoorSerial,
    controller_model: controllerModel,
    capacity_kw: toNullableNumber(capacityKw),
    electrical_phase: electricalPhase,
    voltage,
    system_type: systemType,
    heat_source: heatSource,
    configuration_type: configurationType,
    refrigerant,
    refrigerant_charge_kg: toNullableNumber(refrigerantChargeKg),
    glycol_type: glycolType,
    glycol_percentage: toNullableNumber(glycolPercentage),
    design_flow_temperature: toNullableNumber(designFlowTemperature),
    maximum_flow_temperature: toNullableNumber(maximumFlowTemperature),
    buffer_tank: bufferTank,
    buffer_tank_size_litres: toNullableNumber(bufferTankSizeLitres),
    cylinder_manufacturer: cylinderManufacturer,
    cylinder_model: cylinderModel,
    cylinder_size_litres: toNullableNumber(cylinderSizeLitres),
    installer,
    commission_date: commissionDate,
    installation_date: installationDate,
    warranty_expiry: warrantyExpiry,
    year_introduced: toNullableNumber(yearIntroduced),
    firmware_version: firmwareVersion,
    notes,
    created_by: input.createdBy || '',
    updated_by: input.updatedBy || '',
  };
};

export const cloudInstallationRepository: InstallationRepository = {
  listInstallations: async () => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('installations')
      .select('*')
      .eq('company_id', session.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row) => mapRowToInstallation(row as InstallationRow));
  },
  getInstallationById: async (installationId) => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('installations')
      .select('*')
      .eq('company_id', session.companyId)
      .eq('id', installationId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapRowToInstallation(data as InstallationRow) : undefined;
  },
  createInstallation: async (input) => {
    const session = await requireSession();
    const row = buildRowFromInput({ ...input, createdBy: session.userId, updatedBy: session.userId }, session.companyId);
    const { data, error } = await supabase.from('installations').insert(row).select('*').single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRowToInstallation(data as InstallationRow);
  },
  updateInstallation: async (installationId, updates) => {
    const session = await requireSession();
    const row = buildRowFromInput({ ...updates, updatedBy: session.userId }, session.companyId);
    const { data, error } = await supabase
      .from('installations')
      .update(row)
      .eq('company_id', session.companyId)
      .eq('id', installationId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapRowToInstallation(data as InstallationRow) : undefined;
  },
  deleteInstallation: async (installationId) => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('installations')
      .delete()
      .eq('company_id', session.companyId)
      .eq('id', installationId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return Boolean(data);
  },
  startServiceVisit: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  saveServiceVisitDraft: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  completeServiceVisit: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  listServiceVisits: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  addPhoto: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  removePhoto: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  listPhotos: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  setPhotoIncludeInReport: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  addEngineerNote: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  addFaultRecord: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  addVerifiedFix: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  listVerifiedFixes: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  addPartReplacement: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  saveReport: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  listReports: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  saveAiDiagnostic: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  listAiDiagnostics: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
  getEquipmentPassport: async () => { throw new Error('Cloud repository is not configured yet. Falling back to local-demo mode is recommended.'); },
};
