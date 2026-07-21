import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Pressable, 
  View, 
  Modal, 
  FlatList, 
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

const API_BASE_URL = 'http://localhost:3000';

interface Recipe {
  id: string;
  title: string;
}

interface MealPlanItem {
  id?: string;
  dayOfWeek: string;
  mealType: string;
  recipeId: string;
  recipe?: {
    id: string;
    title: string;
  };
}

interface MealPlan {
  id: string;
  weekStartDate: string;
  peopleCount: number;
  items: MealPlanItem[];
}

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Segunda-feira' },
  { key: 'TUESDAY', label: 'Terça-feira' },
  { key: 'WEDNESDAY', label: 'Quarta-feira' },
  { key: 'THURSDAY', label: 'Quinta-feira' },
  { key: 'FRIDAY', label: 'Sexta-feira' },
  { key: 'SATURDAY', label: 'Sábado' },
  { key: 'SUNDAY', label: 'Domingo' },
];

export default function WeeklyPlannerScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [setupPeopleCount, setSetupPeopleCount] = useState<number>(2);

  // Controle de Modal de Seleção de Receitas
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [activeSlot, setActiveSlot] = useState<{ dayOfWeek: string; mealType: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchLatestMealPlan(), fetchRecipes()]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (e) {
      console.error('Erro ao buscar receitas:', e);
    }
  };

  const fetchLatestMealPlan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/meal-plans`);
      if (response.ok) {
        const plans = await response.json();
        if (plans && plans.length > 0) {
          setMealPlan(plans[0]); // Pega o planejamento mais recente
        } else {
          setMealPlan(null);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar planejamentos:', e);
    }
  };

  const handleCreateMealPlan = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/meal-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peopleCount: setupPeopleCount,
          weekStartDate: new Date().toISOString(),
          items: [],
        }),
      });

      if (response.ok) {
        const newPlan = await response.json();
        setMealPlan(newPlan);
      }
    } catch (e) {
      console.error('Erro ao criar planejamento:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMealPlan = async () => {
    if (!mealPlan) return;
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/meal-plans/${mealPlan.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMealPlan(null);
      }
    } catch (e) {
      console.error('Erro ao deletar planejamento:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePeopleCount = async (newCount: number) => {
    if (!mealPlan || newCount < 1) return;
    try {
      setMealPlan({ ...mealPlan, peopleCount: newCount });
      await fetch(`${API_BASE_URL}/meal-plans/${mealPlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peopleCount: newCount,
        }),
      });
    } catch (e) {
      console.error('Erro ao atualizar quantidade de pessoas:', e);
    }
  };

  const openRecipeSelector = (dayOfWeek: string, mealType: string) => {
    setActiveSlot({ dayOfWeek, mealType });
    setModalVisible(true);
  };

  const handleSelectRecipe = async (recipeId: string) => {
    if (!mealPlan || !activeSlot) return;

    // Filtra fora o item atual desse slot se já existir
    const otherItems = mealPlan.items.filter(
      item => !(item.dayOfWeek === activeSlot.dayOfWeek && item.mealType === activeSlot.mealType)
    );

    // Adiciona o novo item
    const updatedItems = [
      ...otherItems,
      {
        dayOfWeek: activeSlot.dayOfWeek,
        mealType: activeSlot.mealType,
        recipeId: recipeId,
      },
    ];

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/meal-plans/${mealPlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems,
        }),
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        setMealPlan(updatedPlan);
      }
    } catch (e) {
      console.error('Erro ao salvar receita no planejamento:', e);
    } finally {
      setSaving(false);
      setModalVisible(false);
      setActiveSlot(null);
    }
  };

  const handleRemoveRecipe = async (dayOfWeek: string, mealType: string) => {
    if (!mealPlan) return;

    // Filtra fora o item desse slot
    const updatedItems = mealPlan.items.filter(
      item => !(item.dayOfWeek === dayOfWeek && item.mealType === mealType)
    );

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/meal-plans/${mealPlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems,
        }),
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        setMealPlan(updatedPlan);
      }
    } catch (e) {
      console.error('Erro ao remover receita do planejamento:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.text} />
        <ThemedText style={{ opacity: 0.6 }}>Carregando planejamento...</ThemedText>
      </ThemedView>
    );
  }

  // 1. Caso de tela de configuração (sem planejamento ativo)
  if (!mealPlan) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.setupCard}>
            <ThemedText type="title" style={styles.setupTitle}>Organize sua Semana</ThemedText>
            <ThemedText type="default" style={styles.setupSubtitle}>
              Crie um planejamento semanal para calcular automaticamente todos os ingredientes das suas marmitas.
            </ThemedText>

            <View style={styles.peopleSelectorCard}>
              <ThemedText type="smallBold">MARMITAS PARA QUANTAS PESSOAS?</ThemedText>
              <View style={styles.counterRow}>
                <Pressable 
                  onPress={() => setSetupPeopleCount(Math.max(1, setupPeopleCount - 1))}
                  style={[styles.counterButton, { backgroundColor: colors.backgroundSelected }]}>
                  <ThemedText type="subtitle">-</ThemedText>
                </Pressable>
                <ThemedText type="title" style={styles.counterValue}>{setupPeopleCount}</ThemedText>
                <Pressable 
                  onPress={() => setSetupPeopleCount(setupPeopleCount + 1)}
                  style={[styles.counterButton, { backgroundColor: colors.backgroundSelected }]}>
                  <ThemedText type="subtitle">+</ThemedText>
                </Pressable>
              </View>
            </View>

            <Pressable 
              onPress={handleCreateMealPlan}
              disabled={saving}
              style={[styles.primaryButton, { backgroundColor: colors.text }]}>
              {saving ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                  Iniciar Novo Planejamento
                </Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 2. Grid do Planejamento Semanal Ativo
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ThemedText type="title" style={styles.mainTitle}>Meu Planejamento</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.6 }}>Cardápio semanal ativo</ThemedText>
          </View>

          {/* Controle rápido de pessoas */}
          <View style={styles.headerPeopleCount}>
            <Pressable 
              onPress={() => handleUpdatePeopleCount(Math.max(1, mealPlan.peopleCount - 1))}
              style={[styles.headerCountBtn, { backgroundColor: colors.backgroundSelected }]}>
              <ThemedText type="smallBold">-</ThemedText>
            </Pressable>
            <ThemedText type="smallBold" style={styles.headerCountVal}>
              {mealPlan.peopleCount} {mealPlan.peopleCount > 1 ? 'Pessoas' : 'Pessoa'}
            </ThemedText>
            <Pressable 
              onPress={() => handleUpdatePeopleCount(mealPlan.peopleCount + 1)}
              style={[styles.headerCountBtn, { backgroundColor: colors.backgroundSelected }]}>
              <ThemedText type="smallBold">+</ThemedText>
            </Pressable>
          </View>

          <Pressable onPress={handleDeleteMealPlan} style={styles.deleteButton}>
            <ThemedText type="smallBold" style={{ color: '#ff4d4d' }}>Excluir</ThemedText>
          </Pressable>
        </View>

        {saving && (
          <View style={styles.savingOverlay}>
            <ActivityIndicator size="small" color={colors.text} />
            <ThemedText type="small" style={{ marginLeft: Spacing.two }}>Atualizando...</ThemedText>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {DAYS_OF_WEEK.map((day) => {
            // Busca itens agendados para este dia
            const lunchItem = mealPlan.items.find(i => i.dayOfWeek === day.key && i.mealType === 'LUNCH');
            const dinnerItem = mealPlan.items.find(i => i.dayOfWeek === day.key && i.mealType === 'DINNER');

            return (
              <ThemedView key={day.key} type="backgroundElement" style={styles.dayCard}>
                <ThemedText type="subtitle" style={styles.dayName}>{day.label}</ThemedText>
                
                <View style={styles.mealsRow}>
                  {/* Bloco Almoço */}
                  <View style={styles.mealBlock}>
                    <ThemedText type="smallBold" style={styles.mealLabel}>Almoço</ThemedText>
                    {lunchItem ? (
                      <View style={[styles.assignedCard, { backgroundColor: colors.background }]}>
                        <ThemedText type="default" numberOfLines={1} style={styles.recipeNameText}>
                          {lunchItem.recipe?.title}
                        </ThemedText>
                        <View style={styles.cardActions}>
                          <Pressable onPress={() => openRecipeSelector(day.key, 'LUNCH')}>
                            <ThemedText type="smallBold" style={styles.actionLinkText}>Trocar</ThemedText>
                          </Pressable>
                          <Pressable onPress={() => handleRemoveRecipe(day.key, 'LUNCH')}>
                            <ThemedText type="smallBold" style={{ color: '#ff4d4d', fontSize: 11 }}>Remover</ThemedText>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <Pressable 
                        onPress={() => openRecipeSelector(day.key, 'LUNCH')}
                        style={[styles.addMealButton, { borderColor: colors.backgroundSelected }]}>
                        <ThemedText type="small" style={styles.addMealText}>+ Almoço</ThemedText>
                      </Pressable>
                    )}
                  </View>

                  {/* Bloco Jantar */}
                  <View style={styles.mealBlock}>
                    <ThemedText type="smallBold" style={styles.mealLabel}>Jantar</ThemedText>
                    {dinnerItem ? (
                      <View style={[styles.assignedCard, { backgroundColor: colors.background }]}>
                        <ThemedText type="default" numberOfLines={1} style={styles.recipeNameText}>
                          {dinnerItem.recipe?.title}
                        </ThemedText>
                        <View style={styles.cardActions}>
                          <Pressable onPress={() => openRecipeSelector(day.key, 'DINNER')}>
                            <ThemedText type="smallBold" style={styles.actionLinkText}>Trocar</ThemedText>
                          </Pressable>
                          <Pressable onPress={() => handleRemoveRecipe(day.key, 'DINNER')}>
                            <ThemedText type="smallBold" style={{ color: '#ff4d4d', fontSize: 11 }}>Remover</ThemedText>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <Pressable 
                        onPress={() => openRecipeSelector(day.key, 'DINNER')}
                        style={[styles.addMealButton, { borderColor: colors.backgroundSelected }]}>
                        <ThemedText type="small" style={styles.addMealText}>+ Jantar</ThemedText>
                      </Pressable>
                    )}
                  </View>
                </View>
              </ThemedView>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Modal para Escolher Receita */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Selecionar Receita</ThemedText>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <ThemedText type="smallBold">Fechar</ThemedText>
              </Pressable>
            </View>

            {recipes.length === 0 ? (
              <View style={styles.modalEmpty}>
                <ThemedText type="default">Nenhuma receita disponível.</ThemedText>
                <ThemedText type="small" style={{ opacity: 0.6, marginTop: Spacing.one }}>
                  Cadastre receitas na aba Receitas primeiro.
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={recipes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable 
                    onPress={() => handleSelectRecipe(item.id)}
                    style={({ pressed }) => [
                      styles.recipeSelectItem,
                      { backgroundColor: pressed ? colors.backgroundSelected : 'transparent' }
                    ]}>
                    <ThemedText type="default">{item.title}</ThemedText>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              />
            )}
          </ThemedView>
        </View>
      </Modal>
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  // Estilos da Tela de Setup (Criação)
  setupCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  setupSubtitle: {
    opacity: 0.7,
    textAlign: 'center',
    marginHorizontal: Spacing.four,
    maxWidth: 500,
  },
  peopleSelectorCard: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.three,
    gap: Spacing.four,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 350,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos do Grid Principal
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerPeopleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  headerCountBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCountVal: {
    paddingHorizontal: Spacing.two,
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  savingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  dayCard: {
    borderRadius: 16,
    padding: Spacing.four,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
  },
  mealsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  mealBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  mealLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  addMealButton: {
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMealText: {
    opacity: 0.7,
  },
  assignedCard: {
    height: 60,
    borderRadius: 12,
    padding: Spacing.two,
    justifyContent: 'space-between',
  },
  recipeNameText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionLinkText: {
    fontSize: 11,
    color: '#007AFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '80%',
    borderRadius: 20,
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalCloseBtn: {
    padding: Spacing.one,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  recipeSelectItem: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
