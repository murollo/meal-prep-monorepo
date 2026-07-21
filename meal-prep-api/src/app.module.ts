import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RecipesModule } from './recipes/recipes.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, RecipesModule, MealPlansModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
