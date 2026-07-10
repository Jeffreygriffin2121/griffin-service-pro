import { getManufacturerByName, manufacturers } from './index';
import {
  EquipmentDashboardCard,
  EquipmentModuleLinks,
  EquipmentQuickAction,
  EquipmentRecord,
  EquipmentTimelineEvent,
} from '../types/equipment';

const getModelForManufacturer = (manufacturerName: string): string => {
  const manufacturer = getManufacturerByName(manufacturerName);
  return manufacturer?.models[0]?.name || 'Model not listed';
};

const quickActions: EquipmentQuickAction[] = [
  { id: 'fault-finder', label: 'Fault Finder', href: '/fault-finder' },
  { id: 'commissioning-wizard', label: 'Commissioning Wizard', href: '/commissioning-wizard' },
  { id: 'service-checklist', label: 'Service Checklist', href: '/service-checklist' },
  { id: 'verified-field-fix', label: 'Verified Field Fixes', href: '/verified-field-fixes' },
  { id: 'ai-diagnostics', label: 'AI Diagnostics', href: '/ai-diagnostics' },
  { id: 'capture-photos', label: 'Photos', href: '/photos' },
  { id: 'reports', label: 'Reports', href: '/reports' },
];

const moduleLinks: EquipmentModuleLinks = {
  faultFinder: { route: '/fault-finder', status: 'Connected' },
  commissioningWizard: { route: '/commissioning-wizard', status: 'Connected' },
  serviceReports: { route: '/coming-soon', status: 'Planned' },
  verifiedFieldFixes: { route: '/verified-field-fixes', status: 'Connected' },
  aiDiagnostics: { route: '/coming-soon', status: 'Planned' },
  photosAndReports: { route: '/coming-soon', status: 'Planned' },
};

const buildDashboardCards = (record: Omit<EquipmentRecord, 'dashboardCards' | 'timeline' | 'quickActions'>): EquipmentDashboardCard[] => [
  { id: 'equipment-details', title: 'Equipment Details', value: record.equipment.model, subtitle: record.equipment.serialNumber },
  { id: 'current-status', title: 'Current Status', value: record.status, subtitle: `Warranty expiry ${record.equipment.warrantyExpiry}` },
  { id: 'fault-history', title: 'Fault History', value: `${record.faultHistory.length}`, subtitle: 'Logged events' },
  { id: 'verified-field-fixes', title: 'Verified Field Fixes', value: `${record.verifiedFieldFixes.length}`, subtitle: 'Fix records' },
  { id: 'commissioning-reports', title: 'Commissioning Reports', value: `${record.commissioningReports.length}`, subtitle: 'Reports attached' },
  { id: 'service-reports', title: 'Service Reports', value: `${record.serviceReports.length}`, subtitle: 'Reports attached' },
  { id: 'performance-history', title: 'Performance History', value: `${record.performanceHistory.length}`, subtitle: 'Baseline checks' },
  { id: 'parts-replaced', title: 'Parts Replaced', value: `${record.partsReplaced.length}`, subtitle: 'Lifecycle tracking' },
  { id: 'photo-library', title: 'Photo Library', value: `${record.photoLibrary.length}`, subtitle: 'Captured assets' },
  { id: 'documents', title: 'Documents', value: `${record.documents.length}`, subtitle: 'Files available' },
  { id: 'engineer-notes', title: 'Engineer Notes', value: `${record.engineerNotes.length}`, subtitle: 'Notes saved' },
  {
    id: 'ai-engineering-recommendations',
    title: 'AI Engineering Recommendations',
    value: `${record.aiEngineeringRecommendations.length}`,
    subtitle: 'Guidance entries',
  },
];

