import { CatalogueAttachmentKind, CatalogueAttachmentOrigin, CatalogueAttachmentReference } from '../../types/equipment';

export const catalogueAttachmentKinds: CatalogueAttachmentKind[] = [
  'service-manual',
  'installation-manual',
  'wiring-diagram',
  'hydraulic-diagram',
  'fault-codes',
  'spare-parts',
  'photo',
  'technical-bulletin',
];

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createCatalogueAttachmentReference = (
  kind: CatalogueAttachmentKind,
  title: string,
  overrides: Partial<CatalogueAttachmentReference> = {},
): CatalogueAttachmentReference => ({
  id: overrides.id || `${kind}-${slugify(title)}`,
  kind,
  title,
  origin: overrides.origin || ('seed' as CatalogueAttachmentOrigin),
  href: overrides.href,
  storagePath: overrides.storagePath,
  mimeType: overrides.mimeType,
  notes: overrides.notes,
  version: overrides.version,
  publishedAt: overrides.publishedAt,
  syncedAt: overrides.syncedAt,
});