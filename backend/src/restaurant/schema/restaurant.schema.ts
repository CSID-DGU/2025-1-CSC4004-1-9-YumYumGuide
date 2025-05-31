import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Restaurant extends Document {
  @Prop({ required: true })
  restaurant_name: string;

  @Prop()
  translated_restaurant_name: string;

  @Prop()
  url: string;

  @Prop()
  tel: string;

  @Prop()
  genre: string;

  @Prop()
  business_hours: string;

  @Prop()
  closed_days: string;

  @Prop()
  budget: string;

  @Prop()
  credit_card: string;

  @Prop()
  ic_card_payment: string;

  @Prop()
  qr_code_payment: string;

  @Prop()
  address: string;

  @Prop()
  entrance: string;

  @Prop()
  parking: string;

  @Prop()
  seats: number;

  @Prop()
  counter_seats: number;

  @Prop()
  smoking: string;

  @Prop()
  private_room: string;

  @Prop()
  private: string;

  @Prop()
  store_website: string;

  @Prop()
  instagram: string;

  @Prop()
  facebook: string;

  @Prop()
  twitter: string;

  @Prop()
  remarks: string;

  @Prop()
  lecture: string;

  @Prop()
  available_drinks: string;

  @Prop()
  cooking_specialties: string;

  @Prop()
  drinking_specialties: string;

  @Prop()
  reservation: string;

  @Prop()
  usage_scenes: string;

  @Prop()
  waiting: string;

  @Prop()
  service: string;

  @Prop()
  dress_code: string;

  @Prop()
  child_friendly: string;

  @Prop()
  pet_friendly: string;

  @Prop()
  power_supply_available: string;

  @Prop()
  wifi_available: string;

  @Prop()
  phone_number: string;

  @Prop()
  foreign_language_support: string;

  @Prop()
  video: string;

  @Prop()
  additional_equipment: string;

  @Prop()
  beer_maker: string;

  @Prop()
  location: string;

  @Prop()
  menuAvgPrice: number;

  @Prop()
  dinner_budget: number;

  @Prop()
  lunch_budget: number;

  @Prop()
  genre_code: number;

  @Prop()
  closed_days_code: number;

  @Prop([String])
  genre_fuzzy: string[];

  @Prop([String])
  translated_restaurant_name_fuzzy: string[];

  @Prop()
  smoking_code: number;

  @Prop()
  drinking_code: number;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant); 