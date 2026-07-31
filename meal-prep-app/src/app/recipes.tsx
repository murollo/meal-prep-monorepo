import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Pressable, 
  View,
  Platform,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/auth-context';

interface Ingredient {
  id: string;
  name: string;
}

interface RecipeIngredient {
  quantity: number;
  unit: string;
  ingredient: Ingredient;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  instructions: string;
  baseServings: number;
  ingredients: RecipeIngredient[];
}

const API_URL = 'http://localhost:3000/recipes';

export default function RecipesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { token } = useAuth();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activePeopleCount, setActivePeopleCount] = useState<number | null>(null);

  // Estados para o Modal de Criação / Edição de Receitas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBaseServings, setFormBaseServings] = useState('2');
  const [formInstructions, setFormInstructions] = useState('');
  const [formIngredients, setFormIngredients] = useState<Array<{ name: string; quantity: string; unit: string }>>([
    { name: '', quantity: '1', unit: 'g' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingRecipeId(null);
    setFormTitle('');
    setFormDescription('');
    setFormBaseServings('2');
    setFormInstructions('');
    setFormIngredients([{ name: '', quantity: '1', unit: 'g' }]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setFormTitle(recipe.title);
    setFormDescription(recipe.description || '');
    setFormBaseServings(String(recipe.baseServings));
    setFormInstructions(recipe.instructions);
    setFormIngredients(
      recipe.ingredients.length > 0
        ? recipe.ingredients.map(ri => ({
            name: ri.ingredient.name,
            quantity: String(ri.quantity),
            unit: ri.unit
          }))
        : [{ name: '', quantity: '1', unit: 'g' }]
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const addIngredientRow = () => {
    setFormIngredients([...formIngredients, { name: '', quantity: '1', unit: 'g' }]);
  };

  const removeIngredientRow = (index: number) => {
    if (formIngredients.length === 1) return;
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  const updateIngredientRow = (index: number, field: 'name' | 'quantity' | 'unit', value: string) => {
    const updated = [...formIngredients];
    updated[index][field] = value;
    setFormIngredients(updated);
  };

  const handleSaveRecipe = async () => {
    if (!formTitle.trim()) {
      setFormError('Informe o título da receita.');
      return;
    }
    if (!formInstructions.trim()) {
      setFormError('Informe o modo de preparo.');
      return;
    }
    const validIngredients = formIngredients.filter(i => i.name.trim().length > 0);
    if (validIngredients.length === 0) {
      setFormError('Adicione pelo menos um ingrediente com nome.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        baseServings: Math.max(1, parseInt(formBaseServings, 10) || 1),
        instructions: formInstructions.trim(),
        ingredients: validIngredients.map(i => ({
          name: i.name.trim(),
          quantity: parseFloat(i.quantity) || 1,
          unit: i.unit.trim() || 'g'
        }))
      };

      const url = editingRecipeId ? `${API_URL}/${editingRecipeId}` : API_URL;
      const method = editingRecipeId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao salvar receita.');
      }

      setIsModalOpen(false);
      fetchRecipes();
    } catch (err: any) {
      setFormError(err.message || 'Ocorreu um erro ao salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Adicionando cache-busting (?t=...) na requisição de receitas
      const response = await fetch(`${API_URL}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar as receitas.');
      }
      const data = await response.json();
      setRecipes(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMealPlan = async () => {
    try {
      const response = await fetch(`http://localhost:3000/meal-plans?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const plans = await response.json();
        if (plans && plans.length > 0) {
          setActivePeopleCount(plans[0].peopleCount);
        } else {
          setActivePeopleCount(null);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar plano ativo:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
      fetchActiveMealPlan();
    }, [])
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.text} />
        <ThemedText style={styles.loadingText}>Carregando catálogo...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="smallBold" style={{ color: '#ff4d4d' }}>⚠️ Erro</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable onPress={fetchRecipes} style={styles.retryButton}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>Tentar Novamente</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const getRecipeTags = (recipe: Recipe) => {
    const tags = [];
    const titleLower = recipe.title.toLowerCase();
    if (titleLower.includes('frango') || titleLower.includes('carne') || titleLower.includes('peixe') || titleLower.includes('ovos') || titleLower.includes('strogonoff')) {
      tags.push({ label: '🔥 Proteico', color: '#F97316' });
    } else {
      tags.push({ label: '🌱 Fit & Leve', color: '#10B981' });
    }
    if (recipe.ingredients.length <= 4) {
      tags.push({ label: '⚡ Rápido', color: '#8B5CF6' });
    } else {
      tags.push({ label: '🍱 Completo', color: '#3B82F6' });
    }
    return tags;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={styles.mainTitle}>Catálogo de Receitas</ThemedText>
              <ThemedText type="default" style={styles.subtitle}>
                Explore e cadastre refeições para suas marmitas semanais.
              </ThemedText>
            </View>
            <Pressable onPress={openCreateModal} style={[styles.createButton, { backgroundColor: colors.primary }]}>
              <ThemedText type="smallBold" style={{ color: '#fff' }}>➕ Nova Receita</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Contador Minimalista */}
        <View style={styles.miniStatsRow}>
          <View style={[styles.miniStatChip, { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 }]}>
            <ThemedText type="smallBold" style={{ color: colors.primary }}>{recipes.length} {recipes.length === 1 ? 'receita' : 'receitas'}</ThemedText>
          </View>
          <View style={[styles.miniStatChip, { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 }]}>
            <ThemedText type="smallBold" style={{ color: colors.textSecondary }}>
              Plano: {activePeopleCount ? `${activePeopleCount} ${activePeopleCount > 1 ? 'pessoas' : 'pessoa'}` : '2 pessoas'}
            </ThemedText>
          </View>
        </View>

        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            const tags = getRecipeTags(item);
            return (
              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: colors.border, borderWidth: 1 }]}>
                <Pressable onPress={() => toggleExpand(item.id)} style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle" style={styles.recipeTitle}>{item.title}</ThemedText>
                    {item.description && (
                      <ThemedText type="small" style={styles.recipeDescription}>
                        {item.description}
                      </ThemedText>
                    )}
                    <View style={styles.tagsRow}>
                      {tags.map((tag, idx) => (
                        <View key={idx} style={[styles.tagPill, { backgroundColor: tag.color + '1A', borderColor: tag.color + '40' }]}>
                          <ThemedText type="smallBold" style={{ color: tag.color, fontSize: 10 }}>{tag.label}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                    <ThemedText type="smallBold" style={[styles.badgeText, { color: colors.primary }]}>
                      Serve {item.baseServings} {item.baseServings > 1 ? 'Pessoas' : 'Pessoa'}
                    </ThemedText>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    
                    {activePeopleCount ? (
                      <>
                        <ThemedText type="smallBold" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                          Ingredientes para {activePeopleCount} {activePeopleCount > 1 ? 'pessoas' : 'pessoa'} (Seu Plano):
                        </ThemedText>
                        {item.ingredients.map((ri, index) => {
                          const scaledQty = Math.round(((ri.quantity / item.baseServings) * activePeopleCount) * 10) / 10;
                          return (
                            <ThemedText key={index} type="default" style={styles.ingredientRow}>
                              • {ri.ingredient.name} - {scaledQty}{ri.unit}
                            </ThemedText>
                          );
                        })}
                        <ThemedText type="small" style={styles.scaleNotice}>
                          * Valores escalonados proporcionalmente conforme seu planejamento ativo.
                        </ThemedText>
                      </>
                    ) : (
                      <>
                        <ThemedText type="smallBold" style={styles.sectionTitle}>
                          Ingredientes (Base para {item.baseServings} {item.baseServings > 1 ? 'pessoas' : 'pessoa'}):
                        </ThemedText>
                        {item.ingredients.map((ri, index) => (
                          <ThemedText key={index} type="default" style={styles.ingredientRow}>
                            • {ri.ingredient.name} - {ri.quantity}{ri.unit}
                          </ThemedText>
                        ))}
                      </>
                    )}

                    <ThemedText type="smallBold" style={[styles.sectionTitle, { marginTop: Spacing.three }]}>
                      Modo de Preparo:
                    </ThemedText>
                    <ThemedText type="default" style={styles.instructionsText}>
                      {item.instructions}
                    </ThemedText>

                    <View style={styles.cardActionsRow}>
                      <Pressable onPress={() => openEditModal(item)} style={styles.editRecipeButton}>
                        <ThemedText type="smallBold" style={{ color: colors.primary }}>✏️ Editar Receita</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                )}
              </ThemedView>
            );
          }}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="default">Nenhuma receita cadastrada ainda.</ThemedText>
            </ThemedView>
          }
        />

        {/* Modal de Cadastro / Edição de Receita */}
        <Modal
          visible={isModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView type="backgroundElement" style={styles.modalContent}>
              <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ gap: Spacing.three }}>
                <ThemedText type="subtitle">
                  {editingRecipeId ? '✏️ Editar Receita' : '🍳 Nova Receita'}
                </ThemedText>

                {formError && (
                  <View style={styles.formErrorContainer}>
                    <ThemedText type="smallBold" style={{ color: '#ff4d4d' }}>⚠️ {formError}</ThemedText>
                  </View>
                )}

                <View style={styles.formField}>
                  <ThemedText type="smallBold">Título da Receita *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    placeholder="Ex: Strogonoff de Frango"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={formTitle}
                    onChangeText={setFormTitle}
                  />
                </View>

                <View style={styles.formField}>
                  <ThemedText type="smallBold">Descrição (Opcional)</ThemedText>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    placeholder="Ex: Prato prático e proteico para a semana"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={formDescription}
                    onChangeText={setFormDescription}
                  />
                </View>

                <View style={styles.formField}>
                  <ThemedText type="smallBold">Porções Base (Pessoas que a receita serve) *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    placeholder="Ex: 2"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                    value={formBaseServings}
                    onChangeText={setFormBaseServings}
                  />
                </View>

                <View style={styles.formField}>
                  <ThemedText type="smallBold">Ingredientes *</ThemedText>
                  {formIngredients.map((ing, idx) => (
                    <View key={idx} style={styles.ingredientFormRow}>
                      <TextInput
                        style={[styles.input, { flex: 2, color: colors.text, borderColor: colors.backgroundSelected }]}
                        placeholder="Nome (ex: Arroz)"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={ing.name}
                        onChangeText={(v) => updateIngredientRow(idx, 'name', v)}
                      />
                      <TextInput
                        style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.backgroundSelected }]}
                        placeholder="Qtd (ex: 200)"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={ing.quantity}
                        onChangeText={(v) => updateIngredientRow(idx, 'quantity', v)}
                      />
                      <TextInput
                        style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.backgroundSelected }]}
                        placeholder="Un. (ex: g)"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={ing.unit}
                        onChangeText={(v) => updateIngredientRow(idx, 'unit', v)}
                      />
                      {formIngredients.length > 1 && (
                        <Pressable onPress={() => removeIngredientRow(idx)} style={styles.removeIngButton}>
                          <ThemedText>🗑️</ThemedText>
                        </Pressable>
                      )}
                    </View>
                  ))}
                  <Pressable onPress={addIngredientRow} style={styles.addIngButton}>
                    <ThemedText type="smallBold" style={{ color: colors.primary }}>+ Adicionar Ingrediente</ThemedText>
                  </Pressable>
                </View>

                <View style={styles.formField}>
                  <ThemedText type="smallBold">Modo de Preparo / Instruções *</ThemedText>
                  <TextInput
                    style={[styles.input, styles.multilineInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    placeholder="Descreva o passo a passo..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline
                    numberOfLines={4}
                    value={formInstructions}
                    onChangeText={setFormInstructions}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalButtonsRow}>
                <Pressable onPress={() => setIsModalOpen(false)} style={styles.cancelModalButton} disabled={submitting}>
                  <ThemedText type="smallBold" style={{ color: '#aaa' }}>Cancelar</ThemedText>
                </Pressable>
                <Pressable onPress={handleSaveRecipe} style={[styles.saveModalButton, { backgroundColor: colors.primary }]} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText type="smallBold" style={{ color: '#fff' }}>
                      {editingRecipeId ? 'Salvar Alterações' : 'Cadastrar Receita'}
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </Modal>
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
    maxWidth: 800, // Limita largura no modo web para não ficar esticado
    paddingTop: Platform.OS === 'web' ? 80 : 0,
  },
  header: {
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  miniStatChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  tagPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  editRecipeButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContent: {
    width: '100%',
    maxWidth: 550,
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formErrorContainer: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    padding: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  formField: {
    gap: Spacing.one,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  multilineInput: {
    height: 90,
    paddingTop: Spacing.two,
    textAlignVertical: 'top',
  },
  ingredientFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  removeIngButton: {
    padding: Spacing.one,
  },
  addIngButton: {
    marginTop: Spacing.one,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelModalButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  saveModalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    opacity: 0.6,
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
    gap: Spacing.three,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  recipeDescription: {
    opacity: 0.7,
    marginTop: Spacing.one,
  },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
  },
  expandedContent: {
    marginTop: Spacing.three,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: Spacing.two,
  },
  ingredientRow: {
    marginLeft: Spacing.two,
    marginBottom: Spacing.one,
    textTransform: 'capitalize',
  },
  scaleNotice: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  instructionsText: {
    opacity: 0.9,
    lineHeight: 20,
    whiteSpace: 'pre-line',
  } as any,
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
});
