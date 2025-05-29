import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  airplaneDepartureTime: string;

  @IsNotEmpty()
  @IsString()
  airplaneArriveTime: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  limitPrice: string;
}