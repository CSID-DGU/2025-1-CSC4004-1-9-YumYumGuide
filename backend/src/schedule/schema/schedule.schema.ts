import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;

@Schema()
export class Event {
  @Prop({ required: true })
  type: string; // 'attraction' | 'restaurant'

  @Prop({ required: true })
  refId: string; // ObjectId (string)

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true })
  budget: number;

  @Prop()
  name: string;

  @Prop()
  location: string;

  @Prop()
  description: string;
}

@Schema()
export class Day {
  @Prop({ required: true })
  day: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  totalBudget: number;

  @Prop({ required: true })
  transportationBudget: number;

  @Prop({ required: true })
  foodBudget: number;

  @Prop({ required: true })
  activityBudget: number;

  @Prop({ type: [Event], required: true })
  events: Event[];
}

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  flightDeparture: string;

  @Prop({ required: true })
  flightArrival: string;

  @Prop({ required: true, type: [String] })
  selectedRegions: string[];

  @Prop({ required: true, type: [String] })
  selectedPlaces: string[];

  @Prop({ required: true })
  budget: number;

  @Prop({ required: true })
  smoking: boolean;

  @Prop({ required: true })
  drinking: boolean;

  @Prop({ required: true })
  travelStyle: string;

  @Prop({ required: true })
  foodPreference: number;

  @Prop({ required: true })
  groupSize: number;

  @Prop({ required: true, type: [String] })
  attractionTypes: string[];

  @Prop({ required: true, type: [Day] })
  days: Day[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

// {
//   "title": "도쿄 2박 3일 여행",
//   "startDate": "2024-07-01",
//   "endDate": "2024-07-03",
//   "days": [
//     {
//       "day": 1,
//       "events": [
//         { "type": "attraction", "refId": "관광지ID1" },
//         { "type": "restaurant", "refId": "식당ID1" },
//         { "type": "attraction", "refId": "관광지ID2" },
//         { "type": "restaurant", "refId": "식당ID2" }
//       ]
//     },
//     {
//       "day": 2,
//       "events": [
//         { "type": "attraction", "refId": "관광지ID3" },
//         { "type": "restaurant", "refId": "식당ID3" }
//       ]
//     }
//   ]
// }