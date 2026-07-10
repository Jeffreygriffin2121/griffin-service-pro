import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { useAuth } from '../features/auth/auth-context';

export default function CreateAccountScreen() {
  const { createAccount } = useAuth();
  const [companyName, setCompanyName] = useState<string>('');
  const [engineerName, setEngineerName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [successText, setSuccessText] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const onSubmit = async () => {
    const trimmedCompanyName = companyName.trim();
    const trimmedEngineerName = engineerName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedCompanyName || !trimmedEngineerName || !trimmedEmail || !password.trim()) {
      setErrorText('All fields are required.');
      setSuccessText('');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorText('Please enter a valid email address.');
      setSuccessText('');
      return;
    }

    if (password.length < 8) {
      setErrorText('Password must be at least 8 characters long.');
      setSuccessText('');
      return;
    }

    setBusy(true);
    setErrorText('');
    setSuccessText('');

    try {
      const result = await createAccount({
        companyName: trimmedCompanyName,
        engineerName: trimmedEngineerName,
        email: trimmedEmail,
        password,
      });

      if (result.session && !result.needsEmailConfirmation) {
        setSuccessText('Account created successfully. Redirecting to your account...');
        setTimeout(() => {
          router.replace('/account' as never);
        }, 1200);
        return;
      }

      setSuccessText('Account created successfully. Check your email to confirm, then sign in.');
      setTimeout(() => {
        router.replace('/sign-in' as never);
      }, 1200);
    } catch (error) {
      if (error instanceof Error) {
        setErrorText(error.message);
        return;
      }

      console.error('Unexpected signup exception:', error);
      setErrorText('Unexpected signup failure. See browser console for details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Create Account" subtitle="Prepare your company and engineer profile for cloud sync." />

      <SectionCard title="New Account" subtitle="This creates the initial company owner account.">
        <FormInput label="Company Name" value={companyName} onChangeText={setCompanyName} placeholder="Company Ltd" />
        <FormInput label="Engineer Name" value={engineerName} onChangeText={setEngineerName} placeholder="Full name" />
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="owner@company.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create password"
          secureTextEntry
          autoCapitalize="none"
        />

        <PrimaryButton title={busy ? 'Creating Account...' : 'Create Account'} onPress={onSubmit} style={styles.primary} disabled={busy} />
        <PrimaryButton
          title="Back to Sign In"
          onPress={() => {
            router.push('/sign-in' as never);
          }}
          style={styles.secondary}
          disabled={busy}
        />
        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
        {successText ? <Text style={styles.success}>{successText}</Text> : null}
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
  error: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  success: {
    color: '#166534',
    fontWeight: '700',
  },
});
