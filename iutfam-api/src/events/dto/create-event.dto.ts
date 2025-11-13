import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsDateString()
  startsAt!: string; // ISO 8601

  @IsOptional()
  @IsDateString()
  endsAt?: string;   // ISO 8601

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
