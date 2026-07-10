export const parseNumber = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const roundTo = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const calculateDeltaT = (flowTemperature: number, returnTemperature: number): number =>
  flowTemperature - returnTemperature;

export const calculateEstimatedHeatOutputKw = (
  flowRateLitresPerMinute: number,
  deltaT: number,
  glycolPercentage: number,
): number => {
  const glycolCorrection = Math.max(0.8, 1 - glycolPercentage * 0.002);
  return flowRateLitresPerMinute * deltaT * 0.0698 * glycolCorrection;
};