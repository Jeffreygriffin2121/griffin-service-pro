import { CustomerFormValues, SiteFormValues } from '../services/cloud/repositories/types';

const eircodeRegex = /^(?:[AC-FHKNPRTV-Y][0-9]{2}|D6W)[\s-]?[0-9AC-FHKNPRTV-Y]{4}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9()\-\s]{7,20}$/;

export const isValidEircode = (value: string) => !value.trim() || eircodeRegex.test(value.trim());

export const isValidEmail = (value: string) => !value.trim() || emailRegex.test(value.trim());

export const isValidPhone = (value: string) => !value.trim() || phoneRegex.test(value.trim());

export const validateCustomerForm = (values: CustomerFormValues): string[] => {
  const errors: string[] = [];

  if (!values.firstName.trim() && !values.lastName.trim() && !values.companyName.trim()) {
    errors.push('Provide either a contact name or a business name.');
  }

  if (!values.primaryPhone.trim() && !values.primaryEmail.trim()) {
    errors.push('Provide at least one primary contact method (phone or email).');
  }

  if (!isValidEmail(values.primaryEmail)) {
    errors.push('Primary email is not valid.');
  }

  if (!isValidEmail(values.secondaryEmail)) {
    errors.push('Secondary email is not valid.');
  }

  if (!isValidPhone(values.primaryPhone)) {
    errors.push('Primary phone is not valid.');
  }

  if (!isValidPhone(values.secondaryPhone)) {
    errors.push('Secondary phone is not valid.');
  }

  if (!isValidEircode(values.billingEircode)) {
    errors.push('Billing Eircode is not valid.');
  }

  return errors;
};

export const validateSiteForm = (values: SiteFormValues): string[] => {
  const errors: string[] = [];

  if (!values.customerId.trim()) {
    errors.push('A customer must be selected for this site.');
  }

  if (!values.addressLine1.trim()) {
    errors.push('Address line 1 is required.');
  }

  if (!isValidEircode(values.eircode)) {
    errors.push('Site Eircode is not valid.');
  }

  if (values.bedrooms.trim() && Number.isNaN(Number(values.bedrooms))) {
    errors.push('Bedrooms must be a number.');
  }

  if (values.floorAreaM2.trim() && Number.isNaN(Number(values.floorAreaM2))) {
    errors.push('Floor area must be a number.');
  }

  if (values.constructionYear.trim() && Number.isNaN(Number(values.constructionYear))) {
    errors.push('Construction year must be a number.');
  }

  if (values.latitude.trim() && Number.isNaN(Number(values.latitude))) {
    errors.push('Latitude must be numeric.');
  }

  if (values.longitude.trim() && Number.isNaN(Number(values.longitude))) {
    errors.push('Longitude must be numeric.');
  }

  return errors;
};
