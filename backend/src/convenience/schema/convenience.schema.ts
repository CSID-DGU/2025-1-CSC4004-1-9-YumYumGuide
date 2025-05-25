import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type ConvenienceDocument = Convenience & Document;

@Schema()
export class Convenience {

  name: string;

  price: string;

  category: string;

  store: string;

  translatedName: string;

  imageUrl: string;

}

export const ConvenienceSchema = SchemaFactory.createForClass(Convenience);
