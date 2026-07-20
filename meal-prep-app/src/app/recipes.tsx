import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Pressable, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

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
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
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

  useEffect(() => {
    fetchRecipes();
  }, []);

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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.mainTitle}>Catálogo de Receitas</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Explore ideias de refeições balanceadas para as suas marmitas semanais.
          </ThemedText>
        </View>

        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            return (
              <ThemedView type="backgroundElement" style={styles.card}>
                <Pressable onPress={() => toggleExpand(item.id)} style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle" style={styles.recipeTitle}>{item.title}</ThemedText>
                    {item.description && (
                      <ThemedText type="small" style={styles.recipeDescription}>
                        {item.description}
                      </ThemedText>
                    )}
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.backgroundSelected }]}>
                    <ThemedText type="smallBold" style={styles.badgeText}>
                      Serve {item.baseServings} {item.baseServings > 1 ? 'Pessoas' : 'Pessoa'}
                    </ThemedText>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    
                    <ThemedText type="smallBold" style={styles.sectionTitle}>Ingredientes (Base):</ThemedText>
                    {item.ingredients.map((ri, index) => (
                      <ThemedText key={index} type="default" style={styles.ingredientRow}>
                        • {ri.ingredient.name} - {ri.quantity}{ri.unit}
                      </ThemedText>
                    ))}

                    <ThemedText type="smallBold" style={[styles.sectionTitle, { marginTop: Spacing.three }]}>
                      Modo de Preparo:
                    </ThemedText>
                    <ThemedText type="default" style={styles.instructionsText}>
                      {item.instructions}
                    </ThemedText>
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
  },
  header: {
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
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
  instructionsText: {
    opacity: 0.9,
    lineHeight: 20,
    whiteSpace: 'pre-line', // Preserva quebras de linha nativas no Web
  } as any,
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
});
