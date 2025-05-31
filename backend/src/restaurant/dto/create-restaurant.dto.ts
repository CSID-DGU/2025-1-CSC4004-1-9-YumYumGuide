import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  restaurant_name: string;

  @IsString()
  @IsOptional()
  translated_restaurant_name?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  tel?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsString()
  @IsOptional()
  business_hours?: string;

  @IsString()
  @IsOptional()
  closed_days?: string;

  @IsString()
  @IsOptional()
  budget?: string;

  @IsString()
  @IsOptional()
  credit_card?: string;

  @IsString()
  @IsOptional()
  ic_card_payment?: string;

  @IsString()
  @IsOptional()
  qr_code_payment?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  entrance?: string;

  @IsString()
  @IsOptional()
  parking?: string;

  @IsNumber()
  @IsOptional()
  seats?: number;

  @IsNumber()
  @IsOptional()
  counter_seats?: number;

  @IsString()
  @IsOptional()
  smoking?: string;

  @IsString()
  @IsOptional()
  private_room?: string;

  @IsString()
  @IsOptional()
  private?: string;

  @IsString()
  @IsOptional()
  store_website?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsOptional()
  twitter?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  lecture?: string;

  @IsString()
  @IsOptional()
  available_drinks?: string;

  @IsString()
  @IsOptional()
  cooking_specialties?: string;

  @IsString()
  @IsOptional()
  drinking_specialties?: string;

  @IsString()
  @IsOptional()
  reservation?: string;

  @IsString()
  @IsOptional()
  usage_scenes?: string;

  @IsString()
  @IsOptional()
  waiting?: string;

  @IsString()
  @IsOptional()
  service?: string;

  @IsString()
  @IsOptional()
  dress_code?: string;

  @IsString()
  @IsOptional()
  child_friendly?: string;

  @IsString()
  @IsOptional()
  pet_friendly?: string;

  @IsString()
  @IsOptional()
  power_supply_available?: string;

  @IsString()
  @IsOptional()
  wifi_available?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  foreign_language_support?: string;

  @IsString()
  @IsOptional()
  video?: string;

  @IsString()
  @IsOptional()
  additional_equipment?: string;

  @IsString()
  @IsOptional()
  beer_maker?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  menuAvgPrice?: number;

  @IsNumber()
  @IsOptional()
  dinner_budget?: number;

  @IsNumber()
  @IsOptional()
  lunch_budget?: number;

  @IsNumber()
  @IsOptional()
  genre_code?: number;

  @IsNumber()
  @IsOptional()
  closed_days_code?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genre_fuzzy?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  translated_restaurant_name_fuzzy?: string[];

  @IsNumber()
  @IsOptional()
  smoking_code?: number;

  @IsNumber()
  @IsOptional()
  drinking_code?: number;
} 