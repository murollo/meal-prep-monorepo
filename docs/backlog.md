# Backlog do Projeto (Meal Prep AI)

Lista de tarefas para acompanhar o desenvolvimento do projeto. 

## 📋 Legenda
- [ ] Não iniciado
- [/] Em andamento
- [x] Concluído

---

## 📌 Road to MVP (Minimum Viable Product)

### Fase 1: Configuração Inicial e Documentação
- [x] Definir a Stack de Tecnologia (TypeScript: NestJS + React Native)
- [x] Criar estrutura de documentação básica (`README.md`, `docs/`)
- [ ] Criar o repositório Git local e conectar ao GitHub
- [ ] Desenhar wireframes simples das telas no Figma

### Fase 2: Banco de Dados e Ambiente Local
- [ ] Configurar o `docker-compose.yml` para rodar o banco de dados PostgreSQL localmente
- [ ] Inicializar o projeto NestJS (`meal-prep-api`)
- [ ] Configurar o Prisma ORM e criar a conexão com o banco de dados
- [ ] Criar e rodar a primeira migração do banco (schemas de receitas, ingredientes e planos)

### Fase 3: Desenvolvimento da API (NestJS)
- [ ] Desenvolver CRUD de Receitas (`Recipe`)
- [ ] Desenvolver CRUD de Ingredientes (`Ingredient`)
- [ ] Desenvolver lógica de geração de lista de compras (`Shopping List`) com cálculo escalado de porções por pessoa
- [ ] Integrar com a API do Google Gemini (usando SDK oficial ou Spring AI equivalente para Node.js)
- [ ] Criar o endpoint de sugestão de receita baseado em ingredientes em estoque

### Fase 4: Aplicativo Mobile (React Native / Expo)
- [ ] Inicializar o projeto Expo (`meal-prep-app`) com TypeScript
- [ ] Configurar navegação entre telas (React Navigation ou Expo Router)
- [ ] Construir Tela 1: Planejamento semanal de marmitas (Almoço/Jantar) com seletor de pessoas
- [ ] Construir Tela 2: Detalhes da receita (Modo de preparo e ingredientes proporcionais)
- [ ] Construir Tela 3: Lista de Compras consolidada
- [ ] Construir Tela 4: Chat/Input com IA para receitas baseadas em estoque

### Fase 5: Conectando Tudo e Deploy
- [ ] Consumir os endpoints da API no App Mobile (usando Axios ou Fetch)
- [ ] Fazer deploy do backend (ex: Railway, Render)
- [ ] Escrever a documentação de execução final no `README.md`
- [ ] Gravar um vídeo demonstração para o LinkedIn
