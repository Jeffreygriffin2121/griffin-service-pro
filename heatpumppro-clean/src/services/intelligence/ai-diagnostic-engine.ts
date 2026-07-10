import { manufacturerDataByName } from '../../data';
import { getEquipmentHubRecords } from '../equipment/equipment-hub-service';
import { defaultIntelligenceEngine } from './intelligence-engine';
import {
  AIDiagnosticEngineResult,
  AIDiagnosticKnowledgeProvider,
  FaultDatabaseSearchInput,
  FaultKnowledgeEntry,
  IntelligenceEngineInput,
} from '../../types/intelligence';

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const scoreTextMatch = (target: string, terms: string[]): number => {
  if (!terms.length) {
    return 0;
  }
  const normalized = target.toLowerCase();
  return terms.reduce((score, term) => (normalized.includes(term) ? score + 1 : score), 0);
};

const buildManuals = (manufacturer: string, model: string, faultCode: string) => {
  const safeManufacturer = manufacturer.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeModel = model.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeCode = faultCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return [
    {
      title: `${manufacturer} ${model} service manual`,
      uri: `https://manuals.heatpumppro.local/${safeManufacturer}/${safeModel}/service-manual.pdf`,
      description: 'Installation, commissioning, and service procedure guide.',
    },
    {
      title: `${manufacturer} fault matrix`,
      uri: `https://manuals.heatpumppro.local/${safeManufacturer}/${safeModel}/fault-matrix-${safeCode || 'general'}.pdf`,
      description: 'Fault causes, checks, and reset pathways.',
    },
  ];
};

class LocalDiagnosticKnowledgeProvider implements AIDiagnosticKnowledgeProvider {
  searchFaultDatabase(input: FaultDatabaseSearchInput): FaultKnowledgeEntry[] {
    const records: FaultKnowledgeEntry[] = [];
    const terms = tokenize([input.query, input.symptom, input.faultCode].filter(Boolean).join(' '));

    Object.values(manufacturerDataByName).forEach((manufacturer) => {
      const manufacturerMatch = !input.manufacturer || manufacturer.name === input.manufacturer;
      if (!manufacturerMatch) {
        return;
      }

      manufacturer.models.forEach((model) => {
        const modelMatch = !input.model || model.name === input.model;
        if (!modelMatch) {
          return;
        }

        model.faultCodes.forEach((faultCode) => {
          const codeMatch = !input.faultCode || faultCode.toLowerCase().includes(input.faultCode.toLowerCase());
          if (!codeMatch) {
            return;
          }

          const diagnostic = manufacturer.diagnostics[faultCode];
          if (!diagnostic) {
            return;
          }

          const symptomScore = scoreTextMatch(
            [
              diagnostic.summary,
              ...diagnostic.likelyCauses,
              ...diagnostic.diagnosticProcedures,
              ...diagnostic.repairRecommendations,
            ].join(' '),
            terms,
          );

          const relevanceScore =
            (input.manufacturer && manufacturer.name === input.manufacturer ? 35 : 10) +
            (input.model && model.name === input.model ? 25 : 8) +
            (input.faultCode && faultCode.toLowerCase() === input.faultCode.toLowerCase() ? 30 : 10) +
            Math.min(25, symptomScore * 3);

          if (input.query || input.symptom) {
            if (symptomScore === 0 && !input.faultCode) {
              return;
            }
          }

          records.push({
            id: `${manufacturer.name}-${model.name}-${faultCode}`,
            manufacturer: manufacturer.name,
            model: model.name,
            faultCode,
            summary: diagnostic.summary,
            probableCauses: diagnostic.likelyCauses,
            diagnosticSteps: diagnostic.diagnosticProcedures,
            safetyWarnings: [
              'Isolate power before live panel work.',
              'Confirm pressure safety before refrigerant-side checks.',
            ],
            replacementParts: manufacturer.profile.commonComponents,
            estimatedRepairTime: '1 hr 10 min',
            recommendedTools: manufacturer.profile.preferredTools,
            relatedManuals: buildManuals(manufacturer.name, model.name, faultCode),
            relevanceScore,
            source: 'manufacturer-diagnostics',
          });
        });
      });
    });

    getEquipmentHubRecords().forEach((equipment) => {
      if (input.manufacturer && equipment.equipment.manufacturer !== input.manufacturer) {
        return;
      }
      if (input.model && equipment.equipment.model !== input.model) {
        return;
      }

      equipment.verifiedFixWorkflow.forEach((fix) => {
        const symptomScore = scoreTextMatch(`${fix.symptoms} ${fix.rootCause} ${fix.actionsTaken}`, terms);
        const codeMatch = !input.faultCode || fix.faultCode.toLowerCase().includes(input.faultCode.toLowerCase());
        if (!codeMatch) {
          return;
        }
        if ((input.query || input.symptom) && symptomScore === 0 && !input.faultCode) {
          return;
        }

        records.push({
          id: fix.id,
          manufacturer: equipment.equipment.manufacturer,
          model: equipment.equipment.model,
          faultCode: fix.faultCode,
          summary: fix.rootCause || 'Verified fix record with no root cause text.',
          probableCauses: [fix.rootCause || 'Not documented'],
          diagnosticSteps: fix.diagnosticStepsCompleted,
          safetyWarnings: fix.safetyWarningsReviewed,
          replacementParts: fix.partsReplaced,
          estimatedRepairTime: fix.estimatedRepairTime,
          recommendedTools: fix.toolsUsed,
          relatedManuals: buildManuals(equipment.equipment.manufacturer, equipment.equipment.model, fix.faultCode),
          relevanceScore: 55 + Math.min(35, symptomScore * 4),
          source: 'verified-fix',
        });
      });
    });

    return records.sort((left, right) => right.relevanceScore - left.relevanceScore).slice(0, 20);
  }
}

export interface AIDiagnosticEngineOptions {
  knowledgeProvider?: AIDiagnosticKnowledgeProvider;
}

export interface AIDiagnosticEngine {
  searchFaultDatabase(input: FaultDatabaseSearchInput): Promise<FaultKnowledgeEntry[]>;
  generateDiagnosis(input: IntelligenceEngineInput, searchInput: FaultDatabaseSearchInput): Promise<AIDiagnosticEngineResult>;
}

export const createAIDiagnosticEngine = (options: AIDiagnosticEngineOptions = {}): AIDiagnosticEngine => {
  const knowledgeProvider = options.knowledgeProvider ?? new LocalDiagnosticKnowledgeProvider();

  return {
    searchFaultDatabase: async (input: FaultDatabaseSearchInput) => knowledgeProvider.searchFaultDatabase(input),
    generateDiagnosis: async (input: IntelligenceEngineInput, searchInput: FaultDatabaseSearchInput) => {
      const [report, faultMatches] = await Promise.all([
        defaultIntelligenceEngine.generateReport(input),
        Promise.resolve(knowledgeProvider.searchFaultDatabase(searchInput)),
      ]);

      const matchedManuals = faultMatches.flatMap((entry) => entry.relatedManuals);
      const dedupedManuals = matchedManuals.reduce<typeof report.relatedManuals>((acc, manual) => {
        if (!acc.find((item) => item.uri === manual.uri)) {
          acc.push(manual);
        }
        return acc;
      }, []);

      return {
        report: {
          ...report,
          relatedManuals: [...report.relatedManuals, ...dedupedManuals].slice(0, 8),
        },
        faultMatches,
      };
    },
  };
};

export const defaultAIDiagnosticEngine = createAIDiagnosticEngine();
