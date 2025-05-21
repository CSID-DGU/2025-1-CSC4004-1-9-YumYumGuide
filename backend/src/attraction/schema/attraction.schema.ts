import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttractionDocument = Attraction & Document;

@Schema()
export class Attraction {

  address: string;

  attraction: string;

  category: string;

  date: string;

  description: string;


}

export const AttractionSchema = SchemaFactory.createForClass(Attraction);
