import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttractionDocument = Attraction & Document;

@Schema({ timestamps: true })
export class Attraction {
  @Prop({ type: Types.ObjectId})
  _id: Types.ObjectId;

  @Prop({ required: true })
  attraction: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  category: string;
}

export const AttractionSchema = SchemaFactory.createForClass(Attraction);

// 텍스트 검색을 위한 인덱스 생성
AttractionSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text', 
});

// 지역별 검색을 위한 인덱스
AttractionSchema.index({ region: 1 });

// 지리적 검색을 위한 인덱스
AttractionSchema.index({ location: '2dsphere' });
