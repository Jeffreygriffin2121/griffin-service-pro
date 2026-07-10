import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { AppHeader } from './app-header';
import { SectionCard } from './section-card';

type Props = {
  title: string;
  subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <AppHeader title={title} subtitle={subtitle} />
      <SectionCard title="Module Status" subtitle="This action is available from Installations and kept separate so future workflow details can be added without changing navigation.">
        <Text style={styles.text}>This module is staged and does not change the current installation records flow.</Text>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef4f8',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  text: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
});