const buildTimeline = (record: Omit<EquipmentRecord, 'dashboardCards' | 'timeline' | 'quickActions'>): EquipmentTimelineEvent[] => [
  {
    id: `${record.id}-install`,
    type: 'Installation',
    title: 'Installation complete',
    date: record.equipment.installationDate,
    summary: `${record.equipment.installer} installed ${record.equipment.manufacturer} ${record.equipment.model}.`,
  },
  {
    id: `${record.id}-commissioning`,
    type: 'Commissioning',
    title: 'Commissioning report logged',
    date: record.commissioningReports[0] ? '2025-01-14' : record.equipment.installationDate,
    summary: 'Commissioning values and controls setup documented.',
  },
  {
    id: `${record.id}-annual-service`,
    type: 'Annual Service',
    title: 'Annual service',
    date: '2026-02-10',
    summary: 'System cleaned, checked, and operating values verified.',
  },
  {
    id: `${record.id}-fault`,
    type: 'Fault',
    title: 'Fault recorded',
    date: '2026-03-07',
    summary: record.faultHistory[0] || 'No fault details captured yet.',
  },
  {
    id: `${record.id}-repair`,
    type: 'Repair',
    title: 'Repair update',
    date: '2026-03-08',
    summary: record.verifiedFieldFixes[0] || 'Repair pending confirmation.',
  },
  {
    id: `${record.id}-photo`,
    type: 'Photo',
    title: 'Site photo captured',
    date: record.photoLibrary[0]?.capturedAt || '2026-03-08',
    summary: record.photoLibrary[0]?.label || 'Photo evidence added.',
  },
  {
    id: `${record.id}-report`,
    type: 'Report',
    title: 'Service report attached',
    date: '2026-03-09',
    summary: record.serviceReports[0] || 'Service report pending.',
  },
  {
    id: `${record.id}-note`,
    type: 'Engineer Note',
    title: 'Engineer note',
    date: '2026-03-09',
    summary: record.engineerNotes[0] || 'No notes yet.',
  },
];

const supportedManufacturers = manufacturers.filter((name) => name !== 'Other').slice(0, 3);

