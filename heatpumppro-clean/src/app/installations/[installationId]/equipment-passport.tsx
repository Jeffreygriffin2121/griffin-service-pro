import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../../components/app-header';
import { EquipmentTimeline } from '../../../components/equipment/equipment-timeline';
import { PrimaryButton } from '../../../components/primary-button';
import { SectionCard } from '../../../components/section-card';
import { EquipmentAsset, EquipmentRecord, EquipmentTimelineEvent } from '../../../types/equipment';
import { getInstallationRepository } from '../../../services/cloud';

type PhotoGroup = {
  visitId: string;
  photos: EquipmentAsset[];
};

type ServiceVisitHistoryRow = {
  id: string;
  visitId: string;
  generatedAt: string;
  name: string;
  includedPhotosCount: number;
  summary: string;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toTimestamp = (value: string): number => {
  if (!value) {
    return 0;
  }
  const normalized = value.includes('T') ? value : `${value}T00:00:00Z`;
  const parsed = new Date(normalized).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDateTime = (value: string): string => {
  if (!value) {
    return 'Not recorded';
  }
  return value.includes('T') ? value.replace('T', ' ') : value;
};

const getRemainingDays = (expiryDate: string): number => {
  const parsed = new Date(`${expiryDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }
  const now = new Date();
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.ceil((parsed.getTime() - nowUtc) / 86400000);
};

const getDateDiffDays = (startDate: string, endDate: string): number => {
  const start = toTimestamp(startDate);
  const end = toTimestamp(endDate);
  if (!start || !end) {
    return 0;
  }
  return Math.max(0, Math.ceil((end - start) / 86400000));
};

const formatWarrantyRemaining = (remainingDays: number): string => {
  const isExpired = remainingDays < 0;
  const days = Math.abs(remainingDays);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  if (!years && !months) {
    return isExpired ? 'Expired this month' : 'Less than 1 month remaining';
  }

  const value = `${years ? `${years}y` : ''} ${months ? `${months}m` : ''}`.trim();
  return isExpired ? `Expired ${value} ago` : `${value} remaining`;
};

const buildHealthScore = (record: EquipmentRecord, remainingWarrantyDays: number): number => {
  const hasVisit = record.serviceVisitSummary.visitCount > 0;
  const faultPenalty = Math.min(24, record.faultHistory.length * 8);
  const performanceBonus = Math.min(8, record.performanceHistory.length * 2);
  const noteBonus = Math.min(4, record.engineerNotes.length);
  const reportBonus = Math.min(4, record.generatedServiceReports.length * 2);
  const warrantySignal = remainingWarrantyDays > 0 ? 3 : -6;
  const visitSignal = hasVisit ? 8 : -12;

  return clamp(70 + performanceBonus + noteBonus + reportBonus + warrantySignal + visitSignal - faultPenalty, 0, 100);
};

const getHealthState = (score: number): { label: string; tint: string; bg: string } => {
  if (score >= 80) {
    return { label: 'Healthy', tint: '#166534', bg: '#dcfce7' };
  }
  if (score >= 60) {
    return { label: 'Watch', tint: '#92400e', bg: '#fef3c7' };
  }
  return { label: 'Attention Needed', tint: '#991b1b', bg: '#fee2e2' };
};

const groupPhotosByVisit = (photos: EquipmentAsset[]): PhotoGroup[] => {
  const grouped = new Map<string, EquipmentAsset[]>();
  photos.forEach((photo) => {
    const key = photo.serviceVisitId || 'Ungrouped';
    const current = grouped.get(key) || [];
    grouped.set(key, [...current, photo]);
  });

  return Array.from(grouped.entries())
    .map(([visitId, visitPhotos]) => ({
      visitId,
      photos: visitPhotos.sort((a, b) => toTimestamp(b.capturedAt) - toTimestamp(a.capturedAt)),
    }))
    .sort((a, b) => toTimestamp(b.photos[0]?.capturedAt || '') - toTimestamp(a.photos[0]?.capturedAt || ''));
};

const buildServiceHistory = (record: EquipmentRecord): ServiceVisitHistoryRow[] => {
  const rows = record.generatedServiceReports.map((report, index) => ({
    id: report.id,
    visitId: report.serviceVisitId,
    generatedAt: report.generatedAt,
    name: report.name,
    includedPhotosCount: report.includedPhotoIds.length,
    summary: record.serviceReports[index] || 'Detailed service summary saved in report artifacts.',
  }));

  if (!rows.length && record.serviceVisitSummary.visitCount > 0) {
    return [
      {
        id: `${record.id}-latest-service-fallback`,
        visitId: record.serviceVisitSummary.currentVisitId || `${record.id}-visit-${record.serviceVisitSummary.visitCount}`,
        generatedAt: record.serviceVisitSummary.lastServiceDate,
        name: 'Latest service visit',
        includedPhotosCount: record.serviceVisitSummary.reportPhotos.length,
        summary: 'Service completed and recorded in visit summary.',
      },
    ];
  }

  return rows.sort((a, b) => toTimestamp(b.generatedAt) - toTimestamp(a.generatedAt));
};

const buildTimeline = (record: EquipmentRecord): EquipmentTimelineEvent[] => {
  const syntheticEvents: EquipmentTimelineEvent[] = [];

  record.generatedServiceReports.forEach((report) => {
    syntheticEvents.push({
      id: `${report.id}-report`,
      type: 'Report',
      title: report.name,
      date: report.generatedAt,
      summary: `Visit ${report.serviceVisitId} report generated with ${report.includedPhotoIds.length} linked photos.`,
    });
  });

  record.photoLibrary.slice(0, 6).forEach((photo) => {
    syntheticEvents.push({
      id: `${photo.id}-photo`,
      type: 'Photo',
      title: photo.label,
      date: photo.capturedAt,
      summary: `Captured for ${photo.serviceVisitId || 'Ungrouped'} from ${photo.source || 'unknown source'}.`,
    });
  });

  record.faultHistory.forEach((fault, index) => {
    syntheticEvents.push({
      id: `${record.id}-fault-${index}`,
      type: 'Fault',
      title: `Fault ${record.faultHistory.length - index}`,
      date: record.serviceVisitSummary.lastServiceDate || record.equipment.installationDate,
      summary: fault,
    });
  });

  record.partsReplaced.forEach((part, index) => {
    syntheticEvents.push({
      id: `${record.id}-part-${index}`,
      type: 'Repair',
      title: `${part} replaced`,
      date: record.serviceVisitSummary.lastServiceDate || record.equipment.installationDate,
      summary: 'Part replacement logged in equipment history.',
    });
  });

  record.engineerNotes.forEach((note, index) => {
    syntheticEvents.push({
      id: `${record.id}-engineer-note-${index}`,
      type: 'Engineer Note',
      title: `Engineer Note ${record.engineerNotes.length - index}`,
      date: record.serviceVisitSummary.lastServiceDate || record.equipment.installationDate,
      summary: note,
    });
  });

  return [...record.timeline, ...syntheticEvents].sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
};

export default function EquipmentPassportScreen() {
  const { installationId } = useLocalSearchParams<{ installationId?: string }>();
  const [selectedPhoto, setSelectedPhoto] = useState<EquipmentAsset | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<EquipmentAsset | null>(null);
  const [viewerStatus, setViewerStatus] = useState<string>('');
  const [installation, setInstallation] = useState<EquipmentRecord | undefined>(undefined);
  const installationRepository = getInstallationRepository();

  useEffect(() => {
    const load = async () => {
      if (!installationId) {
        setInstallation(undefined);
        return;
      }

      const passport = await installationRepository.getEquipmentPassport(installationId);
      setInstallation(passport?.equipment);
    };

    load();
  }, [installationId]);

  if (!installation) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Equipment Passport" subtitle="The selected installation could not be found." />
        <SectionCard title="Missing Installation" subtitle="Return to Installations and choose a valid record.">
          <Text style={styles.mutedText}>No installation record is available for this route.</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  const remainingWarrantyDays = getRemainingDays(installation.equipment.warrantyExpiry);
  const warrantyText = formatWarrantyRemaining(remainingWarrantyDays);
  const totalWarrantyDays = getDateDiffDays(installation.equipment.warrantyStart, installation.equipment.warrantyExpiry);
  const remainingWarrantyPercent = totalWarrantyDays
    ? clamp(Math.round((Math.max(remainingWarrantyDays, 0) / totalWarrantyDays) * 100), 0, 100)
    : 0;
  const healthScore = buildHealthScore(installation, remainingWarrantyDays);
  const health = getHealthState(healthScore);
  const photoGroups = groupPhotosByVisit(installation.photoLibrary);
  const serviceHistory = buildServiceHistory(installation);
  const timelineEvents = buildTimeline(installation);

  const onOpenDocument = async (document: EquipmentAsset) => {
    if (document.uri.startsWith('http://') || document.uri.startsWith('https://')) {
      await Linking.openURL(document.uri);
      return;
    }
    setViewerStatus('Document URI is saved but cannot be opened directly in-app for this placeholder source.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} stickyHeaderIndices={[1]}>
      <AppHeader
        title="Equipment Passport v1.0"
        subtitle="Permanent digital record for this heat pump, built from installation, service, photo, and report history."
      />

      <View style={styles.stickyQuickStrip}>
        <Text style={styles.stickyQuickStripTitle}>Field Quick Actions</Text>
        <PrimaryButton
          title="Start Service Visit"
          style={styles.stickyQuickButton}
          onPress={() => {
            router.push(`/installations/${installation.id}/service-visit` as never);
          }}
        />
        <PrimaryButton
          title="Open Photo Workflow"
          style={styles.stickyQuickButton}
          onPress={() => {
            router.push(`/installations/${installation.id}/photos` as never);
          }}
        />
      </View>

      <SectionCard title="System Health" subtitle="Live operational confidence score from existing service data.">
        <View style={styles.scoreRow}>
          <View style={styles.scoreGauge}>
            <Text style={styles.scoreValue}>{healthScore}</Text>
            <Text style={styles.scoreLabel}>/ 100</Text>
          </View>
          <View style={[styles.healthStatePill, { backgroundColor: health.bg }]}>
            <Text style={[styles.healthStateText, { color: health.tint }]}>{health.label}</Text>
          </View>
        </View>
        <Text style={styles.mutedText}>
          Inputs: {installation.performanceHistory.length} performance checks, {installation.faultHistory.length} logged faults,
          {` ${installation.serviceVisitSummary.visitCount}`} completed visits.
        </Text>
      </SectionCard>

      <SectionCard title="Warranty" subtitle="Remaining coverage and expiry from installation record.">
        <Text style={styles.primaryText}>{warrantyText}</Text>
        <Text style={styles.mutedText}>Warranty start: {installation.equipment.warrantyStart}</Text>
        <Text style={styles.mutedText}>Warranty ends: {installation.equipment.warrantyExpiry}</Text>
        <Text style={styles.mutedText}>Coverage remaining: {remainingWarrantyPercent}%</Text>
        <View style={styles.warrantyMeterTrack}>
          <View style={[styles.warrantyMeterFill, { width: `${remainingWarrantyPercent}%` }]} />
        </View>
      </SectionCard>

      <SectionCard title="Performance History" subtitle="Commissioning and performance checkpoints.">
        {installation.performanceHistory.length ? (
          installation.performanceHistory.map((entry, index) => (
            <Text key={`${entry}-${index}`} style={styles.bulletText}>
              - {entry}
            </Text>
          ))
        ) : (
          <Text style={styles.mutedText}>No performance entries yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="Fault History Timeline" subtitle="Chronological fault records from service workflows.">
        {installation.faultHistory.length ? (
          installation.faultHistory.map((entry, index) => (
            <View key={`${entry}-${index}`} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Fault Event {installation.faultHistory.length - index}</Text>
                <Text style={styles.mutedText}>{entry}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>No faults recorded.</Text>
        )}
      </SectionCard>

      <SectionCard title="Parts Replacement History" subtitle="Components replaced across service visits.">
        {installation.partsReplaced.length ? (
          installation.partsReplaced.map((part, index) => (
            <Text key={`${part}-${index}`} style={styles.bulletText}>
              - {part}
            </Text>
          ))
        ) : (
          <Text style={styles.mutedText}>No parts replacements logged.</Text>
        )}
      </SectionCard>

      <SectionCard title="Complete Service Visit History" subtitle="Visit summaries, generated reports, and linked photos.">
        <Text style={styles.mutedText}>Total visits: {installation.serviceVisitSummary.visitCount}</Text>
        <Text style={styles.mutedText}>Last service: {installation.serviceVisitSummary.lastServiceDate || 'Not recorded'}</Text>
        <Text style={styles.mutedText}>Next due: {installation.serviceVisitSummary.nextServiceDue || 'Not scheduled'}</Text>
        <View style={styles.quickNavRow}>
          <PrimaryButton
            title="Open Service Visit Workflow"
            style={styles.quickNavButton}
            onPress={() => {
              router.push(`/installations/${installation.id}/service-visit` as never);
            }}
          />
          <PrimaryButton
            title="Open Visit Photos"
            style={styles.quickNavButton}
            onPress={() => {
              router.push(`/installations/${installation.id}/photos` as never);
            }}
          />
        </View>
        {serviceHistory.length ? (
          serviceHistory.map((visit) => (
            <View key={visit.id} style={styles.reportRow}>
              <Text style={styles.primaryText}>{visit.name}</Text>
              <Text style={styles.mutedText}>Visit: {visit.visitId}</Text>
              <Text style={styles.mutedText}>Generated: {formatDateTime(visit.generatedAt)}</Text>
              <Text style={styles.mutedText}>Photos linked: {visit.includedPhotosCount}</Text>
              <Text style={styles.mutedText}>{visit.summary}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>No generated service reports yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="Photo Gallery" subtitle="Grouped by service visit with full-screen viewer.">
        <PrimaryButton
          title="Capture or Upload Photos"
          style={styles.galleryActionButton}
          onPress={() => {
            router.push(`/installations/${installation.id}/photos` as never);
          }}
        />
        {photoGroups.length ? (
          photoGroups.map((group) => (
            <View key={group.visitId} style={styles.groupCard}>
              <Text style={styles.groupTitle}>{group.visitId}</Text>
              <Text style={styles.mutedText}>{group.photos.length} photos</Text>
              <View style={styles.photoGrid}>
                {group.photos.map((photo) => (
                  <Pressable key={photo.id} style={styles.photoTile} onPress={() => setSelectedPhoto(photo)}>
                    <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                    <Text style={styles.photoCaption} numberOfLines={1}>{photo.label}</Text>
                    <Text style={styles.photoMeta}>{formatDateTime(photo.capturedAt)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>No photos captured yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="Reports & Documents" subtitle="Document list with in-app detail viewer and URI access.">
        {installation.documents.length ? (
          installation.documents.map((doc) => (
            <Pressable key={doc.id} style={styles.documentRow} onPress={() => setSelectedDocument(doc)}>
              <Text style={styles.primaryText}>{doc.label}</Text>
              <Text style={styles.mutedText}>Captured: {formatDateTime(doc.capturedAt)}</Text>
              <Text style={styles.linkText}>View document details</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.mutedText}>No report documents attached yet.</Text>
        )}
        {installation.serviceReports.length ? (
          installation.serviceReports.map((report, index) => (
            <Text key={`${report}-${index}`} style={styles.bulletText}>
              - {report}
            </Text>
          ))
        ) : null}
        {viewerStatus ? <Text style={styles.infoText}>{viewerStatus}</Text> : null}
      </SectionCard>

      <SectionCard title="Equipment Timeline" subtitle="Unified installation, service, faults, photos, reports, and notes stream.">
        {timelineEvents.length ? <EquipmentTimeline events={timelineEvents} /> : <Text style={styles.mutedText}>No timeline events available.</Text>}
      </SectionCard>

      <SectionCard title="Engineer Notes" subtitle="Private field notes kept with the equipment history.">
        {installation.engineerNotes.length ? (
          installation.engineerNotes.map((note, index) => (
            <Text key={`${note}-${index}`} style={styles.bulletText}>
              - {note}
            </Text>
          ))
        ) : (
          <Text style={styles.mutedText}>No engineer notes added.</Text>
        )}
      </SectionCard>

      <SectionCard title="AI Recommendations" subtitle="AI-assisted guidance from previous diagnostics and service outcomes.">
        {installation.aiEngineeringRecommendations.length ? (
          installation.aiEngineeringRecommendations.map((recommendation, index) => (
            <Text key={`${recommendation}-${index}`} style={styles.bulletText}>
              - {recommendation}
            </Text>
          ))
        ) : (
          <Text style={styles.mutedText}>No AI recommendations available yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="QR / NFC" subtitle="Future equipment identification and instant retrieval.">
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrTitle}>Equipment ID Ready</Text>
          <Text style={styles.mutedText}>QR code and NFC tap support will link directly to this passport.</Text>
          <View style={styles.pillRow}>
            <Text style={styles.placeholderPill}>QR: Coming soon</Text>
            <Text style={styles.placeholderPill}>NFC: Coming soon</Text>
          </View>
        </View>
      </SectionCard>

      <Modal
        visible={Boolean(selectedPhoto)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedPhoto(null);
        }}>
        <View style={styles.viewerBackdrop}>
          {selectedPhoto ? (
            <View style={styles.viewerFrame}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.viewerImage} resizeMode="contain" />
              <Text style={styles.viewerTitle}>{selectedPhoto.label}</Text>
              <Text style={styles.viewerMeta}>Captured: {formatDateTime(selectedPhoto.capturedAt)}</Text>
              <Text style={styles.viewerMeta}>Visit: {selectedPhoto.serviceVisitId || 'Ungrouped'}</Text>
              <Text style={styles.viewerMeta}>Source: {selectedPhoto.source || 'unknown'}</Text>
              <Pressable style={styles.viewerCloseButton} onPress={() => setSelectedPhoto(null)}>
                <Text style={styles.viewerCloseText}>Close</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={Boolean(selectedDocument)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedDocument(null);
        }}>
        <View style={styles.viewerBackdrop}>
          {selectedDocument ? (
            <View style={styles.docViewerFrame}>
              <Text style={styles.viewerTitle}>{selectedDocument.label}</Text>
              <Text style={styles.viewerMeta}>Captured: {formatDateTime(selectedDocument.capturedAt)}</Text>
              <Text style={styles.viewerMeta}>Visit: {selectedDocument.serviceVisitId || 'General record'}</Text>
              <Text style={styles.viewerMeta}>URI: {selectedDocument.uri}</Text>
              <Pressable
                style={styles.viewerOpenButton}
                onPress={async () => {
                  await onOpenDocument(selectedDocument);
                }}>
                <Text style={styles.viewerCloseText}>Open Document URI</Text>
              </Pressable>
              <Pressable style={styles.viewerCloseButton} onPress={() => setSelectedDocument(null)}>
                <Text style={styles.viewerCloseText}>Close</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#eef4ff',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stickyQuickStrip: {
    backgroundColor: '#eef4ff',
    paddingTop: 6,
    paddingBottom: 10,
    marginBottom: 4,
  },
  stickyQuickStripTitle: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  stickyQuickButton: {
    minHeight: 44,
    marginBottom: 8,
  },
  scoreGauge: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    color: '#0f172a',
  },
  scoreLabel: {
    fontSize: 14,
    marginLeft: 6,
    marginBottom: 8,
    color: '#64748b',
    fontWeight: '700',
  },
  healthStatePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  healthStateText: {
    fontSize: 13,
    fontWeight: '800',
  },
  primaryText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  mutedText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  infoText: {
    color: '#1e3a8a',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    fontWeight: '700',
  },
  bulletText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    marginTop: 6,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  reportRow: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#f8fbff',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  quickNavRow: {
    marginTop: 12,
    marginBottom: 2,
  },
  quickNavButton: {
    marginBottom: 8,
    minHeight: 46,
  },
  galleryActionButton: {
    marginTop: 4,
    marginBottom: 10,
    minHeight: 46,
  },
  warrantyMeterTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    overflow: 'hidden',
  },
  warrantyMeterFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  groupCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  groupTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoTile: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  photoThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    marginBottom: 6,
  },
  photoCaption: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  photoMeta: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
  },
  documentRow: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    backgroundColor: '#f8fbff',
    padding: 12,
    marginTop: 8,
  },
  linkText: {
    color: '#1d4ed8',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },
  qrPlaceholder: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    padding: 14,
  },
  qrTitle: {
    color: '#1d4ed8',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  placeholderPill: {
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 8,
    marginBottom: 6,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewerFrame: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
  },
  docViewerFrame: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  viewerImage: {
    width: '100%',
    height: 340,
    borderRadius: 12,
    backgroundColor: '#020617',
    marginBottom: 12,
  },
  viewerTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  viewerMeta: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  viewerOpenButton: {
    borderRadius: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  viewerCloseButton: {
    borderRadius: 10,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  viewerCloseText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});