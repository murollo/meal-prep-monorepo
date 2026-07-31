import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  View, 
  Image,
  Platform,
  Modal,
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

const AVATAR_STYLES = [
  { id: 'initials', name: 'Iniciais' },
  { id: 'bottts', name: 'Robôs' },
  { id: 'avataaars', name: 'Pessoas' },
  { id: 'fun-emoji', name: 'Emojis' },
  { id: 'lorelei', name: 'Ilustração' },
  { id: 'adventurer', name: 'Aventura' },
  { id: 'big-smile', name: 'Sorrisos' },
];

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { token, logout } = useAuth();

  // Decodifica o e-mail do token
  const payload = decodeJwt(token);
  const email = payload?.email || 'usuario@email.com';
  
  // Estado para estilo de avatar selecionado e controle do modal
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('initials');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getAvatarUrl = (style: string) => {
    return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(email)}&backgroundColor=007aff,34c759,ff9500`;
  };

  const avatarUrl = getAvatarUrl(selectedAvatarStyle);

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
        
        {/* Bloco de Informações do Usuário com Botão de Trocar Ícone */}
        <View style={styles.profileHeader}>
          <Pressable onPress={() => setIsModalOpen(true)} style={styles.avatarContainer}>
            <View style={[styles.avatarGlowRing, { borderColor: colors.primary }]}>
              <Image 
                source={{ uri: avatarUrl }} 
                style={[styles.avatar, { borderColor: colors.background }]} 
              />
            </View>
            <View style={styles.editBadge}>
              <ThemedText style={styles.editBadgeText}>✏️</ThemedText>
            </View>
          </Pressable>

          <View style={styles.userInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ThemedText type="subtitle">Perfil do Usuário</ThemedText>
              <View style={[styles.statusTag, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', borderWidth: 1 }]}>
                <ThemedText type="smallBold" style={{ color: colors.primary, fontSize: 10 }}>🟢 ATIVO</ThemedText>
              </View>
            </View>
            <ThemedText type="default" style={styles.emailText}>{email}</ThemedText>
            <Pressable onPress={() => setIsModalOpen(true)} style={styles.changeIconButton}>
              <ThemedText type="smallBold" style={{ color: colors.primary }}>
                🎨 Trocar Estilo de Ícone
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Card de Estatísticas da Conta */}
        <ThemedView type="backgroundElement" style={[styles.statsCard, { borderColor: colors.border, borderWidth: 1 }]}>
          <View style={styles.statBox}>
            <ThemedText type="title" style={{ color: colors.primary, fontSize: 18 }}>PostgreSQL</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.7, fontSize: 11 }}>Neon Cloud</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <ThemedText type="title" style={{ color: colors.secondary, fontSize: 18 }}>NestJS 11</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.7, fontSize: 11 }}>API REST</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <ThemedText type="title" style={{ color: '#8B5CF6', fontSize: 18 }}>Expo 57</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.7, fontSize: 11 }}>React Native</ThemedText>
          </View>
        </ThemedView>

        {/* Modal de Escolha de Avatar */}
        <Modal
          visible={isModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView type="backgroundElement" style={[styles.modalContent, { borderColor: colors.border }]}>
              <ThemedText type="subtitle" style={{ marginBottom: 4 }}>Escolha seu Avatar</ThemedText>
              <ThemedText type="small" style={{ opacity: 0.7, marginBottom: 16 }}>
                Selecione o estilo do ícone da sua foto de perfil:
              </ThemedText>

              <View style={styles.avatarGrid}>
                {AVATAR_STYLES.map((style) => {
                  const url = getAvatarUrl(style.id);
                  const isSelected = selectedAvatarStyle === style.id;
                  return (
                    <Pressable
                      key={style.id}
                      style={[
                        styles.avatarOption,
                        isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: 'rgba(16, 185, 129, 0.15)' }
                      ]}
                      onPress={() => {
                        setSelectedAvatarStyle(style.id);
                        setIsModalOpen(false);
                      }}
                    >
                      <Image source={{ uri: url }} style={styles.avatarOptionImage} />
                      <ThemedText type="smallBold" style={{ fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                        {style.name}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable 
                style={[styles.button, { backgroundColor: colors.backgroundSelected, marginTop: 16 }]}
                onPress={() => setIsModalOpen(false)}
              >
                <ThemedText type="smallBold" style={{ color: colors.text }}>Fechar</ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        </Modal>

        {/* Formulário de Alteração de Senha */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: colors.border, borderWidth: 1 }]}>
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
                { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 }
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1c1c1e',
  },
  avatarGlowRing: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statsCard: {
    borderRadius: 16,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.two,
  },
  statBox: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  editBadgeText: {
    fontSize: 10,
  },
  changeIconButton: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 8,
  },
  avatarOption: {
    width: 90,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarOptionImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
