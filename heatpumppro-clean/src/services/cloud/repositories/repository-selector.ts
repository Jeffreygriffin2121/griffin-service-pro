import { getCloudDataMode } from '../providers/provider-selector';
import { cloudInstallationRepository } from './cloud-installation-repository';
import { localInstallationRepository } from './local-installation-repository';
import { InstallationRepository } from './types';

export const getInstallationRepository = (): InstallationRepository =>
  getCloudDataMode() === 'cloud' ? cloudInstallationRepository : localInstallationRepository;
