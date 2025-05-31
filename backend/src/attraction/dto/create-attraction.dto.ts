import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateAttractionDto {
  @IsString()
  category: string;

  @IsString()
  attraction: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attraction_fuzzy?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  category_fuzzy?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  description_fuzzy?: string[];
}
