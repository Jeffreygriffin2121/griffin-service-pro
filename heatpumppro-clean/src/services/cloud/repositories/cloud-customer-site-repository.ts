import { getCurrentSession } from '../auth/auth-session-service';
import { supabase } from '../supabase-client';
import { CustomerFormValues, CustomerRecord, CustomerSiteRepository, SiteFormValues, SiteRecord } from './types';

const nowIso = () => new Date().toISOString();

type CustomerRow = {
  id: string;
  company_id: string;
  customer_type?: string | null;
  title?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  primary_email?: string | null;
  secondary_email?: string | null;
  primary_phone?: string | null;
  secondary_phone?: string | null;
  billing_address_line_1?: string | null;
  billing_address_line_2?: string | null;
  billing_town?: string | null;
  billing_county?: string | null;
  billing_eircode?: string | null;
  notes?: string | null;
  preferred_contact_method?: string | null;
  marketing_consent?: boolean | null;
  active?: boolean | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  customer_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  eircode_postcode?: string | null;
};

type SiteRow = {
  id: string;
  company_id: string;
  customer_id: string;
  site_name?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  town?: string | null;
  county?: string | null;
  eircode?: string | null;
  country?: string | null;
  access_instructions?: string | null;
  parking_notes?: string | null;
  gate_code?: string | null;
  key_safe_code?: string | null;
  property_type?: string | null;
  occupancy_type?: string | null;
  bedrooms?: number | string | null;
  floor_area_m2?: number | string | null;
  construction_year?: number | string | null;
  insulation_notes?: string | null;
  heating_distribution?: string | null;
  site_notes?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  active?: boolean | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const requireSession = async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error('Sign in required to manage customers and sites.');
  }
  return session;
};

const pick = (...values: Array<string | null | undefined>) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

const customerDisplayName = (values: {
  firstName: string;
  lastName: string;
  companyName: string;
}) => {
  const person = `${values.firstName} ${values.lastName}`.trim();
  return person || values.companyName.trim() || 'Unnamed Customer';
};

const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapCustomerRow = (row: CustomerRow): CustomerRecord => {
  const firstName = pick(row.first_name);
  const lastName = pick(row.last_name);
  const companyName = pick(row.company_name);
  const customerName = pick(row.customer_name, `${firstName} ${lastName}`.trim(), companyName);

  return {
    id: row.id,
    companyId: row.company_id,
    customerType: (row.customer_type as CustomerRecord['customerType']) || 'domestic',
    title: pick(row.title),
    firstName,
    lastName,
    companyName,
    primaryEmail: pick(row.primary_email, row.email),
    secondaryEmail: pick(row.secondary_email),
    primaryPhone: pick(row.primary_phone, row.phone),
    secondaryPhone: pick(row.secondary_phone),
    billingAddressLine1: pick(row.billing_address_line_1, row.address),
    billingAddressLine2: pick(row.billing_address_line_2),
    billingTown: pick(row.billing_town),
    billingCounty: pick(row.billing_county),
    billingEircode: pick(row.billing_eircode, row.eircode_postcode),
    notes: pick(row.notes),
    preferredContactMethod: pick(row.preferred_contact_method),
    marketingConsent: Boolean(row.marketing_consent),
    active: row.active !== false,
    customerName,
    createdBy: pick(row.created_by),
    createdAt: row.created_at || nowIso(),
    updatedAt: row.updated_at || row.created_at || nowIso(),
  };
};

const mapSiteRow = (row: SiteRow): SiteRecord => ({
  id: row.id,
  companyId: row.company_id,
  customerId: row.customer_id,
  siteName: pick(row.site_name),
  addressLine1: pick(row.address_line_1),
  addressLine2: pick(row.address_line_2),
  town: pick(row.town),
  county: pick(row.county),
  eircode: pick(row.eircode),
  country: pick(row.country) || 'Ireland',
  accessInstructions: pick(row.access_instructions),
  parkingNotes: pick(row.parking_notes),
  gateCode: pick(row.gate_code),
  keySafeCode: pick(row.key_safe_code),
  propertyType: pick(row.property_type),
  occupancyType: pick(row.occupancy_type),
  bedrooms: row.bedrooms == null ? '' : `${row.bedrooms}`,
  floorAreaM2: row.floor_area_m2 == null ? '' : `${row.floor_area_m2}`,
  constructionYear: row.construction_year == null ? '' : `${row.construction_year}`,
  insulationNotes: pick(row.insulation_notes),
  heatingDistribution: pick(row.heating_distribution),
  siteNotes: pick(row.site_notes),
  latitude: row.latitude == null ? '' : `${row.latitude}`,
  longitude: row.longitude == null ? '' : `${row.longitude}`,
  active: row.active !== false,
  createdBy: pick(row.created_by),
  createdAt: row.created_at || nowIso(),
  updatedAt: row.updated_at || row.created_at || nowIso(),
});

