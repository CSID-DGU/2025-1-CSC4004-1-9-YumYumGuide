import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true })
export class Schedule {

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  days: Day[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

class Event {
  @Prop({ required: true })
  type: string; // 'attraction' | 'restaurant'

  @Prop({ required: true })
  refId: string; // ObjectId (string)
}

class Day {
  @Prop({ required: true })
  day: number;

  @Prop({ type: [Event], required: true })
  events: Event[];
}


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