export const normalizeText = (value: string): string => value.trim().toLowerCase();

export const generateFixId = (): string => {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `vff-${timePart}-${randomPart}`;
};

export const buildSearchableText = (parts: string[]): string =>
  parts
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join(' | ');
