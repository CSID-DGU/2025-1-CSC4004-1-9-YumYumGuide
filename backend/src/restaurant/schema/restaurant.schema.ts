import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Restaurant {
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
  qr_code_payment: string;

  @Prop()
  address: string;

  @Prop()
  entrance: string;

  @Prop()
  seats: number;

  @Prop()
  smoking: string;

  @Prop()
  drinking: string;

  @Prop()
  private_room: string;

  @Prop()
  video: string;

  @Prop()
  location: string;

  @Prop()
  dinner_budget: number;

  @Prop()
  lunch_budget: number;

  @Prop()
  genre_code: number;

  @Prop([String])
  genre_fuzzy: string[];

  @Prop([String])
  translated_restaurant_name_fuzzy: string[];
}
export type RestaurantDocument = Restaurant & Document;
export const RestaurantSchema = SchemaFactory.createForClass(Restaurant); 