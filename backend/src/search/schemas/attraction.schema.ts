import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model, Query } from 'mongoose';
import mongooseFuzzySearching from 'mongoose-fuzzy-searching';

export type AttractionDocument = Attraction & Document;


export interface AttractionModel extends Model<AttractionDocument> {
  fuzzySearch: (query: string | object, condition?: object) => Query<AttractionDocument[], AttractionDocument>;
}

@Schema({ timestamps: true })
export class Attraction {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ required: true })
  attraction: string;

  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  category: string;

  static fuzzySearch: (query: string) => any;
}

export const AttractionSchema = SchemaFactory.createForClass(Attraction);

// 텍스트 검색을 위한 인덱스 생성
// AttractionSchema.index({ 
//   name: 'text', 
//   description: 'text', 
//   category: 'text', 
// });

// 지역별 검색을 위한 인덱스
AttractionSchema.index({ region: 1 });

// 지리적 검색을 위한 인덱스
AttractionSchema.index({ location: '2dsphere' });

export type AttractionModelType = Model<AttractionDocument> & AttractionModel;