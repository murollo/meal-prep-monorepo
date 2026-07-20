import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt, 
  Min, 
  IsArray, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateRecipeIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Min(0.01)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsInt()
  @Min(1)
  baseServings: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];
}
