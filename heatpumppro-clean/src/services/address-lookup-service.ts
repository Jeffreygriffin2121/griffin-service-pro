const mockAddressLookupTable: Record<string, string> = {
  D02X285: '1 Grand Canal Street Lower, Dublin 2',
  D01F5P2: '15 O Connell Street Upper, Dublin 1',
  LS14AP: '44 Canal Walk, Leeds',
  EX24AN: '9 Harbour Road, Exeter',
  SW1A1AA: 'Buckingham Palace Road, London SW1A 1AA',
};

const normalizePostcode = (value: string): string => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export const findAddressByEircodeOrPostcode = (eircodeOrPostcode: string): string | null => {
  const normalized = normalizePostcode(eircodeOrPostcode);
  if (!normalized) {
    return null;
  }

  return mockAddressLookupTable[normalized] || null;
};
