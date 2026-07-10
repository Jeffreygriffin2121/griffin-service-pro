import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../section-card';
import { ReportCard } from '../report-card';
import { PrimaryButton } from '../primary-button';
import { EquipmentQuickAction, EquipmentRecord } from '../../types/equipment';
import { EquipmentDashboardCardView } from './equipment-dashboard-card';
import { EquipmentQuickActions } from './equipment-quick-actions';
import { EquipmentTimeline } from './equipment-timeline';

type Props = {
  equipment: EquipmentRecord;
  onActionPress: (action: EquipmentQuickAction, equipment: EquipmentRecord) => void;
  onOpenLatestVisit: (equipment: EquipmentRecord) => void;
};

export function EquipmentRecordCard({ equipment, onActionPress, onOpenLatestVisit }: Props) {
  const lastService = equipment.serviceVisitSummary.lastServiceDate || 'No service recorded yet.';
  const nextServiceDue = equipment.serviceVisitSummary.nextServiceDue || 'Not scheduled yet.';
  const latestEngineer = equipment.serviceVisitSummary.latestEngineer || 'Not recorded yet.';
  const hasLatestVisit = equipment.serviceVisitSummary.visitCount > 0;
  const latestVisitType = hasLatestVisit ? 'Annual Service' : 'Service Visit Pending';
  const latestVisitStatus = hasLatestVisit ? 'Completed' : 'Not Started';
  const latestPhotosCount = equipment.serviceVisitSummary.photos.length;
  const latestReportStatus = equipment.serviceVisitSummary.report
    ? `Attached (${equipment.serviceVisitSummary.report.label})`
    : 'Not generated';

  return (
    <ReportCard
      title={`${equipment.customer.customerName} - Installation Dashboard`}
      generatedAt={equipment.equipment.installationDate}>
      <View style={styles.metaRow}>
        <Text style={styles.metaPill}>{equipment.equipment.manufacturer}</Text>
        <Text style={styles.metaPill}>{equipment.equipment.model}</Text>
        <Text style={styles.metaPill}>{equipment.status}</Text>
      </View>

      <SectionCard title="Customer">
        <Text style={styles.detail}>Name: {equipment.customer.customerName}</Text>
        <Text style={styles.detail}>Phone: {equipment.customer.phone}</Text>
        <Text style={styles.detail}>Email: {equipment.customer.email}</Text>
        <Text style={styles.detail}>Eircode / Postcode: {equipment.customer.eircodePostcode || 'Not recorded'}</Text>
      </SectionCard>

      <SectionCard title="Address">
        <Text style={styles.detail}>Property Address: {equipment.customer.propertyAddress}</Text>
      </SectionCard>

      <SectionCard title="Equipment">
        <Text style={styles.detail}>Manufacturer: {equipment.equipment.manufacturer}</Text>
        <Text style={styles.detail}>Model: {equipment.equipment.model}</Text>
        <Text style={styles.detail}>Serial Number: {equipment.equipment.serialNumber}</Text>
        <Text style={styles.detail}>Indoor Unit Serial: {equipment.equipment.indoorUnitSerial}</Text>
        <Text style={styles.detail}>Outdoor Unit Serial: {equipment.equipment.outdoorUnitSerial}</Text>
        <Text style={styles.detail}>Installation Date: {equipment.equipment.installationDate}</Text>
        <Text style={styles.detail}>Installer: {equipment.equipment.installer}</Text>
        <Text style={styles.detail}>Refrigerant Type: {equipment.equipment.refrigerantType}</Text>
        <Text style={styles.detail}>Refrigerant Charge: {equipment.equipment.refrigerantCharge}</Text>
        <Text style={styles.detail}>System Capacity: {equipment.equipment.systemCapacity}</Text>
      </SectionCard>

      <SectionCard title="Last Service">
        <Text style={styles.detail}>Last Service Date: {lastService}</Text>
        <Text style={styles.detail}>Next Service Due: {nextServiceDue}</Text>
        <Text style={styles.detail}>Visit Count: {equipment.serviceVisitSummary.visitCount}</Text>
        <Text style={styles.detail}>Latest Engineer: {latestEngineer}</Text>
        <Text style={styles.detail}>
          Report: {equipment.serviceVisitSummary.report ? equipment.serviceVisitSummary.report.label : 'No report attached yet.'}
        </Text>
      </SectionCard>

      <SectionCard
        title="Latest Visit Snapshot"
        subtitle="Most recent service visit linked to this installation. Engineer-only notes stay private and are not shown in customer report sections.">
        <Text style={styles.detail}>Visit Date: {hasLatestVisit ? lastService : 'No completed visit yet.'}</Text>
        <Text style={styles.detail}>Visit Type: {latestVisitType}</Text>
        <Text style={styles.detail}>Status: {latestVisitStatus}</Text>
        <Text style={styles.detail}>Engineer: {latestEngineer}</Text>
        <Text style={styles.detail}>Latest Photos Count: {latestPhotosCount}</Text>
        <Text style={styles.detail}>Latest Report Status: {latestReportStatus}</Text>
        <Text style={styles.detail}>Next Service Due: {nextServiceDue}</Text>
        <PrimaryButton
          title="Open Latest Visit"
          style={styles.snapshotButton}
          onPress={() => {
            onOpenLatestVisit(equipment);
          }}
        />
      </SectionCard>

      <SectionCard title="Warranty">
        <Text style={styles.detail}>Warranty Start: {equipment.equipment.warrantyStart}</Text>
        <Text style={styles.detail}>Warranty Expiry: {equipment.equipment.warrantyExpiry}</Text>
      </SectionCard>

      <SectionCard title="Current Status">
        <Text style={styles.detail}>{equipment.status}</Text>
      </SectionCard>

      <SectionCard title="Installation Dashboard">
        {equipment.dashboardCards.map((card) => (
          <EquipmentDashboardCardView key={card.id} card={card} />
        ))}
      </SectionCard>

      <SectionCard title="Timeline">
        <EquipmentTimeline events={equipment.timeline} />
      </SectionCard>

      <SectionCard title="Actions">
        <EquipmentQuickActions
          actions={equipment.quickActions}
          onActionPress={(action) => {
            onActionPress(action, equipment);
          }}
        />
      </SectionCard>

      <SectionCard title="Fault History">
        {equipment.faultHistory.length
          ? equipment.faultHistory.map((entry) => (
            <Text key={entry} style={styles.bullet}>
              - {entry}
            </Text>
          ))
          : <Text style={styles.detail}>No faults recorded.</Text>}
      </SectionCard>

      <SectionCard title="Verified Field Fixes">
        {equipment.verifiedFieldFixes.map((entry) => (
          <Text key={entry} style={styles.bullet}>
            - {entry}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Commissioning Reports">
        {equipment.commissioningReports.map((entry) => (
          <Text key={entry} style={styles.bullet}>
            - {entry}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Service Reports">
        {equipment.serviceReports.map((entry) => (
          <Text key={entry} style={styles.bullet}>
            - {entry}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Performance History">
        {equipment.performanceHistory.map((entry) => (
          <Text key={entry} style={styles.bullet}>
            - {entry}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Parts Replaced">
        {equipment.partsReplaced.map((entry) => (
          <Text key={entry} style={styles.bullet}>
            - {entry}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Photo Library">
        {equipment.photoLibrary.map((asset) => (
          <Text key={asset.id} style={styles.detail}>
            {asset.label}: {asset.uri}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Documents">
        {equipment.documents.map((asset) => (
          <Text key={asset.id} style={styles.detail}>
            {asset.label}: {asset.uri}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Engineer Notes">
        {equipment.engineerNotes.map((entry) => (
          <Text key={entry} style={styles.bullet}>
            - {entry}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="AI Engineering Recommendations">
        {equipment.aiEngineeringRecommendations.map((entry) => (
          <Text key={entry} style={styles.bullet}>
            - {entry}
          </Text>
        ))}
      </SectionCard>
    </ReportCard>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaPill: {
    color: '#0f4fb3',
    backgroundColor: '#e0ecff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
    marginBottom: 8,
  },
  detail: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  bullet: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  snapshotButton: {
    marginTop: 12,
  },
});
