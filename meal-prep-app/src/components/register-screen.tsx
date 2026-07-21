import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  View, 
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing, Colors } from '@/constants/theme';

const API_BASE_URL = 'http://localhost:3000';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao realizar cadastro.');
      }

      setSuccessMessage('Cadastro realizado com sucesso! Redirecionando...');
      
      // Espera 1.5 segundos para o usuário ver o sucesso e depois redireciona
      setTimeout(() => {
        onNavigateToLogin();
      }, 1500);
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
          <ThemedText type="title" style={styles.logoText}>Cadastre-se 🍎</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Crie sua conta gratuita para planejar seu cardápio semanal saudável.
          </ThemedText>
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <ThemedText type="smallBold" style={styles.errorText}>
              ⚠️ {errorMessage}
            </ThemedText>
          </View>
        )}

        {successMessage && (
          <View style={styles.successContainer}>
            <ThemedText type="smallBold" style={styles.successText}>
              ✅ {successMessage}
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
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              disabled={loading || !!successMessage}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" style={styles.label}>Senha (Mínimo 6 caracteres)</ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text, 
                  borderColor: colors.backgroundSelected,
                  backgroundColor: colors.background 
                }
              ]}
              placeholder="Crie uma senha forte"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              disabled={loading || !!successMessage}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" style={styles.label}>Confirmar Senha</ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text, 
                  borderColor: colors.backgroundSelected,
                  backgroundColor: colors.background 
                }
              ]}
              placeholder="Digite a senha novamente"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              disabled={loading || !!successMessage}
            />
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: '#34C759', opacity: pressed || loading || !!successMessage ? 0.8 : 1 }
            ]}
            onPress={handleRegister}
            disabled={loading || !!successMessage}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={styles.buttonText}>
                Criar Conta
              </ThemedText>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" style={styles.footerText}>
            Já tem uma conta?{' '}
          </ThemedText>
          <Pressable onPress={onNavigateToLogin} disabled={loading || !!successMessage}>
            <ThemedText type="link" style={styles.linkText}>
              Faça Login
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
    color: '#34C759',
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
  successContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  successText: {
    color: '#34C759',
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
    color: '#34C759',
  },
});
