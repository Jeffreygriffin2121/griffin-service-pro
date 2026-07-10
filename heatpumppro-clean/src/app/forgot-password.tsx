import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { useAuth } from '../features/auth/auth-context';

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  const onSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorText('Email is required.');
      return;
    }

    setErrorText('');
    setStatusText('');

    setBusy(true);

    try {
      const redirectTo = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/update-password`
        : Linking.createURL('/update-password');

      await forgotPassword(trimmedEmail, redirectTo);
      setStatusText('If an account exists for this email, reset instructions have been queued.');
    } catch (error) {
      console.error('Forgot password failed:', error);
      setErrorText(error instanceof Error ? error.message : 'Unable to process reset request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Forgot Password" subtitle="Password reset foundation for cloud auth providers." />

      <SectionCard title="Reset Password" subtitle="Enter your account email to request password reset instructions.">
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="engineer@company.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <PrimaryButton title={busy ? 'Sending...' : 'Send Reset Instructions'} onPress={onSubmit} style={styles.primary} disabled={busy} />
        <PrimaryButton
          title="Back to Sign In"
          onPress={() => {
            router.push('/sign-in' as never);
          }}
          style={styles.secondary}
          disabled={busy}
        />
        {statusText ? <Text style={styles.success}>{statusText}</Text> : null}
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
  secondary: {
    marginBottom: 10,
    backgroundColor: '#475569',
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
