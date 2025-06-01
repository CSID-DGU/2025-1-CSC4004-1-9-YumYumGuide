import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema()
export class Menu {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  restaurant_name: string;

  @Prop()
  translated_restaurant_name: string;

  @Prop({ required: true })
  itemName: string; // Changed 'menu' to 'itemName' for clarity

  @Prop({ required: true })
  price: number;

  @Prop()
  menuAvgPrice: number; // Note: This might be better on the Restaurant schema

  @Prop()
  location: string; // Note: This might be better on the Restaurant schema

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
