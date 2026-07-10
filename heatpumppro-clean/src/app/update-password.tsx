import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { supabase } from '../services/cloud/supabase-client';

const MIN_PASSWORD_LENGTH = 8;

export default function UpdatePasswordScreen() {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [successText, setSuccessText] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  const onSubmit = async () => {
    if (busy) {
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorText('Both password fields are required.');
      setSuccessText('');
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorText(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      setSuccessText('');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorText('Passwords do not match.');
      setSuccessText('');
      return;
    }

    setBusy(true);
    setErrorText('');
    setSuccessText('');

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorText(error.message);
        return;
      }

      setSuccessText('Password updated successfully. Redirecting to your account...');
      setTimeout(() => {
        router.replace('/account' as never);
      }, 1200);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Update Password" subtitle="Set a new password for your account." />

      <SectionCard title="Choose New Password" subtitle="Use a strong password that you do not reuse elsewhere.">
        <FormInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
          autoCapitalize="none"
        />
        <FormInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter new password"
          secureTextEntry
          autoCapitalize="none"
        />

        <PrimaryButton
          title={busy ? 'Updating Password...' : 'Update Password'}
          onPress={onSubmit}
          style={styles.primary}
          disabled={busy}
        />

        {successText ? <Text style={styles.success}>{successText}</Text> : null}
        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
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
  },
  primary: {
    marginBottom: 10,
  },
  success: {
    color: '#166534',
    fontWeight: '700',
  },
  error: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
