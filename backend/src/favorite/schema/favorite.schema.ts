import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type FavoriteDocument = Favorite & Document;

@Schema()
export class Favorite {

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

