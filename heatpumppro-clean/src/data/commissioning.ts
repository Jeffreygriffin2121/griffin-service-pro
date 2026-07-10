import { CommissioningFormData } from '../types/commissioning';

export const commissioningThresholds = {
  pressure: {
    failLow: 0.6,
    warningLow: 0.8,
    warningHigh: 2.6,
    failHigh: 3.0,
  },
  deltaT: {
    failLow: 1,
    warningLow: 3,
    warningHigh: 12,
    failHigh: 20,
  },
  flowRate: {
    failLow: 5,
    warningLow: 8,
  },
};

export const commissioningRequiredFields: Array<keyof CommissioningFormData> = [
  'customerName',
  'siteAddress',
  'manufacturer',
  'model',
  'serialNumber',
  'outdoorTemperature',
  'flowTemperature',
  'returnTemperature',
  'systemPressure',
  'flowRate',
  'glycolPercentage',
  'mode',
  'engineerNotes',
];