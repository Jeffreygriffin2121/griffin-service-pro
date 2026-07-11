import React, { useMemo, useState } from 'react';
import { SiteRecord } from '../../services/cloud/repositories/types';
import { FormSelect } from '../form-select';

type Props = {
  sites: SiteRecord[];
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  disabled?: boolean;
};

const siteLabel = (site: SiteRecord) => {
  if (site.siteName.trim()) {
    return `${site.siteName} - ${site.addressLine1}`;
  }
  return site.addressLine1;
};

export function SiteSelector({ sites, selectedSiteId, onSelectSite, disabled = false }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const options = useMemo(() => sites.map((site) => siteLabel(site)), [sites]);

  const selectedLabel = useMemo(() => {
    const selected = sites.find((site) => site.id === selectedSiteId);
    return selected ? siteLabel(selected) : '';
  }, [sites, selectedSiteId]);

  return (
    <FormSelect
      label="Site"
      value={selectedLabel}
      placeholder="Select site"
      options={options}
      isOpen={isOpen}
      onToggleOpen={() => setIsOpen((value) => !value)}
      onSelect={(label) => {
        const selected = sites.find((site) => siteLabel(site) === label);
        onSelectSite(selected?.id || '');
        setIsOpen(false);
      }}
      disabled={disabled}
      helperText="Sites are filtered by selected customer."
    />
  );
}
