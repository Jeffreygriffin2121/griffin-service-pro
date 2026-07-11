import { getCloudDataMode } from '../providers/provider-selector';
import { cloudCustomerSiteRepository } from './cloud-customer-site-repository';
import { cloudInstallationRepository } from './cloud-installation-repository';
import { localCustomerSiteRepository } from './local-customer-site-repository';
import { localInstallationRepository } from './local-installation-repository';
import { CustomerSiteRepository, InstallationRepository } from './types';

export const getInstallationRepository = (): InstallationRepository =>
  getCloudDataMode() === 'cloud' ? cloudInstallationRepository : localInstallationRepository;

export const getCustomerSiteRepository = (): CustomerSiteRepository =>
  getCloudDataMode() === 'cloud' ? cloudCustomerSiteRepository : localCustomerSiteRepository;
