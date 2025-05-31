import { IsString, IsDate, IsArray, IsNumber, IsBoolean, IsEnum, MaxLength } from 'class-validator';

export enum TravelStyle {
  FOOD = 'food',
  SIGHTSEEING = 'sightseeing'
}

export enum AttractionType {
  NATURE = '자연',
  FESTIVAL = '축제',
  HISTORY = '역사',
  ACTIVITY = '액티비티',
  LANDMARK = '랜드마크'
}

export class CreateScheduleDto {
  @IsString()
  userId: string;

  @IsString()
  flightDeparture: string; // 'morning' | 'afternoon' | 'evening' | 'dawn'

  @IsString()
  flightArrival: string; // 'morning' | 'afternoon' | 'evening' | 'dawn'

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsArray()
  @IsString({ each: true })
  selectedRegions: string[]; // 최대 5개

  @IsArray()
  @IsString({ each: true })
  selectedPlaces: string[]; // 최대 5개

  @IsNumber()
  budget: number;

  // 사용자 취향
  @IsBoolean()
  smoking: boolean;

  @IsBoolean()
  drinking: boolean;

  @IsEnum(TravelStyle)
  travelStyle: TravelStyle;

  @IsNumber()
  foodPreference: number; // 0-3

  @IsNumber()
  groupSize: number; // 1&2인: 0, 3인이상: 1

  @IsArray()
  @IsEnum(AttractionType, { each: true })
  attractionTypes: AttractionType[];
}
