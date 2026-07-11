import React, { useMemo, useState } from 'react';
import { CustomerRecord } from '../../services/cloud/repositories/types';
import { FormSelect } from '../form-select';

type Props = {
  customers: CustomerRecord[];
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  disabled?: boolean;
};

const customerLabel = (customer: CustomerRecord) => {
  const business = customer.companyName.trim();
  if (business) {
    return `${customer.customerName} (${business})`;
  }
  return customer.customerName;
};

export function CustomerSelector({ customers, selectedCustomerId, onSelectCustomer, disabled = false }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const options = useMemo(() => customers.map((customer) => customerLabel(customer)), [customers]);

  const selectedLabel = useMemo(() => {
    const selected = customers.find((customer) => customer.id === selectedCustomerId);
    return selected ? customerLabel(selected) : '';
  }, [customers, selectedCustomerId]);

  return (
    <FormSelect
      label="Customer"
      value={selectedLabel}
      placeholder="Select customer"
      options={options}
      isOpen={isOpen}
      onToggleOpen={() => setIsOpen((value) => !value)}
      onSelect={(label) => {
        const selected = customers.find((customer) => customerLabel(customer) === label);
        onSelectCustomer(selected?.id || '');
        setIsOpen(false);
      }}
      disabled={disabled}
      helperText="Select an existing customer or create one below."
    />
  );
}
