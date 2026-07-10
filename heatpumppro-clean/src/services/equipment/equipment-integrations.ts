import { EquipmentRecord, FutureCapabilityConfig } from '../../types/equipment';

export type IntegrationCapability = keyof FutureCapabilityConfig;

export interface EquipmentIntegrationAdapter {
  id: string;
  capability: IntegrationCapability;
  isEnabled: (record: EquipmentRecord) => boolean;
  execute: (record: EquipmentRecord) => Promise<void>;
}

const adapters: EquipmentIntegrationAdapter[] = [];

export const registerEquipmentIntegrationAdapter = (adapter: EquipmentIntegrationAdapter) => {
  const existingIndex = adapters.findIndex((entry) => entry.id === adapter.id);
  if (existingIndex >= 0) {
    adapters[existingIndex] = adapter;
    return;
  }
  adapters.push(adapter);
};

export const getEquipmentIntegrationAdapters = (): EquipmentIntegrationAdapter[] => adapters;
