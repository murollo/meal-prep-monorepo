import { 
  IsDateString, 
  IsInt, 
  Min, 
  IsArray, 
  ValidateNested, 
  IsString, 
  IsIn, 
  IsUUID 
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateMealPlanItemDto {
  @IsUUID()
  recipeId: string;

  @IsString()
  @IsIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
  dayOfWeek: string;

  @IsString()
  @IsIn(['LUNCH', 'DINNER'])
  mealType: string;
}

export class CreateMealPlanDto {
  @IsDateString()
  weekStartDate: string;

  @IsInt()
  @Min(1)
  peopleCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealPlanItemDto)
  items: CreateMealPlanItemDto[];
}
