import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model, Query} from 'mongoose';
// import mongooseFuzzySearching from 'mongoose-fuzzy-searching';
// import * as mongooseFuzzySearching from 'mongoose-fuzzy-searching';

export type RestaurantDocument = Restaurant & Document;

export interface RestaurantModel extends Model<RestaurantDocument> {
  fuzzySearch: (query: string | object, condition?: object) => Query<RestaurantDocument[], RestaurantDocument>;
}

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({type: Types.ObjectId})
  _id: Types.ObjectId;

  @Prop({ required: true })
  restaurant_name: string;

  @Prop({require: true})
  translated_restaurant_name: string;

  @Prop()
  // @Prop({ required: true })
  tel: string;

  @Prop()
  // @Prop({ required: true })
  address: string;

  @Prop()
  // @Prop({ required: true })
  genre: string;

  @Prop()
  lunchBudget: string;

  @Prop()
  dinnerBudget: string;
  @Prop()
  budget: string;
  @Prop()
  wifi: boolean;

  static fuzzySearch: (query: string, condition?: object) => any;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// 텍스트 검색을 위한 인덱스 생성
// RestaurantSchema.index({ 
//   translated_restaurant_name: 'text', 
//   genre: 'text',
// });

// 지역별 검색을 위한 인덱스
RestaurantSchema.index({ region: 1 });

// 지리적 검색을 위한 인덱스
RestaurantSchema.index({ location: '2dsphere' });

RestaurantSchema.indexes().forEach(index => {
  if(index[1]['text']) RestaurantSchema.removeIndex(index[0]);
});

export type RestaurantModelType = Model<RestaurantDocument> & RestaurantModel;
