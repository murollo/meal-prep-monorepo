# Modelagem do Banco de Dados (PostgreSQL)

Esquema relacional projetado para suportar o planejamento de marmitas e a geração de listas de compras dinâmicas.

---

## 📊 Entidades e Atributos

### 1. `Recipe` (Receitas)
Representa as receitas cadastradas no sistema.
* `id`: UUID (Primary Key)
* `title`: VARCHAR(255) - Título da receita.
* `description`: TEXT - Breve descrição da receita.
* `instructions`: TEXT - Passo a passo do modo de preparo.
* `baseServings`: INT - Quantidade padrão de porções/pessoas que esta receita serve (ex: 2 pessoas).
* `createdAt`: TIMESTAMP
* `updatedAt`: TIMESTAMP

### 2. `Ingredient` (Ingredientes)
Catálogo global de ingredientes para evitar duplicações e facilitar consolidação na lista de compras.
* `id`: UUID (Primary Key)
* `name`: VARCHAR(255) (Unique) - Nome do ingrediente (ex: "Peito de Frango", "Sal", "Arroz").
* `createdAt`: TIMESTAMP

### 3. `RecipeIngredient` (Ingredientes da Receita)
Tabela de junção (N:N) que detalha quais ingredientes compõem uma receita e suas respectivas quantidades base.
* `recipeId`: UUID (Foreign Key -> Recipe.id)
* `ingredientId`: UUID (Foreign Key -> Ingredient.id)
* `quantity`: FLOAT - Quantidade base do ingrediente (ex: 500, 2, 1.5).
* `unit`: VARCHAR(50) - Unidade de medida (ex: "g", "kg", "unidade", "colher de sopa").
* *Chave Primária Composta:* `(recipeId, ingredientId)`

### 4. `MealPlan` (Plano de Marmitas Semanal)
Cabeçalho do planejamento semanal.
* `id`: UUID (Primary Key)
* `weekStartDate`: DATE - Data de início da semana correspondente (geralmente a segunda-feira).
* `peopleCount`: INT - Quantidade de pessoas que consumirão essas refeições (usado para calcular a lista de compras).
* `createdAt`: TIMESTAMP

### 5. `MealPlanItem` (Itens do Plano de Marmitas)
Detalhamento de quais receitas serão consumidas em cada dia e refeição.
* `id`: UUID (Primary Key)
* `mealPlanId`: UUID (Foreign Key -> MealPlan.id)
* `recipeId`: UUID (Foreign Key -> Recipe.id)
* `dayOfWeek`: VARCHAR(20) - Dia da semana (ex: "MONDAY", "TUESDAY").
* `mealType`: VARCHAR(20) - Tipo da refeição (ex: "LUNCH", "DINNER").

---

## 📐 Cálculo Dinâmico de Ingredientes
Para calcular os ingredientes necessários na lista de compras da semana para `N` pessoas, a API fará a seguinte query/lógica:

1. Buscar todos os `MealPlanItem` da semana ativa.
2. Juntar (`JOIN`) com `Recipe` e `RecipeIngredient`.
3. Multiplicar a quantidade de cada ingrediente pela fórmula:
   $$\text{Quantidade Final} = \sum \left( \frac{\text{RecipeIngredient.quantity}}{\text{Recipe.baseServings}} \times \text{MealPlan.peopleCount} \right)$$
4. Agrupar pelo `Ingredient.name` e somar as quantidades que compartilham da mesma unidade de medida (`unit`).
