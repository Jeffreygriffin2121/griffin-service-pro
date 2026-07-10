import { IntelligenceEngine, IntelligenceEngineInput, IntelligenceReportProvider } from '../../types/intelligence';
import { LocalIntelligenceReportProvider } from './local-intelligence-provider';

export interface IntelligenceEngineOptions {
  provider?: IntelligenceReportProvider;
}

// Architecture note:
// The engine owns orchestration only. Swap the provider later for OpenAI or another AI backend
// without changing callers or the rest of the application.
export const createIntelligenceEngine = (
  options: IntelligenceEngineOptions = {},
): IntelligenceEngine => {
  const provider = options.provider ?? new LocalIntelligenceReportProvider();

  return {
    generateReport: async (input: IntelligenceEngineInput) => provider.generateReport(input),
  };
};

export const defaultIntelligenceEngine = createIntelligenceEngine();
