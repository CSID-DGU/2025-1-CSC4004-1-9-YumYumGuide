import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  restaurant_name: string;

  @IsOptional()
  @IsString()
  translated_restaurant_name?: string;

  @IsString()
  itemName: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  menuAvgPrice?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  restaurant_id: string; // Use string for DTO input, Mongoose will cast to ObjectId
}
