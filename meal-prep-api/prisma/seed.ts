import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Limpa o banco de dados antes para não duplicar dados ao rodar novamente
  await prisma.recipeIngredient.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.mealPlanItem.deleteMany();
  await prisma.mealPlan.deleteMany();

  // 1. Criar ingredientes comuns de marmita
  const frango = await prisma.ingredient.create({ data: { name: 'peito de frango' } });
  const batataDoce = await prisma.ingredient.create({ data: { name: 'batata doce' } });
  const sal = await prisma.ingredient.create({ data: { name: 'sal' } });
  const arroz = await prisma.ingredient.create({ data: { name: 'arroz integral' } });
  const feijao = await prisma.ingredient.create({ data: { name: 'feijao preto' } });
  const patinho = await prisma.ingredient.create({ data: { name: 'carne patinho moida' } });
  const brocolis = await prisma.ingredient.create({ data: { name: 'brocolis cozido' } });
  const azeite = await prisma.ingredient.create({ data: { name: 'azeite de oliva' } });

  // 2. Criar Receita 1: Frango Grelhado com Batata Doce
  const recipe1 = await prisma.recipe.create({
    data: {
      title: 'Frango com Batata Doce',
      description: 'O clássico combo fitness para marmitas nutritivas e de fácil digestão.',
      instructions: '1. Corte a batata em rodelas ou cubos e asse por 25min.\n2. Tempere as tiras de peito de frango com sal.\n3. Grelhe o frango na frigideira com um fio de azeite.\n4. Divida em potes de marmita na mesma proporção.',
      baseServings: 2,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: recipe1.id, ingredientId: frango.id, quantity: 300, unit: 'g' },
      { recipeId: recipe1.id, ingredientId: batataDoce.id, quantity: 400, unit: 'g' },
      { recipeId: recipe1.id, ingredientId: azeite.id, quantity: 10, unit: 'ml' },
      { recipeId: recipe1.id, ingredientId: sal.id, quantity: 4, unit: 'g' },
    ],
  });

  // 3. Criar Receita 2: Arroz com Feijão e Carne Moída
  const recipe2 = await prisma.recipe.create({
    data: {
      title: 'Arroz, Feijão e Carne Moída',
      description: 'A marmita tradicional brasileira, rica em fibras e proteínas completas.',
      instructions: '1. Refogue o arroz integral em alho e azeite e cozinhe por 20min.\n2. Tempere e aqueça o feijão preto cozido.\n3. Em outra panela, refogue o patinho moído com sal e cebola.\n4. Monte as marmitas colocando partes iguais de cada ingrediente.',
      baseServings: 2,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: recipe2.id, ingredientId: arroz.id, quantity: 200, unit: 'g' },
      { recipeId: recipe2.id, ingredientId: feijao.id, quantity: 150, unit: 'g' },
      { recipeId: recipe2.id, ingredientId: patinho.id, quantity: 300, unit: 'g' },
      { recipeId: recipe2.id, ingredientId: sal.id, quantity: 5, unit: 'g' },
    ],
  });

  // 4. Criar Receita 3: Carne Moída com Brócolis
  const recipe3 = await prisma.recipe.create({
    data: {
      title: 'Carne Moída com Brócolis',
      description: 'Uma excelente opção de marmita Low Carb rica em micronutrientes.',
      instructions: '1. Refogue o patinho moído temperado até dourar.\n2. Cozinhe os buquês de brócolis no vapor por 5 a 7 minutos para mantê-los firmes.\n3. Misture ambos levemente e armazene.',
      baseServings: 1,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: recipe3.id, ingredientId: patinho.id, quantity: 200, unit: 'g' },
      { recipeId: recipe3.id, ingredientId: brocolis.id, quantity: 150, unit: 'g' },
      { recipeId: recipe3.id, ingredientId: sal.id, quantity: 3, unit: 'g' },
    ],
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
