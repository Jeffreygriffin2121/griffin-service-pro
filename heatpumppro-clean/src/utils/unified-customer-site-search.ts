import { CustomerRecord, InstallationRecord, SiteRecord } from '../services/cloud/repositories/types';

const normalize = (value: string) => value.trim().toLowerCase();

const searchableTokens = (parts: Array<string | undefined>) =>
  parts
    .map((part) => normalize(part || ''))
    .filter(Boolean);

export type UnifiedSearchEntity = {
  id: string;
  kind: 'customer' | 'site' | 'installation';
  tokens: string[];
};

export const toCustomerSearchEntity = (customer: CustomerRecord): UnifiedSearchEntity => ({
  id: customer.id,
  kind: 'customer',
  tokens: searchableTokens([
    customer.customerName,
    customer.firstName,
    customer.lastName,
    customer.companyName,
    customer.primaryPhone,
    customer.secondaryPhone,
    customer.primaryEmail,
    customer.secondaryEmail,
    customer.billingAddressLine1,
    customer.billingAddressLine2,
    customer.billingTown,
    customer.billingCounty,
    customer.billingEircode,
  ]),
});

export const toSiteSearchEntity = (site: SiteRecord): UnifiedSearchEntity => ({
  id: site.id,
  kind: 'site',
  tokens: searchableTokens([
    site.siteName,
    site.addressLine1,
    site.addressLine2,
    site.town,
    site.county,
    site.eircode,
    site.country,
    site.propertyType,
    site.occupancyType,
  ]),
});

export const toInstallationSearchEntity = (installation: InstallationRecord): UnifiedSearchEntity => ({
  id: installation.id,
  kind: 'installation',
  tokens: searchableTokens([
    installation.customerName,
    installation.customerPhone,
    installation.customerEmail,
    installation.siteAddress,
    installation.eircode,
    installation.serialNumber,
    installation.indoorSerial,
    installation.outdoorSerial,
    installation.manufacturer,
    installation.modelFamily,
    installation.model,
  ]),
});

export const unifiedSearchMatch = (query: string, entity: UnifiedSearchEntity): boolean => {
  const normalized = normalize(query);
  if (!normalized) {
    return true;
  }

  return entity.tokens.some((token) => token.includes(normalized));
};
