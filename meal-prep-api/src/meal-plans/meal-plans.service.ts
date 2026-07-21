import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MealPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto, userId: string) {
    const { items, weekStartDate, peopleCount } = createMealPlanDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Cria o plano semanal (cabeçalho) associado ao usuário logado
      const mealPlan = await tx.mealPlan.create({
        data: {
          weekStartDate: new Date(weekStartDate),
          peopleCount,
          userId, // 👈 Associado ao usuário logado
        },
      });

      // 2. Cria todos os itens vinculados a esse plano (almoço/jantar por dia)
      if (items && items.length > 0) {
        await tx.mealPlanItem.createMany({
          data: items.map((item) => ({
            mealPlanId: mealPlan.id,
            recipeId: item.recipeId,
            dayOfWeek: item.dayOfWeek,
            mealType: item.mealType,
          })),
        });
      }

      return this.findWithDetails(mealPlan.id, tx);
    });
  }

  async findAll(userId: string) {
    // Retorna apenas os planejamentos do usuário logado
    return this.prisma.mealPlan.findMany({
      where: { userId }, // 👈 Filtro por usuário
      include: {
        items: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        weekStartDate: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const plan = await this.findWithDetails(id);
    // Garante que o plano existe E pertence ao usuário autenticado
    if (!plan || plan.userId !== userId) {
      throw new NotFoundException(`Plano de refeição com ID "${id}" não encontrado.`);
    }
    return plan;
  }

  async update(id: string, updateMealPlanDto: UpdateMealPlanDto, userId: string) {
    const { items, weekStartDate, peopleCount } = updateMealPlanDto;

    // Garante que o plano pertence ao usuário autenticado antes de atualizar
    await this.findOne(id, userId);

    return this.prisma.$transaction(async (tx) => {
      // 1. Atualiza cabeçalho do plano
      await tx.mealPlan.update({
        where: { id },
        data: {
          ...(weekStartDate && { weekStartDate: new Date(weekStartDate) }),
          ...(peopleCount && { peopleCount }),
        },
      });

      // 2. Se a lista de itens foi enviada, sobrescrevemos a antiga
      if (items) {
        await tx.mealPlanItem.deleteMany({
          where: { mealPlanId: id },
        });

        if (items.length > 0) {
          await tx.mealPlanItem.createMany({
            data: items.map((item) => ({
              mealPlanId: id,
              recipeId: item.recipeId,
              dayOfWeek: item.dayOfWeek,
              mealType: item.mealType,
            })),
          });
        }
      }

      return this.findWithDetails(id, tx);
    });
  }

  async remove(id: string, userId: string) {
    // Garante que pertence ao usuário antes de deletar
    await this.findOne(id, userId);
    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }

  // Método não-trivial: Algoritmo de Consolidação e Escalonamento de Ingredientes
  async getShoppingList(id: string, userId: string) {
    // Garante que pertence ao usuário
    await this.findOne(id, userId);

    const plan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            recipe: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plano de refeição com ID "${id}" não encontrado.`);
    }

    // Mapa para acumular ingredientes e somar as quantidades consolidadas
    const consolidated: Record<string, { ingredientId: string; name: string; quantity: number; unit: string }> = {};

    for (const item of plan.items) {
      const recipe = item.recipe;
      const baseServings = recipe.baseServings;
      const peopleCount = plan.peopleCount;

      for (const recipeIng of recipe.ingredients) {
        const ingId = recipeIng.ingredientId;
        const ingName = recipeIng.ingredient.name;
        const ingUnit = recipeIng.unit;

        // Fórmula: (Quantidade Base / Porções Base) * Pessoas Planejadas
        const scaledQuantity = (recipeIng.quantity / baseServings) * peopleCount;

        // Chave composta para agrupar por ID do ingrediente e mesma Unidade de Medida
        const key = `${ingId}_${ingUnit}`;

        if (consolidated[key]) {
          consolidated[key].quantity += scaledQuantity;
        } else {
          consolidated[key] = {
            ingredientId: ingId,
            name: ingName,
            quantity: scaledQuantity,
            unit: ingUnit,
          };
        }
      }
    }

    // Retorna a lista de compras consolidada como uma lista de objetos
    return Object.values(consolidated);
  }

  // Método auxiliar reutilizável para carregar o plano com seus relacionamentos
  private async findWithDetails(id: string, tx?: any) {
    const client = tx || this.prisma;
    return client.mealPlan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                baseServings: true,
              },
            },
          },
        },
      },
    });
  }
}
