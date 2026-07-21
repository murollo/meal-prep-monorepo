import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUser } from '../auth/decorators/active-user.decorator';

@Controller('meal-plans')
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller exigindo Token JWT
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  create(
    @Body() createMealPlanDto: CreateMealPlanDto,
    @ActiveUser() user: { userId: string },
  ) {
    return this.mealPlansService.create(createMealPlanDto, user.userId);
  }

  @Get()
  findAll(@ActiveUser() user: { userId: string }) {
    return this.mealPlansService.findAll(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @ActiveUser() user: { userId: string },
  ) {
    return this.mealPlansService.findOne(id, user.userId);
  }

  @Get(':id/shopping-list')
  getShoppingList(
    @Param('id') id: string,
    @ActiveUser() user: { userId: string },
  ) {
    return this.mealPlansService.getShoppingList(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
    @ActiveUser() user: { userId: string },
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @ActiveUser() user: { userId: string },
  ) {
    return this.mealPlansService.remove(id, user.userId);
  }
}
