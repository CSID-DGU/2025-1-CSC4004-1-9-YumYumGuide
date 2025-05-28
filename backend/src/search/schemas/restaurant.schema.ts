import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({type: Types.ObjectId})
  _id: Types.ObjectId;

  @Prop({ required: true })
  restaurant_name: string;

  @Prop({ required: true })
  tel: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  genre: string;

  @Prop({required: true})
  lunchBudget: string;

  @Prop({required: true})
  dinnerBudget: string;
  @Prop({required: true})
  budget: string;
  @Prop({required: true})
  wifi: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// 텍스트 검색을 위한 인덱스 생성
RestaurantSchema.index({ 
  name: 'text', 
  genre: 'text',
});

// 지역별 검색을 위한 인덱스
RestaurantSchema.index({ region: 1 });

// 지리적 검색을 위한 인덱스
RestaurantSchema.index({ location: '2dsphere' });
