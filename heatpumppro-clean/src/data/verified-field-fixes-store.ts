import { VerifiedFieldFixRecord, VerifiedFieldFixSearchFilters } from '../types/verified-field-fixes';
import { normalizeText } from '../utils/verified-field-fix-utils';

const records: VerifiedFieldFixRecord[] = [];

// Architecture note:
// This in-memory store mirrors a future cloud-backed collection contract.
// Replace these functions with API calls when sync is introduced.
export const addVerifiedFieldFixRecord = (record: VerifiedFieldFixRecord): void => {
  records.unshift(record);
};

export const getVerifiedFieldFixRecords = (): VerifiedFieldFixRecord[] => records;

export const searchVerifiedFieldFixRecords = (
  filters: VerifiedFieldFixSearchFilters,
): VerifiedFieldFixRecord[] => {
  const manufacturer = normalizeText(filters.manufacturer);
  const model = normalizeText(filters.model);
  const faultCode = normalizeText(filters.faultCode);
  const keywords = normalizeText(filters.keywords);

  return records.filter((record) => {
    const manufacturerMatch = !manufacturer || normalizeText(record.formData.manufacturer).includes(manufacturer);
    const modelMatch = !model || normalizeText(record.formData.model).includes(model);
    const faultCodeMatch = !faultCode || normalizeText(record.formData.faultCode).includes(faultCode);
    const keywordMatch = !keywords || record.searchableText.includes(keywords);

    return manufacturerMatch && modelMatch && faultCodeMatch && keywordMatch;
  });
};
