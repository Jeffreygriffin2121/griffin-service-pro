import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { FormSelect } from '../components/form-select';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { SyncStatusBadge } from '../components/sync-status-badge';
import { getInstallationRepository } from '../services/cloud';
import { EquipmentAsset } from '../types/equipment';

export default function ReportsScreen() {
  const installationRepository = getInstallationRepository();
  const [installationOptions, setInstallationOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedInstallationId, setSelectedInstallationId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [reports, setReports] = useState<EquipmentAsset[]>([]);
  const [statusText, setStatusText] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const installations = await installationRepository.listInstallations();
      const next = installations.map((item) => ({
        id: item.id,
        label: `${item.customerName} - ${item.id}`,
      }));
      setInstallationOptions(next);
      setSelectedInstallationId((previous) => previous || next[0]?.id || '');
    };

    load();
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      if (!selectedInstallationId) {
        setReports([]);
        return;
      }

      const nextReports = await installationRepository.listReports(selectedInstallationId);
      setReports(nextReports);
    };

    loadReports();
  }, [selectedInstallationId]);

  const selectedLabel = useMemo(
    () => installationOptions.find((item) => item.id === selectedInstallationId)?.label || '',
    [installationOptions, selectedInstallationId],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Reports"
        subtitle="Repository-backed reports and documents across installation records."
      />

      <SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

      <SectionCard title="Installation" subtitle="Choose which installation report history to view.">
        <FormSelect
          label="Installation"
          value={selectedLabel}
          placeholder="Select installation"
          options={installationOptions.map((item) => item.label)}
          isOpen={isDropdownOpen}
          onToggleOpen={() => setIsDropdownOpen((value) => !value)}
          onSelect={(label) => {
            const selected = installationOptions.find((item) => item.label === label);
            setSelectedInstallationId(selected?.id || '');
            setIsDropdownOpen(false);
          }}
        />
        <PrimaryButton
          title="Open Service Visit Workflow"
          onPress={() => {
            if (!selectedInstallationId) {
              return;
            }
            router.push(`/installations/${selectedInstallationId}/service-visit` as never);
          }}
        />
      </SectionCard>

      <SectionCard title="Saved Reports" subtitle="Documents saved by service workflows and repository report APIs.">
        {reports.length ? (
          reports.map((report) => (
            <View key={report.id} style={styles.reportRow}>
              <Text style={styles.reportTitle}>{report.label}</Text>
              <Text style={styles.reportMeta}>Captured: {report.capturedAt}</Text>
              <Text style={styles.reportMeta}>Source: {report.source || 'generated'}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No reports found for this installation yet.</Text>
        )}
        {statusText ? <Text style={styles.statusText}>{statusText}</Text> : null}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#f3f7fb',
    gap: 12,
  },
  reportRow: {
    borderWidth: 1,
    borderColor: '#dbe7f6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  reportTitle: {
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 4,
  },
  reportMeta: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    color: '#64748b',
  },
  statusText: {
    color: '#166534',
    fontWeight: '700',
  },
});
