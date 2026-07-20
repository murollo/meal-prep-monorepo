import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const { ingredients, ...recipeData } = createRecipeDto;

    // Executamos tudo em uma transação para garantir integridade relacional
    return this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: recipeData,
      });

      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          // Garante que o ingrediente existe no catálogo global (busca ou cria)
          const ingredientNameTrimmed = ing.name.trim();
          const dbIngredient = await tx.ingredient.upsert({
            where: { name: ingredientNameTrimmed },
            update: {},
            create: { name: ingredientNameTrimmed },
          });

          // Cria o relacionamento N:N na tabela associativa com a quantidade/unidade
          await tx.recipeIngredient.create({
            data: {
              recipeId: recipe.id,
              ingredientId: dbIngredient.id,
              quantity: ing.quantity,
              unit: ing.unit,
            },
          });
        }
      }

      return this.findWithIngredients(recipe.id, tx);
    });
  }

  async findAll() {
    return this.prisma.recipe.findMany({
      include: {
        ingredients: {
          select: {
            quantity: true,
            unit: true,
            ingredient: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const recipe = await this.findWithIngredients(id);
    if (!recipe) {
      throw new NotFoundException(`Receita com ID "${id}" não encontrada.`);
    }
    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    const { ingredients, ...recipeData } = updateRecipeDto;

    // Verifica se a receita existe antes de atualizar
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Atualiza dados básicos da receita
      await tx.recipe.update({
        where: { id },
        data: recipeData,
      });

      // 2. Se ingredientes foram passados, sobrescrevemos a lista antiga
      if (ingredients) {
        // Remove associações antigas
        await tx.recipeIngredient.deleteMany({
          where: { recipeId: id },
        });

        // Insere as novas associações
        for (const ing of ingredients) {
          const ingredientNameTrimmed = ing.name.trim();
          const dbIngredient = await tx.ingredient.upsert({
            where: { name: ingredientNameTrimmed },
            update: {},
            create: { name: ingredientNameTrimmed },
          });

          await tx.recipeIngredient.create({
            data: {
              recipeId: id,
              ingredientId: dbIngredient.id,
              quantity: ing.quantity,
              unit: ing.unit,
            },
          });
        }
      }

      return this.findWithIngredients(id, tx);
    });
  }

  async remove(id: string) {
    // Garante que existe antes de tentar deletar
    await this.findOne(id);

    // O cascade no banco configurado via Prisma migrations deletará
    // automaticamente as linhas em RecipeIngredient.
    return this.prisma.recipe.delete({
      where: { id },
    });
  }

  // Método auxiliar reutilizável para buscar a receita formatada com ingredientes
  private async findWithIngredients(id: string, tx?: any) {
    const client = tx || this.prisma;
    return client.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          select: {
            quantity: true,
            unit: true,
            ingredient: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
