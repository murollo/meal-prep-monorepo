import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Pressable, 
  View,
  Platform,
  Share,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { API_BASE_URL } from '@/constants/config';

interface ShoppingListItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

interface MealPlan {
  id: string;
  peopleCount: number;
}

export default function ShoppingListScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { token } = useAuth();

  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para armazenar itens riscados (comprados)
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [copySuccess, setCopySuccess] = useState(false);

  const generateFormattedText = () => {
    const peopleCount = activePlan?.peopleCount || 1;
    let text = `🛒 *Lista de Compras - Meal Prep* (${peopleCount} ${peopleCount > 1 ? 'pessoas' : 'pessoa'})\n\n`;
    
    items.forEach(item => {
      const isChecked = !!checkedItems[item.ingredientId];
      const checkSymbol = isChecked ? '✅' : '[ ]';
      const capitalizedName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      text += `${checkSymbol} ${capitalizedName}: ${item.quantity} ${item.unit}\n`;
    });

    text += `\n_Gerado pelo Meal Prep AI_`;
    return text;
  };

  const handleShareWhatsApp = async () => {
    const text = generateFormattedText();
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

    try {
      if (Platform.OS === 'web') {
        window.open(whatsappUrl, '_blank');
      } else {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          await Share.share({ message: text });
        }
      }
    } catch (e) {
      console.error('Erro ao compartilhar no WhatsApp:', e);
      Share.share({ message: text });
    }
  };

  const handleCopyText = async () => {
    const text = generateFormattedText();
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        await Share.share({ message: text });
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (e) {
      console.error('Erro ao copiar:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadShoppingList();
    }, [])
  );

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Busca o planejamento semanal mais recente (com cache-busting e JWT)
      const planResponse = await fetch(`${API_BASE_URL}/meal-plans?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!planResponse.ok) {
        throw new Error('Falha ao buscar planejamento ativo.');
      }
      
      const plans = await planResponse.json();
      if (!plans || plans.length === 0) {
        setActivePlan(null);
        setItems([]);
        setLoading(false);
        return;
      }

      const latestPlan = plans[0];
      setActivePlan(latestPlan);

      // 2. Busca a lista de compras consolidada do planejamento (com cache-busting e JWT)
      const listResponse = await fetch(`${API_BASE_URL}/meal-plans/${latestPlan.id}/shopping-list?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!listResponse.ok) {
        throw new Error('Falha ao calcular lista de compras consolidada.');
      }

      const listData = await listResponse.json();
      setItems(listData);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Ocorreu um erro ao carregar a lista.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (ingredientId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [ingredientId]: !prev[ingredientId]
    }));
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.text} />
        <ThemedText style={{ opacity: 0.6 }}>Consolidando ingredientes...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="smallBold" style={{ color: '#ff4d4d' }}>⚠️ Erro</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable onPress={loadShoppingList} style={styles.retryButton}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>Tentar Novamente</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!activePlan || items.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.mainTitle}>Lista de Compras</ThemedText>
          </View>
          <View style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyTitle}>Sua lista está vazia</ThemedText>
            <ThemedText type="default" style={styles.emptyText}>
              Crie um planejamento semanal e adicione receitas para gerar a sua lista de ingredientes automática.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ThemedText type="title" style={styles.mainTitle}>Lista de Compras</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.6 }}>
              Ingredientes escalados para {activePlan.peopleCount} {activePlan.peopleCount > 1 ? 'pessoas' : 'pessoa'}
            </ThemedText>
          </View>

          {items.length > 0 && (
            <View style={[styles.compactBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)', borderWidth: 1 }]}>
              <ThemedText type="smallBold" style={{ color: colors.primary, fontSize: 13 }}>
                {Object.values(checkedItems).filter(Boolean).length}/{items.length}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Barra de Ações (WhatsApp e Copiar) */}
        <View style={styles.actionsBar}>
          <Pressable onPress={handleShareWhatsApp} style={[styles.actionButton, { backgroundColor: '#25D366' }]}>
            <ThemedText type="smallBold" style={{ color: '#fff' }}>📲 WhatsApp</ThemedText>
          </Pressable>

          <Pressable onPress={handleCopyText} style={[styles.actionButton, { backgroundColor: colors.backgroundSelected }]}>
            <ThemedText type="smallBold" style={{ color: colors.text }}>
              {copySuccess ? '✅ Copiado!' : '📋 Copiar Texto'}
            </ThemedText>
          </Pressable>

          <Pressable onPress={loadShoppingList} style={styles.refreshButton}>
            <ThemedText type="smallBold" style={styles.refreshText}>🔄 Atualizar</ThemedText>
          </Pressable>
        </View>

        {/* Lista de Itens */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.ingredientId}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isChecked = !!checkedItems[item.ingredientId];
            return (
              <Pressable 
                onPress={() => toggleCheck(item.ingredientId)}
                style={[
                  styles.itemCard,
                  isChecked && { opacity: 0.5 },
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 }
                ]}>
                
                {/* Checkbox circular customizado */}
                <View style={[
                  styles.checkbox,
                  { borderColor: isChecked ? colors.primary : colors.text },
                  isChecked && [styles.checkboxChecked, { backgroundColor: colors.primary }]
                ]}>
                  {isChecked && <View style={styles.checkmark} />}
                </View>

                {/* Nome e quantidade do ingrediente */}
                <View style={styles.itemInfo}>
                  <ThemedText 
                    type="default" 
                    style={[
                      styles.itemName,
                      isChecked && styles.textStrikethrough
                    ]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText 
                    type="smallBold" 
                    style={[
                      styles.itemQuantity,
                      isChecked && styles.textStrikethrough
                    ]}>
                    {item.quantity} {item.unit}
                  </ThemedText>
                </View>
              </Pressable>
            );
          }}
        />
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
    paddingHorizontal: Spacing.three,
    maxWidth: 800,
    width: '100%',
    paddingTop: Platform.OS === 'web' ? 70 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  compactBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  refreshText: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  errorText: {
    opacity: 0.8,
    textAlign: 'center',
    marginHorizontal: Spacing.five,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 8,
    marginTop: Spacing.two,
  },
  listContainer: {
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.three,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  itemQuantity: {
    opacity: 0.8,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: 400,
  },
});