const toCustomerRow = (values: CustomerFormValues, companyId: string, userId: string) => {
  const customerName = customerDisplayName(values);

  return {
    company_id: companyId,
    customer_type: values.customerType,
    title: values.title.trim() || null,
    first_name: values.firstName.trim() || null,
    last_name: values.lastName.trim() || null,
    company_name: values.companyName.trim() || null,
    primary_email: values.primaryEmail.trim() || null,
    secondary_email: values.secondaryEmail.trim() || null,
    primary_phone: values.primaryPhone.trim() || null,
    secondary_phone: values.secondaryPhone.trim() || null,
    billing_address_line_1: values.billingAddressLine1.trim() || null,
    billing_address_line_2: values.billingAddressLine2.trim() || null,
    billing_town: values.billingTown.trim() || null,
    billing_county: values.billingCounty.trim() || null,
    billing_eircode: values.billingEircode.trim() || null,
    notes: values.notes.trim() || null,
    preferred_contact_method: values.preferredContactMethod.trim() || null,
    marketing_consent: values.marketingConsent,
    active: values.active,
    created_by: userId,
    customer_name: customerName,
    phone: values.primaryPhone.trim() || null,
    email: values.primaryEmail.trim() || null,
    address: values.billingAddressLine1.trim() || null,
    eircode_postcode: values.billingEircode.trim() || null,
  };
};

const toSiteRow = (values: SiteFormValues, companyId: string, userId: string) => ({
  company_id: companyId,
  customer_id: values.customerId,
  site_name: values.siteName.trim() || null,
  address_line_1: values.addressLine1.trim(),
  address_line_2: values.addressLine2.trim() || null,
  town: values.town.trim() || null,
  county: values.county.trim() || null,
  eircode: values.eircode.trim() || null,
  country: values.country.trim() || 'Ireland',
  access_instructions: values.accessInstructions.trim() || null,
  parking_notes: values.parkingNotes.trim() || null,
  gate_code: values.gateCode.trim() || null,
  key_safe_code: values.keySafeCode.trim() || null,
  property_type: values.propertyType.trim() || null,
  occupancy_type: values.occupancyType.trim() || null,
  bedrooms: toNullableNumber(values.bedrooms),
  floor_area_m2: toNullableNumber(values.floorAreaM2),
  construction_year: toNullableNumber(values.constructionYear),
  insulation_notes: values.insulationNotes.trim() || null,
  heating_distribution: values.heatingDistribution.trim() || null,
  site_notes: values.siteNotes.trim() || null,
  latitude: toNullableNumber(values.latitude),
  longitude: toNullableNumber(values.longitude),
  active: values.active,
  created_by: userId,
});

export const cloudCustomerSiteRepository: CustomerSiteRepository = {
  listCustomers: async () => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', session.companyId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row) => mapCustomerRow(row as CustomerRow));
  },
  getCustomerById: async (customerId) => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', session.companyId)
      .eq('id', customerId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapCustomerRow(data as CustomerRow) : undefined;
  },
  createCustomer: async (input) => {
    const session = await requireSession();
    const row = toCustomerRow(input, session.companyId, session.userId);
    const { data, error } = await supabase.from('customers').insert(row).select('*').single();

    if (error) {
      throw new Error(error.message);
    }

    return mapCustomerRow(data as CustomerRow);
  },
  updateCustomer: async (customerId, updates) => {
    const session = await requireSession();
    const row = toCustomerRow(updates, session.companyId, session.userId);
    const { data, error } = await supabase
      .from('customers')
      .update(row)
      .eq('company_id', session.companyId)
      .eq('id', customerId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapCustomerRow(data as CustomerRow) : undefined;
  },

  listSites: async () => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('company_id', session.companyId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row) => mapSiteRow(row as SiteRow));
  },
  listSitesByCustomer: async (customerId) => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('company_id', session.companyId)
      .eq('customer_id', customerId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row) => mapSiteRow(row as SiteRow));
  },
  getSiteById: async (siteId) => {
    const session = await requireSession();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('company_id', session.companyId)
      .eq('id', siteId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapSiteRow(data as SiteRow) : undefined;
  },
  createSite: async (input) => {
    const session = await requireSession();
    const row = toSiteRow(input, session.companyId, session.userId);
    const { data, error } = await supabase.from('sites').insert(row).select('*').single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSiteRow(data as SiteRow);
  },
  updateSite: async (siteId, updates) => {
    const session = await requireSession();
    const row = toSiteRow(updates, session.companyId, session.userId);
    const { data, error } = await supabase
      .from('sites')
      .update(row)
      .eq('company_id', session.companyId)
      .eq('id', siteId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapSiteRow(data as SiteRow) : undefined;
  },
};
