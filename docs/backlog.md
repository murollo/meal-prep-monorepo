# Backlog do Projeto (Meal Prep AI)

Lista de tarefas para acompanhar o desenvolvimento do projeto. 

## 📋 Legenda
- [ ] Não iniciado
- [/] Em andamento
- [x] Concluído

---

## 📌 Road to MVP (Minimum Viable Product)

### Fase 1: Configuração Inicial e Documentação
- [/] Criar o repositório Git local (inicializado localmente, falta conectar ao GitHub)
- [ ] Desenhar wireframes simples das telas no Figma (opcional)

### Fase 2: Banco de Dados e Ambiente Local
- [x] Configurar o `docker-compose.yml` para rodar o banco de dados PostgreSQL localmente
- [x] Inicializar o projeto NestJS (`meal-prep-api`)
- [x] Configurar o Prisma ORM e criar a conexão com o banco de dados
- [x] Criar e rodar a primeira migração do banco (schemas de receitas, ingredientes e planos)

### Fase 3: Desenvolvimento do Core da API (NestJS)
- [ ] Desenvolver CRUD de Receitas (`Recipe`)
- [ ] Desenvolver CRUD de Ingredientes (`Ingredient`)
- [ ] Desenvolver lógica de geração de lista de compras (`Shopping List`) com cálculo escalado de porções por pessoa

### Fase 4: Aplicativo Mobile (React Native / Expo) - Core
- [x] Inicializar o projeto Expo (`meal-prep-app`) com TypeScript
- [x] Configurar navegação entre telas (Expo Router)
- [x] Construir Tela 1: Planejamento semanal de marmitas (Almoço/Jantar) com seletor de pessoas
- [x] Construir Tela 2: Detalhes da receita (Modo de preparo e ingredientes proporcionais)
- [x] Construir Tela 3: Lista de Compras consolidada

### Fase 5: Integração com Inteligência Artificial (Opcional - Adiado)
- [ ] Integrar o backend com a API do Google Gemini (usando SDK oficial para Node.js)
- [ ] Criar o endpoint `POST /recipes/generate` para gerar receitas baseadas em estoque
- [ ] Desenvolver a Tela 4 no App Mobile (Interface de geração com IA)

### Fase 6: Conectando Tudo e Deploy
- [x] Consumir os endpoints da API no App Mobile (Conectado via Localhost)
- [ ] Fazer deploy do backend (ex: Railway, Render)
- [ ] Escrever a documentação de execução final no `README.md`
- [ ] Gravar um vídeo demonstração para o LinkedIn

### Fase 7: Nova Aba de Perfil e Segurança (Concluído)
- [x] Criar a Tela 5: Perfil do Usuário (Aba no menu com informações básicas)
- [x] Implementar Avatares Automáticos (Integração com API de Avatares baseada no e-mail)
- [x] Desenvolver endpoint no backend `PATCH /auth/change-password` para troca de senha segura
- [x] Criar formulário de Redefinição de Senha de dentro do perfil do usuário

### Fase 8: Evolução do App e Novas Funcionalidades (Aprovado)
- [x] Desenvolver formulário visual de cadastro e edição de Receitas com Ingredientes e Porções no App
- [x] Criar opção de Exportar/Compartilhar Lista de compras (Copiar texto / WhatsApp)
- [ ] Criar Histórico de planejamentos semanais arquivados no banco de dados
