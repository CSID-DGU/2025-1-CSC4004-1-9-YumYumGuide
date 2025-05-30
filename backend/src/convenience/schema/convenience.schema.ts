import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StoreType } from '../dto/get-conveneience.dto';

export type ConvenienceDocument = Convenience & Document;

@Schema({ timestamps: true })
export class Convenience {
  @Prop({ required: true })
  name: string;

  @Prop()
  translatedName?: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, enum: StoreType })
  category: StoreType;

  @Prop()
  imageUrl: string;
}

export const ConvenienceSchema = SchemaFactory.createForClass(Convenience);
