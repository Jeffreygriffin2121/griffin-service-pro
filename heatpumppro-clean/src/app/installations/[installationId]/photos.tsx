import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '../../../components/app-header';
import { PrimaryButton } from '../../../components/primary-button';
import { SectionCard } from '../../../components/section-card';
import { EquipmentAsset, EquipmentRecord } from '../../../types/equipment';
import { getInstallationRepository } from '../../../services/cloud';

const formatDate = (value: string): string => {
  if (!value) {
    return 'Not recorded';
  }
  return value.includes('T') ? value.replace('T', ' ') : value;
};

export default function InstallationPhotosScreen() {
  const { installationId, serviceVisitId } = useLocalSearchParams<{ installationId?: string; serviceVisitId?: string }>();
  const [installation, setInstallation] = useState<EquipmentRecord | undefined>(undefined);
  const [photos, setPhotos] = useState<EquipmentAsset[]>([]);
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

  const activeServiceVisitId = useMemo(() => {
    if (!installation) {
      return '';
    }
    return serviceVisitId || installation.serviceVisitSummary.currentVisitId || `${installation.id}-visit-${installation.serviceVisitSummary.visitCount + 1}`;
  }, [installation, serviceVisitId]);

  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [errorText, setErrorText] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('');

  useEffect(() => {
    const loadPhotos = async () => {
      if (!installation) {
        setPhotos([]);
        return;
      }

      const loaded = await installationRepository.listPhotos(installation.id, activeServiceVisitId);
      setPhotos(loaded);
    };

    loadPhotos();
  }, [activeServiceVisitId, installation, refreshKey]);

  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId);
  if (!installation) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader title="Photo Library" subtitle="The selected installation could not be found." />
        <SectionCard title="Missing Installation" subtitle="Return to Installations and open a valid installation dashboard.">
          <Text style={styles.infoText}>No installation context was available for the photo library.</Text>
          <PrimaryButton
            title="Back to Installations"
            onPress={() => {
              router.replace('/installations' as never);
            }}
          />
        </SectionCard>
      </ScrollView>
    );
  }

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleUploadResult = async (
    source: 'camera' | 'gallery',
    result: ImagePicker.ImagePickerResult,
  ) => {
    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.uri) {
      setErrorText('The selected image did not include a usable URI.');
      return;
    }

    const savedPhoto = await installationRepository.addPhoto(installation.id, {
      label: `${source === 'camera' ? 'Camera' : 'Gallery'} Photo`,
      uri: asset.uri,
      localUri: asset.uri,
      source,
      serviceVisitId: activeServiceVisitId,
      includeInReport: true,
      width: asset.width,
      height: asset.height,
      remoteStoragePath: '',
      uploadStatus: 'local',
      uploadedBy: 'engineer-demo-1',
    });

    if (!savedPhoto) {
      setErrorText('Photo upload failed. Please try again.');
      return;
    }

    setStatusText(`Uploaded to cloud and linked to visit ${activeServiceVisitId}.`);
    setErrorText('');
    refresh();
  };

  const onTakePhoto = async () => {
    setIsUploading(true);
    setStatusText('');
    setErrorText('');

    try {
      if (Platform.OS !== 'web') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          setErrorText('Camera permission is required to take a photo.');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      await handleUploadResult('camera', result);
    } catch (error) {
      setErrorText(`Unable to open camera. ${error instanceof Error ? error.message : 'Unknown error.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onChooseFromGallery = async () => {
    setIsUploading(true);
    setStatusText('');
    setErrorText('');

    try {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!libraryPermission.granted) {
        setErrorText('Media library permission is required to choose a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      await handleUploadResult('gallery', result);
    } catch (error) {
      setErrorText(`Unable to open gallery. ${error instanceof Error ? error.message : 'Unknown error.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onToggleIncludeInReport = (photo: EquipmentAsset) => {
    const run = async () => {
      const updated = await installationRepository.setPhotoIncludeInReport(
        installation.id,
        photo.id,
        !(photo.includeInReport !== false),
      );
      if (!updated) {
        setErrorText('Unable to update photo selection.');
        return;
      }
      setStatusText('Updated report photo selection.');
      setErrorText('');
      refresh();
    };

    run();
  };

  const onDeletePhoto = (photo: EquipmentAsset) => {
    Alert.alert(
      'Delete photo?',
      'This will remove the photo from this installation record. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const removed = await installationRepository.removePhoto(installation.id, photo.id);
            if (!removed) {
              setErrorText('Unable to delete this photo.');
              return;
            }
            setSelectedPhotoId('');
            setStatusText('Photo deleted from this installation and visit.');
            setErrorText('');
            refresh();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader
        title="Photo Library"
        subtitle={`${installation.customer.customerName} - Visit ${activeServiceVisitId}`}
      />

      <SectionCard
        title="Capture & Upload"
        subtitle="Every image is uploaded to cloud storage and linked to this installation + service visit.">
        <PrimaryButton
          title={isUploading ? 'Opening Camera...' : 'Take Photo'}
          onPress={onTakePhoto}
          style={styles.buttonSpacing}
        />
        <PrimaryButton
          title={isUploading ? 'Opening Gallery...' : 'Choose from Gallery'}
          onPress={onChooseFromGallery}
        />
        <Text style={styles.infoText}>Platform support: iOS, Android, and Web via Expo Image Picker.</Text>
        <Text style={styles.infoText}>Photos selected for report: {photos.filter((photo) => photo.includeInReport !== false).length}</Text>
        {statusText ? <Text style={styles.successText}>{statusText}</Text> : null}
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      </SectionCard>

      <SectionCard
        title="Photo Thumbnails"
        subtitle="Tap a thumbnail to open full-screen preview. Toggle report inclusion or delete as needed.">
        {!photos.length ? <Text style={styles.infoText}>No photos saved for this visit yet.</Text> : null}
        <View style={styles.grid}>
          {photos.map((photo) => (
            <Pressable
              key={photo.id}
              style={styles.photoCard}
              onPress={() => {
                setSelectedPhotoId(photo.id);
              }}>
              <Image source={{ uri: photo.uri }} style={styles.thumbnail} resizeMode="cover" />
              <Text style={styles.photoMeta}>Captured: {formatDate(photo.capturedAt)}</Text>
              <Text style={styles.photoMeta}>Source: {photo.source || 'unknown'}</Text>
              <Text style={styles.photoMeta} numberOfLines={1}>Cloud: {photo.cloudUri || 'upload pending'}</Text>
              <PrimaryButton
                title={photo.includeInReport !== false ? 'Included in PDF' : 'Exclude from PDF'}
                style={styles.toggleButton}
                onPress={() => {
                  onToggleIncludeInReport(photo);
                }}
              />
              <PrimaryButton
                title="Delete"
                style={styles.deleteButton}
                onPress={() => {
                  onDeletePhoto(photo);
                }}
              />
            </Pressable>
          ))}
        </View>
      </SectionCard>

      <PrimaryButton
        title="Back to Service Visit"
        onPress={() => {
          router.push(`/installations/${installation.id}/service-visit` as never);
        }}
      />

      <Modal
        visible={Boolean(selectedPhoto)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedPhotoId('');
        }}>
        <View style={styles.viewerBackdrop}>
          {selectedPhoto ? (
            <View style={styles.viewerFrame}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.viewerImage} resizeMode="contain" />
              <Text style={styles.viewerMeta}>{selectedPhoto.label}</Text>
              <Text style={styles.viewerMeta}>Captured: {formatDate(selectedPhoto.capturedAt)}</Text>
              <Text style={styles.viewerMeta}>Visit: {selectedPhoto.serviceVisitId || activeServiceVisitId}</Text>
              <PrimaryButton
                title="Delete Photo"
                style={styles.viewerDeleteButton}
                onPress={() => {
                  onDeletePhoto(selectedPhoto);
                }}
              />
              <PrimaryButton
                title="Close"
                onPress={() => {
                  setSelectedPhotoId('');
                }}
              />
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
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#f3f7fb',
  },
  buttonSpacing: {
    marginBottom: 10,
  },
  infoText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    fontWeight: '700',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe7f6',
    backgroundColor: '#ffffff',
    padding: 8,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  photoMeta: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  toggleButton: {
    minHeight: 42,
    marginTop: 6,
    marginBottom: 6,
  },
  deleteButton: {
    minHeight: 42,
    backgroundColor: '#b91c1c',
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
  viewerImage: {
    width: '100%',
    height: 420,
    borderRadius: 12,
    backgroundColor: '#020617',
    marginBottom: 12,
  },
  viewerMeta: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  viewerDeleteButton: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#b91c1c',
  },
});
