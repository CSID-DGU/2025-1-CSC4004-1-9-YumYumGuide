import { IsInt, IsNumber, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  page: number = 1;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  take: number = 10;
}