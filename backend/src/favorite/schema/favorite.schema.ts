import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {

  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ enum: ['예', '아니오'], required: true })
  smoking: string;

  @Prop({ enum: ['예', '아니오'], required: true })
  drinking: string;

  @Prop({ enum: ['맛집 위주', '관광지 위주'], required: true })
  travelStyle: string;

  @Prop({ enum: ['육류', '해산물', '면류', '밥류'], required: true })
  favoriteFood: string;

  @Prop({
    type: [String],
    enum: ['견과류', '해산물', '유제품', '밀가루'],
    default: [],
    required: true
  })
  hateFood: string[];

  @Prop({ enum: ['1인&2인', '3인이상'], required: true })
  groupType: string;

  @Prop({ enum: ['자연', '축제', '역사', '액티비티', '랜드마크'], required: true })
  attractionType: string;

}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
