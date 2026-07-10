import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReportCard } from './report-card';
import { SectionCard } from './section-card';
import { CommissioningSummary } from '../types/commissioning';

type Props = {
  summary: CommissioningSummary;
};

const getStatusColor = (status: CommissioningSummary['calculatedResults']['status']) => {
  if (status === 'Pass') {
    return '#0f766e';
  }
  if (status === 'Warning') {
    return '#b45309';
  }
  return '#b91c1c';
};

export function CommissioningSummaryCard({ summary }: Props) {
  return (
    <ReportCard title="Commissioning Summary" generatedAt={summary.generatedAt}>
      <SectionCard title="System Details">
        {summary.systemDetails.map((item) => (
          <Text key={item.label} style={styles.itemText}>{`${item.label}: ${item.value}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Measurements">
        {summary.measurements.map((item) => (
          <Text key={item.label} style={styles.itemText}>{`${item.label}: ${item.value}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Calculated Results">
        <Text style={styles.itemText}>{`Delta T: ${summary.calculatedResults.deltaT} degC`}</Text>
        <Text style={[styles.itemText, { color: getStatusColor(summary.calculatedResults.status) }]}> 
          {`Status: ${summary.calculatedResults.status}`}
        </Text>
        <Text style={styles.itemText}>{`Estimated Heat Output: ${summary.calculatedResults.estimatedHeatOutputKw} kW`}</Text>
        <Text style={styles.itemText}>{`Completeness: ${summary.calculatedResults.completenessPercentage}%`}</Text>
      </SectionCard>

      <SectionCard title="Warnings">
        {summary.warnings.length ? (
          summary.warnings.map((warning) => (
            <Text key={warning} style={styles.bulletText}>{`• ${warning}`}</Text>
          ))
        ) : (
          <Text style={styles.itemText}>No warnings raised.</Text>
        )}
      </SectionCard>

      <SectionCard title="Recommendations">
        {summary.recommendations.map((recommendation) => (
          <Text key={recommendation} style={styles.bulletText}>{`• ${recommendation}`}</Text>
        ))}
      </SectionCard>

      <SectionCard title="Engineer Notes">
        <Text style={styles.itemText}>{summary.engineerNotes}</Text>
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