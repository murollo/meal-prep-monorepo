import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  View, 
  Image,
  Platform,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

const API_BASE_URL = 'http://localhost:3000';

// Função auxiliar simples para decodificar a carga útil do JWT (JSON Web Token)
const decodeJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar token:', e);
    return null;
  }
};

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { token, logout } = useAuth();

  // Decodifica o e-mail do token
  const payload = decodeJwt(token);
  const email = payload?.email || 'usuario@email.com';
  
  // Usamos a API do Dicebear para obter um avatar PNG estilizado com base nas iniciais do e-mail
  const avatarUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(email)}&backgroundColor=007aff,34c759,ff9500`;

  // Estados do formulário de redefinição de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve conter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da nova senha não coincide.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao alterar senha.');
      }

      setSuccessMessage('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Bloco de Informações do Usuário */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: avatarUrl }} 
            style={[styles.avatar, { borderColor: colors.backgroundSelected }]} 
          />
          <View style={styles.userInfo}>
            <ThemedText type="subtitle">Perfil do Usuário</ThemedText>
            <ThemedText type="default" style={styles.emailText}>{email}</ThemedText>
          </View>
        </View>

        {/* Formulário de Alteração de Senha */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" style={styles.cardTitle}>ALTERAR SENHA DE ACESSO</ThemedText>
          
          {errorMessage && (
            <View style={styles.errorContainer}>
              <ThemedText type="smallBold" style={styles.errorText}>⚠️ {errorMessage}</ThemedText>
            </View>
          )}

          {successMessage && (
            <View style={styles.successContainer}>
              <ThemedText type="smallBold" style={styles.successText}>✅ {successMessage}</ThemedText>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>Senha Atual</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text, 
                    borderColor: colors.backgroundSelected,
                    backgroundColor: colors.background 
                  }
                ]}
                placeholder="Senha atual"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                disabled={loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>Nova Senha</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text, 
                    borderColor: colors.backgroundSelected,
                    backgroundColor: colors.background 
                  }
                ]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                disabled={loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>Confirmar Nova Senha</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text, 
                    borderColor: colors.backgroundSelected,
                    backgroundColor: colors.background 
                  }
                ]}
                placeholder="Repita a nova senha"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                disabled={loading}
              />
            </View>

            <Pressable 
              style={({ pressed }) => [
                styles.button, 
                { backgroundColor: '#007AFF', opacity: pressed || loading ? 0.8 : 1 }
              ]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="smallBold" style={styles.buttonText}>
                  Atualizar Senha
                </ThemedText>
              )}
            </Pressable>
          </View>
        </ThemedView>

        {/* Botão de Logout */}
        <Pressable 
          style={({ pressed }) => [
            styles.logoutButton, 
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={logout}
        >
          <ThemedText type="smallBold" style={styles.logoutText}>
            Sair da Conta 🚪
          </ThemedText>
        </Pressable>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: 800,
    paddingTop: Platform.OS === 'web' ? 80 : 0,
    gap: Spacing.four,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  userInfo: {
    gap: Spacing.one,
  },
  emailText: {
    opacity: 0.6,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: 12,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 8,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 13,
  },
  successContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
    padding: Spacing.two,
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
    opacity: 0.7,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  button: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  buttonText: {
    color: '#fff',
  },
  logoutButton: {
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff4d4d',
  },
});
