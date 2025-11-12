import { IsDateString, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateMenuDto {
  @IsDateString() date: string; // '2025-11-12'
  @IsString() mainDish: string;
  @IsOptional() @IsString() sideDish?: string;
  @IsOptional() @IsString() veggies?: string;
  @IsOptional() @IsString() dessert?: string;
  @IsOptional() @IsNumber() priceStudent?: number; // 3.5
  @IsOptional() @IsString() hoursStart?: string; // '11h30'
  @IsOptional() @IsString() hoursEnd?: string;   // '14h00'
}

export class RateMenuDto {
  @IsNumber() @Min(1) @Max(10) score: number;
}

export class CommentMenuDto {
  @IsString() text: string;
}
