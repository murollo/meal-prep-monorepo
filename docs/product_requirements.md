# Requisitos de Produto e Jornada do Usuário (Meal Prep AI)

Este documento descreve as funcionalidades detalhadas, fluxos de telas e a experiência do usuário (UX) esperada para o MVP do organizador de marmitas.

---

## 📱 Fluxos do Aplicativo (Telas)

### Tela 1: Planejamento Semanal (Dashboard)
A tela principal onde o usuário organiza suas refeições para os próximos dias.
* **Componentes:**
  * Seletor de data da semana corrente (ex: Segunda a Domingo).
  * Seletor de **Quantidade de Pessoas** (Global): Um input numérico ou botões `+` e `-` (ex: 1, 2, 3 pessoas).
  * Grid/Lista de dias da semana, cada um contendo duas seções:
    * **Almoço** (Lunch)
    * **Jantar** (Dinner)
  * Cada refeição exibe o nome da receita selecionada ou um botão "Adicionar Refeição" (caso esteja vazio).
* **Ações:**
  * Clicar em "Adicionar Refeição" abre o catálogo de receitas para escolha.
  * Clicar em uma refeição já planejada abre a **Tela 2 (Detalhes da Receita)**.

---

### Tela 2: Detalhes da Receita e Modo de Preparo
Exibe as instruções e ingredientes necessários para uma receita específica.
* **Componentes:**
  * Título da receita e imagem (opcional/gerada).
  * Seletor local de **Quantidade de Pessoas** (iniciado com o valor global selecionado na Tela 1, mas editável).
  * **Lista de Ingredientes:** Exibe nome, quantidade e unidade de medida.
    * *Cálculo Dinâmico:* As quantidades exibidas na tela mudam dinamicamente se o usuário alterar a quantidade de pessoas.
      $$\text{Quantidade Exibida} = \frac{\text{Quantidade Base}}{\text{Servings Base}} \times \text{Pessoas Selecionadas}$$
  * **Modo de Preparo:** Passo a passo detalhado das instruções.

---

### Tela 3: Lista de Compras Consolidada
Onde o usuário vê tudo o que precisa comprar no mercado para a semana inteira.
* **Componentes:**
  * Lista agrupada de todos os ingredientes de todas as receitas planejadas na semana.
  * O app deve somar ingredientes idênticos que usam a mesma unidade de medida.
    * *Exemplo:* Se a receita A pede 300g de arroz e a receita B pede 200g de arroz, a lista exibe:
      `[ ] Arroz: 500g`
  * Caixa de seleção (`checkbox`) ao lado de cada ingrediente.
* **Ações:**
  * O usuário pode marcar itens como "Comprado" ou "Já tenho em casa", riscando o item da lista.

---

### Tela 4: Gerador de Receitas com IA
Interface de chat ou formulário simples para criar receitas sob demanda.
* **Componentes:**
  * Campo de texto para digitar os ingredientes disponíveis em casa (ex: *"Peito de frango, batata doce, creme de leite, cebola"*).
  * Botão "Gerar Receita".
  * Área de exibição do resultado contendo a receita formatada (Título, Ingredientes/Quantidades e Modo de Preparo).
* **Ações:**
  * Clicar em **"Adicionar ao Catálogo de Receitas"**: Salva a receita gerada pela IA diretamente no banco de dados local do usuário para que ela possa ser escolhida no planejamento semanal.

---

## 🛠️ Futuras Melhorias (Pós-MVP)
* **Controle de Estoque:** Cadastrar ingredientes que já possui em casa para que o app os remova automaticamente da lista de compras.
* **Filtros Nutricionais/Dietas:** Classificar receitas como "Low Carb", "Vegana", "Hipercalórica", etc.
* **Exportação da Lista:** Enviar a lista de compras consolidada via WhatsApp ou e-mail.
