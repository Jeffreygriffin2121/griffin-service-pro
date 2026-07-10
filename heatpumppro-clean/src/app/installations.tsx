import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { FormSelect } from '../components/form-select';
import { InstallationListCard } from '../components/installations/installation-list-card';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { SyncStatusBadge } from '../components/sync-status-badge';
import { useAuth } from '../features/auth/auth-context';
import { getInstallationRepository } from '../services/cloud';
import { InstallationRecord } from '../services/cloud/repositories/types';

export default function InstallationsScreen() {
	const { loading: authLoading, session, companyName, engineerName } = useAuth();
	const installationRepository = getInstallationRepository();
	const [installations, setInstallations] = useState<InstallationRecord[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorText, setErrorText] = useState<string>('');
	const [searchText, setSearchText] = useState<string>('');
	const [brandFilter, setBrandFilter] = useState<string>('');
	const [isBrandFilterOpen, setIsBrandFilterOpen] = useState<boolean>(false);

	const loadInstallations = useCallback(async () => {
		if (authLoading) {
			return;
		}

		setLoading(true);
		setErrorText('');

		try {
			const rows = await installationRepository.listInstallations();
			setInstallations(rows);
		} catch (error) {
			setInstallations([]);
			setErrorText(error instanceof Error ? error.message : 'Unable to load installations.');
		} finally {
			setLoading(false);
		}
	}, [authLoading, installationRepository]);

	useEffect(() => {
		void loadInstallations();
	}, [loadInstallations]);

	const filteredInstallations = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		const activeBrandFilter = brandFilter === 'All brands' ? '' : brandFilter.trim().toLowerCase();

		return [...installations]
			.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
			.filter((installation) => {
				const matchesSearch = !query || [
					installation.customerName,
					installation.customerPhone,
					installation.customerEmail,
					installation.siteAddress,
					installation.eircode,
					installation.manufacturer,
					installation.modelFamily,
					installation.model,
					installation.exactModelNumber,
					installation.serialNumber,
					installation.indoorSerial,
					installation.outdoorSerial,
				].some((value) => value.toLowerCase().includes(query));

				const matchesBrand = !activeBrandFilter || installation.manufacturer.toLowerCase() === activeBrandFilter;

				return matchesSearch && matchesBrand;
			});
	}, [brandFilter, installations, searchText]);

	const refreshLabel = loading ? 'Loading...' : `Installations: ${installations.length}`;

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<AppHeader
				title="Installations"
				subtitle="Store company-scoped installation records and open each site for details, edit, photos, and service workflows."
			/>

			<SyncStatusBadge compact onPress={() => router.push('/account' as never)} />

			<SectionCard title="Workspace" subtitle="Current account context and fast access to record creation.">
				<Text style={styles.infoText}>Company: {companyName || session?.companyId || 'Not available'}</Text>
				<Text style={styles.infoText}>Engineer: {engineerName || 'Not available'}</Text>
				<Text style={styles.infoText}>{refreshLabel}</Text>
				<PrimaryButton
					title="Add Installation"
					onPress={() => {
						router.push('/installations/new' as never);
					}}
					style={styles.actionButton}
				/>
			</SectionCard>

			<SectionCard title="Search and Filter" subtitle="Find customer records quickly on mobile and desktop.">
				<FormInput
					label="Search Customers"
					value={searchText}
					onChangeText={setSearchText}
					placeholder="Search name, address, brand, serial, or Eircode"
				/>
				<FormSelect
					label="Filter by Brand"
					value={brandFilter}
					placeholder="All brands"
				  options={['All brands', ...Array.from(new Set(installations.map((installation) => installation.manufacturer).filter(Boolean)))]}
					isOpen={isBrandFilterOpen}
					onToggleOpen={() => setIsBrandFilterOpen(!isBrandFilterOpen)}
					onSelect={(value) => {
						setBrandFilter(value === 'All brands' ? '' : value);
						setIsBrandFilterOpen(false);
					}}
				/>
				<Text style={styles.sortLabel}>Sorted by newest first.</Text>
			</SectionCard>

			{loading ? (
				<SectionCard title="Loading Installations" subtitle="Fetching records for the authenticated company scope.">
					<Text style={styles.emptyState}>Loading installations...</Text>
				</SectionCard>
			) : null}

			{errorText ? (
				<SectionCard title="Unable to Load" subtitle="Check the connection or sign in again.">
					<Text style={styles.errorText}>{errorText}</Text>
					<PrimaryButton
						title="Retry"
						onPress={loadInstallations}
						style={styles.actionButton}
					/>
				</SectionCard>
			) : null}

			{!loading && !errorText ? (
				<SectionCard title="Installation List" subtitle="Tap a card to open the full installation record.">
					<View>
						{filteredInstallations.map((installation) => (
							<InstallationListCard
								key={installation.id}
								installation={installation}
								onPress={(installationId) => {
									router.push(`/installations/${installationId}` as never);
								}}
							/>
						))}
						{!filteredInstallations.length ? <Text style={styles.emptyState}>No installations match the current search.</Text> : null}
					</View>
				</SectionCard>
			) : null}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
		paddingBottom: 32,
		backgroundColor: '#f3f7fb',
	},
	infoText: {
		color: '#334155',
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 4,
	},
	actionButton: {
		marginTop: 10,
	},
	sortLabel: {
		color: '#64748b',
		fontSize: 13,
		lineHeight: 18,
	},
	emptyState: {
		color: '#64748b',
		fontSize: 14,
		lineHeight: 20,
	},
	errorText: {
		color: '#b42318',
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 10,
	},
});