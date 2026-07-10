import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReportCard } from './report-card';
import { SectionCard } from './section-card';
import { VerifiedFieldFixReport } from '../types/verified-field-fixes';

type Props = {
  report: VerifiedFieldFixReport;
};

export function VerifiedFieldFixReportCard({ report }: Props) {
  return (
    <ReportCard title={report.title} generatedAt={report.generatedAt}>
      <SectionCard title="System Details">
        {report.systemDetails.map((item) => (
          <Text key={item.label} style={styles.itemText}>{`${item.label}: ${item.value}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Measurements and Observations">
        {report.measuredAndObserved.map((item) => (
          <Text key={item.label} style={styles.itemText}>{`${item.label}: ${item.value}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Diagnostics and Repair">
        {report.diagnosticsAndRepair.map((item) => (
          <Text key={item.label} style={styles.itemText}>{`${item.label}: ${item.value}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Warnings">
        {report.warnings.map((warning) => (
          <Text key={warning} style={styles.bulletText}>{`• ${warning}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Recommendations">
        {report.recommendations.map((recommendation) => (
          <Text key={recommendation} style={styles.bulletText}>{`• ${recommendation}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Engineer Notes">
        <Text style={styles.itemText}>{report.engineerNotes}</Text>
      </SectionCard>
    </ReportCard>
  );
}

const styles = StyleSheet.create({
  itemText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  bulletText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
});
