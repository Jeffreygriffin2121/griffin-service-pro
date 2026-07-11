export type PlatformRecordStatus = 'draft' | 'active' | 'completed' | 'archived' | 'open' | 'closed';

export interface CompanyOwnedRecord {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Installation extends CompanyOwnedRecord {
  customerId?: string;
  status: PlatformRecordStatus;
  installationId: string;
}

export interface ServiceVisit extends CompanyOwnedRecord {
  installationId: string;
  engineerId: string;
  status: PlatformRecordStatus;
  visitDate: string;
}

export interface CommissioningRecord extends CompanyOwnedRecord {
  installationId: string;
  engineerId: string;
  status: PlatformRecordStatus;
}

export interface FaultCase extends CompanyOwnedRecord {
  installationId: string;
  status: PlatformRecordStatus;
  faultCode?: string;
}

export interface EquipmentRecord extends CompanyOwnedRecord {
  installationId: string;
  status: PlatformRecordStatus;
  manufacturer: string;
  modelFamily: string;
}

export interface PerformanceTest extends CompanyOwnedRecord {
  installationId: string;
  status: PlatformRecordStatus;
  testDate: string;
}

export interface Customer extends CompanyOwnedRecord {
  status: PlatformRecordStatus;
  fullName: string;
  email?: string;
}

export interface Part extends CompanyOwnedRecord {
  status: PlatformRecordStatus;
  sku: string;
  description: string;
}

export interface RefrigerantRecord extends CompanyOwnedRecord {
  status: PlatformRecordStatus;
  installationId: string;
  refrigerantType: string;
}

export interface Report extends CompanyOwnedRecord {
  status: PlatformRecordStatus;
  installationId?: string;
  reportType: 'service' | 'commissioning' | 'customer' | 'other';
}

export interface TeamMember extends CompanyOwnedRecord {
  status: PlatformRecordStatus;
  engineerId: string;
  role: 'owner' | 'manager' | 'engineer' | 'viewer';
}

export type PlatformModuleKey =
  | 'installations'
  | 'service-visits'
  | 'commissioning'
  | 'fault-finder'
  | 'performance-analysis'
  | 'reports'
  | 'equipment-knowledge-base'
  | 'customers'
  | 'parts-stock'
  | 'fgas-records'
  | 'team-management'
  | 'customer-portal';

export interface PlatformModuleDefinition {
  key: PlatformModuleKey;
  name: string;
  route: string;
  iconKey: string;
  description: string;
  enabled: boolean;
  comingSoon: boolean;
  requiredRole?: TeamMember['role'];
  category: 'installations' | 'service' | 'diagnostics' | 'commissioning' | 'reports' | 'business';
}
