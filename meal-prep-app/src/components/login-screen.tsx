import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  View, 
  Platform,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { API_BASE_URL } from '@/constants/config';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao autenticar.');
      }

      // Salva o token no contexto global
      login(data.accessToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.logoText}>MealPrep 🥗</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Organize suas marmitas da semana de forma prática e saudável.
          </ThemedText>
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <ThemedText type="smallBold" style={styles.errorText}>
              ⚠️ {errorMessage}
            </ThemedText>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" style={styles.label}>E-mail</ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text, 
                  borderColor: colors.backgroundSelected,
                  backgroundColor: colors.background 
                }
              ]}
              placeholder="exemplo@email.com"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" style={styles.label}>Senha</ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text, 
                  borderColor: colors.backgroundSelected,
                  backgroundColor: colors.background 
                }
              ]}
              placeholder="Sua senha secreta"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: '#007AFF', opacity: pressed || loading ? 0.8 : 1 }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={styles.buttonText}>
                Entrar
              </ThemedText>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" style={styles.footerText}>
            Ainda não tem uma conta?{' '}
          </ThemedText>
          <Pressable onPress={onNavigateToRegister}>
            <ThemedText type="link" style={styles.linkText}>
              Cadastre-se
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.five,
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CD964', // Cor verde saudável atrativa
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 18,
    marginTop: Spacing.one,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 13,
  },
  form: {
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 12,
    opacity: 0.8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  footerText: {
    opacity: 0.7,
  },
  linkText: {
    fontWeight: '600',
  },
});
