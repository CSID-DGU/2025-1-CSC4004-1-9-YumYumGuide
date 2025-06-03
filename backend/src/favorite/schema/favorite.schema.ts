import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {

  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: Number, enum: [1, 0], required: true })
  smoking: number; // 1: 흡연함, 0: 흡연 안 함

  @Prop({ type: Number, enum: [1, 0], required: true })
  drinking: number; // 1: 음주함, 0: 음주 안 함

  @Prop({ type: Number, enum: [0, 1], required: true })
  travelStyle: number; // 0: 맛집 위주, 1: 관광지 위주

  @Prop({ type: Number, enum: [0, 1, 2, 3], required: true })
  favoriteFood: number; // 0: 육류, 1: 해산물, 2: 면류, 3: 일본식 술집

  @Prop({ type: Number, enum: [0, 1], required: true })
  groupType: number; // 0: 1인&2인, 1: 3인 이상

  @Prop({
    type: [String],
    enum: ['자연', '축제', '역사', '액티비티', '랜드마크'],
    required: true,
    validate: {
      validator: function (v: string[]) {
        return v.length > 0 && v.length <= 2;
      },
      message: props => `${props.path} must have between 1 and 2 items.`,
    },
  })
  attractionType: string[];
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);