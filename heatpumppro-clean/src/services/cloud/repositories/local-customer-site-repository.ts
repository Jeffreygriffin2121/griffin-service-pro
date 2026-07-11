import { getCurrentSession } from '../auth/auth-session-service';
import { getEquipmentHubRecords } from '../../equipment/equipment-hub-service';
import { CustomerFormValues, CustomerRecord, CustomerSiteRepository, SiteFormValues, SiteRecord } from './types';

const demoCompanyId = 'company-demo-1';
const demoEngineerId = 'engineer-demo-1';

const customerStore = new Map<string, CustomerRecord>();
const siteStore = new Map<string, SiteRecord>();
let seeded = false;

const nowIso = () => new Date().toISOString();
const createId = (prefix: 'customer' | 'site') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getSessionScope = async () => {
  const session = await getCurrentSession();

  return {
    companyId: session?.companyId || demoCompanyId,
    engineerId: session?.engineerId || demoEngineerId,
  };
};

const customerDisplayName = (values: {
  firstName: string;
  lastName: string;
  companyName: string;
}) => {
  const person = `${values.firstName} ${values.lastName}`.trim();
  return person || values.companyName.trim() || 'Unnamed Customer';
};

const seedFromEquipmentHub = () => {
  if (seeded) {
    return;
  }

  const records = getEquipmentHubRecords();
  records.forEach((record, index) => {
    const customerId = `customer-seed-${index + 1}`;

    if (!customerStore.has(customerId)) {
      const seededAt = `${record.equipment.installationDate || nowIso().slice(0, 10)}T12:00:00.000Z`;
      customerStore.set(customerId, {
        id: customerId,
        companyId: demoCompanyId,
        customerType: 'domestic',
        title: '',
        firstName: record.customer.customerName,
        lastName: '',
        companyName: '',
        primaryEmail: record.customer.email,
        secondaryEmail: '',
        primaryPhone: record.customer.phone,
        secondaryPhone: '',
        billingAddressLine1: record.customer.propertyAddress,
        billingAddressLine2: '',
        billingTown: '',
        billingCounty: '',
        billingEircode: record.customer.eircodePostcode,
        notes: '',
        preferredContactMethod: 'phone',
        marketingConsent: false,
        active: true,
        customerName: record.customer.customerName,
        createdBy: demoEngineerId,
        createdAt: seededAt,
        updatedAt: seededAt,
      });
    }

    const siteId = `site-seed-${index + 1}`;
    if (!siteStore.has(siteId)) {
      const seededAt = `${record.equipment.installationDate || nowIso().slice(0, 10)}T12:00:00.000Z`;
      siteStore.set(siteId, {
        id: siteId,
        companyId: demoCompanyId,
        customerId,
        siteName: `Property ${index + 1}`,
        addressLine1: record.customer.propertyAddress,
        addressLine2: '',
        town: '',
        county: '',
        eircode: record.customer.eircodePostcode,
        country: 'Ireland',
        accessInstructions: '',
        parkingNotes: '',
        gateCode: '',
        keySafeCode: '',
        propertyType: 'residential',
        occupancyType: '',
        bedrooms: '',
        floorAreaM2: '',
        constructionYear: '',
        insulationNotes: '',
        heatingDistribution: '',
        siteNotes: '',
        latitude: '',
        longitude: '',
        active: true,
        createdBy: demoEngineerId,
        createdAt: seededAt,
        updatedAt: seededAt,
      });
    }
  });

  seeded = true;
};

const enforceCompany = async (companyId: string) => {
  const scope = await getSessionScope();
  if (scope.companyId !== companyId) {
    throw new Error('Cross-company access denied.');
  }
  return scope;
};

export const localCustomerSiteRepository: CustomerSiteRepository = {
  listCustomers: async () => {
    seedFromEquipmentHub();
    const scope = await getSessionScope();

    return Array.from(customerStore.values())
      .filter((customer) => customer.companyId === scope.companyId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },
  getCustomerById: async (customerId) => {
    seedFromEquipmentHub();
    const customer = customerStore.get(customerId);
    if (!customer) {
      return undefined;
    }

    await enforceCompany(customer.companyId);
    return customer;
  },
  createCustomer: async (input) => {
    seedFromEquipmentHub();
    const scope = await getSessionScope();
    const customerName = customerDisplayName(input);
    const createdAt = nowIso();

    const customer: CustomerRecord = {
      ...input,
      id: createId('customer'),
      companyId: scope.companyId,
      customerName,
      createdBy: scope.engineerId,
      createdAt,
      updatedAt: createdAt,
    };

    customerStore.set(customer.id, customer);
    return customer;
  },
  updateCustomer: async (customerId, updates) => {
    seedFromEquipmentHub();
    const existing = customerStore.get(customerId);
    if (!existing) {
      return undefined;
    }

    await enforceCompany(existing.companyId);
    const updated: CustomerRecord = {
      ...existing,
      ...updates,
      customerName: customerDisplayName(updates),
      updatedAt: nowIso(),
    };

    customerStore.set(customerId, updated);
    return updated;
  },

  listSites: async () => {
    seedFromEquipmentHub();
    const scope = await getSessionScope();

    return Array.from(siteStore.values())
      .filter((site) => site.companyId === scope.companyId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },
  listSitesByCustomer: async (customerId) => {
    seedFromEquipmentHub();
    const customer = customerStore.get(customerId);
    if (!customer) {
      return [];
    }

    await enforceCompany(customer.companyId);

    return Array.from(siteStore.values())
      .filter((site) => site.companyId === customer.companyId && site.customerId === customerId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },
  getSiteById: async (siteId) => {
    seedFromEquipmentHub();
    const site = siteStore.get(siteId);
    if (!site) {
      return undefined;
    }

    await enforceCompany(site.companyId);
    return site;
  },
  createSite: async (input) => {
    seedFromEquipmentHub();
    const scope = await getSessionScope();
    const customer = customerStore.get(input.customerId);

    if (!customer || customer.companyId !== scope.companyId) {
      throw new Error('Customer not found in the active company scope.');
    }

    const createdAt = nowIso();
    const site: SiteRecord = {
      ...input,
      id: createId('site'),
      companyId: scope.companyId,
      createdBy: scope.engineerId,
      createdAt,
      updatedAt: createdAt,
    };

    siteStore.set(site.id, site);
    return site;
  },
  updateSite: async (siteId, updates) => {
    seedFromEquipmentHub();
    const existing = siteStore.get(siteId);
    if (!existing) {
      return undefined;
    }

    await enforceCompany(existing.companyId);

    const updated: SiteRecord = {
      ...existing,
      ...updates,
      updatedAt: nowIso(),
    };

    siteStore.set(siteId, updated);
    return updated;
  },
};