const baseRecords: Array<Omit<EquipmentRecord, 'dashboardCards' | 'timeline' | 'quickActions'>> = supportedManufacturers.map(
  (manufacturerName, index) => {
    const model = getModelForManufacturer(manufacturerName);
    const id = `equipment-${index + 1}`;
    return {
      id,
      customer: {
        customerName: ['Northfield Homes', 'Riverside Court', 'Meadowbrook Clinic'][index] || 'HeatPump Pro Customer',
        phone: ['+44 117 000 1001', '+44 113 000 2045', '+44 131 000 3042'][index] || '+44 000 000 0000',
        email: ['service@northfieldhomes.co.uk', 'maintenance@riversidecourt.co.uk', 'fm@meadowbrookclinic.co.uk'][index] ||
          'service@customer.co.uk',
        eircodePostcode: ['D02 X285', 'LS1 4AP', 'EX2 4AN'][index] || 'D01 F5P2',
        propertyAddress: ['12 Elm Street, Bristol', '44 Canal Walk, Leeds', '9 Harbour Road, Exeter'][index] ||
          'Customer property address',
      },
      equipment: {
        manufacturer: manufacturerName,
        model,
        serialNumber: `SN-${index + 1}26-${manufacturerName.slice(0, 3).toUpperCase()}`,
        indoorUnitSerial: `IND-${index + 1}26-${manufacturerName.slice(0, 3).toUpperCase()}`,
        outdoorUnitSerial: `OUT-${index + 1}26-${manufacturerName.slice(0, 3).toUpperCase()}`,
        installationDate: ['2024-02-11', '2023-09-18', '2024-05-03'][index] || '2024-01-01',
        installer: ['HeatPump Pro Install Team', 'Apex Renewables', 'Southern Energy Services'][index] || 'HeatPump Pro Install Team',
        refrigerantType: ['R32', 'R410A', 'R32'][index] || 'R32',
        refrigerantCharge: ['2.8 kg', '3.2 kg', '2.6 kg'][index] || '2.5 kg',
        systemCapacity: ['8 kW', '12 kW', '10 kW'][index] || '8 kW',
        warrantyStart: ['2024-02-11', '2023-09-18', '2024-05-03'][index] || '2024-01-01',
        warrantyExpiry: ['2029-02-11', '2028-09-18', '2029-05-03'][index] || '2029-01-01',
      },
      status: (['Commissioned', 'Active', 'Under Warranty'][index] || 'Active') as EquipmentRecord['status'],
      serviceVisitSummary: {
        currentVisitId: `${id}-visit-2`,
        lastServiceDate: '2026-03-09',
        nextServiceDue: '2027-03-09',
        visitCount: 1,
        latestEngineer: ['A. Patel', 'J. Griffin', 'R. Hayes'][index] || 'HeatPump Pro Engineer',
        photos: [
          { id: `${id}-service-photo-1`, label: 'Before - outdoor unit', uri: 'placeholder://before-outdoor-unit', capturedAt: '2026-03-09' },
          { id: `${id}-service-photo-2`, label: 'Before - controls', uri: 'placeholder://before-controls', capturedAt: '2026-03-09' },
        ],
        report: {
          id: `${id}-service-report-1`,
          label: 'Service Visit Report',
          uri: `placeholder://service-report-${id}-1.pdf`,
          capturedAt: '2026-03-09',
        },
        reportPhotos: [],
      },
      faultHistory: [
        'F12 compressor protection fault resolved after airflow correction.',
        'Low pressure warning cleared after re-pressurisation and leak check.',
      ].slice(0, index === 1 ? 2 : 1),
      verifiedFieldFixes: [
        'Flow sensor replaced and operation confirmed under load.',
        'Control wiring reseated and nuisance lockout eliminated.',
      ].slice(0, index === 0 ? 1 : 2),
      commissioningReports: [
        'Commissioning handover report with flow and return temperatures.',
        'Weather compensation tuned and installer sign-off completed.',
      ],
      serviceReports: [
        'Annual service completed with filters cleaned and electrical checks.',
        'Quarterly inspection completed with control firmware check.',
      ],
      performanceHistory: [
        'COP trend stable at design flow temperatures.',
        'Defrost cycle duration reduced after control tuning.',
      ],
      partsReplaced: ['Flow sensor', 'Air vent valve'],
      photoLibrary: [
        { id: `${id}-photo-1`, label: 'Outdoor unit overview', uri: 'placeholder://outdoor-unit', capturedAt: '2026-03-08' },
        { id: `${id}-photo-2`, label: 'Plant room controls', uri: 'placeholder://plant-room', capturedAt: '2026-03-08' },
      ],
      documents: [
        { id: `${id}-doc-1`, label: 'Warranty certificate', uri: 'placeholder://warranty-pdf', capturedAt: '2024-02-11' },
        { id: `${id}-doc-2`, label: 'Commissioning report', uri: 'placeholder://commissioning-pdf', capturedAt: '2025-01-14' },
      ],
      generatedServiceReports: [
        {
          id: `${id}-service-report-1`,
          name: 'HeatPump Pro Service Visit Report - Initial Visit',
          generatedAt: '2026-03-09T10:15',
          uri: `placeholder://service-report-${id}-1.pdf`,
          serviceVisitId: `${id}-visit-1`,
          includedPhotoIds: [],
        },
      ],
      verifiedFixWorkflow: [
        {
          id: `${id}-verified-fix-1`,
          createdAt: '2026-03-09T11:10:00',
          engineer: ['A. Patel', 'J. Griffin', 'R. Hayes'][index] || 'HeatPump Pro Engineer',
          faultCode: ['F12', 'E07', 'H90'][index] || 'F12',
          symptoms: 'Intermittent heat output and circulation alarm.',
          rootCause: 'Flow restriction from debris at circuit strainer.',
          actionsTaken: 'Cleaned strainer, flushed circuit, and validated stable flow and delta T.',
          partsReplaced: ['Strainer seal kit'],
          estimatedRepairTime: '1 hr 20 min',
          toolsUsed: ['Flow balancing kit', 'Digital temperature probes', 'True RMS multimeter'],
          safetyWarningsReviewed: [
            'Isolate electrical supply before opening control panel.',
            'Confirm safe pressure before disconnecting fittings.',
          ],
          diagnosticStepsCompleted: [
            'Confirmed fault history and lockout state.',
            'Measured low flow rate at test point.',
            'Restored circulation and validated operating temperatures.',
          ],
          result: 'verified-fixed',
        },
      ],
      engineerNotes: [
        'Monitor return temperature drift after next service interval.',
        'Customer advised to keep clear airflow around outdoor unit.',
      ],
      aiEngineeringRecommendations: [
        'Use commissioning baseline for future anomaly comparisons.',
        'Schedule pre-winter performance verification.',
        'Capture thermal photos during next load test.',
      ],
      moduleLinks,
      capabilityConfig: {
        cloudSync: true,
        openAI: true,
        photoRecognition: true,
        qrCodeScanner: true,
        barcodeScanner: true,
        pdfExport: true,
        emailReports: true,
        calendar: true,
        offlineStorage: true,
        pushNotifications: true,
      },
    };
  },
);

export const equipmentRecords: EquipmentRecord[] = baseRecords.map((record) => ({
  ...record,
  dashboardCards: buildDashboardCards(record),
  timeline: buildTimeline(record),
  quickActions,
}));
