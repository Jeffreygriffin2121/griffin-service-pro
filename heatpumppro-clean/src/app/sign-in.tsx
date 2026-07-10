import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../components/app-header';
import { FormInput } from '../components/form-input';
import { PrimaryButton } from '../components/primary-button';
import { SectionCard } from '../components/section-card';
import { useAuth } from '../features/auth/auth-context';

export default function SignInScreen() {
  const { signIn, dataMode } = useAuth();
  const [email, setEmail] = useState<string>('demo@heatpumppro.local');
  const [password, setPassword] = useState<string>('demo1234');
  const [errorText, setErrorText] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorText('Email and password are required.');
      return;
    }

    setErrorText('');
    setBusy(true);

    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      router.replace('/account' as never);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Sign In" subtitle="HeatPump Pro cloud foundation authentication" />

      <SectionCard title="Account Access" subtitle="Sign in with your engineer account. Local demo mode is available by default.">
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="engineer@company.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
        />
        <Text style={styles.helper}>Data mode: {dataMode}</Text>
        <PrimaryButton title={busy ? 'Signing In...' : 'Sign In'} onPress={onSubmit} style={styles.primary} disabled={busy} />
        <PrimaryButton
          title="Create Account"
          onPress={() => {
            router.push('/create-account' as never);
          }}
          style={styles.secondary}
          disabled={busy}
        />
        <PrimaryButton
          title="Forgot Password"
          onPress={() => {
            router.push('/forgot-password' as never);
          }}
          style={styles.secondary}
          disabled={busy}
        />
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
  helper: {
    color: '#334155',
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
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
});
