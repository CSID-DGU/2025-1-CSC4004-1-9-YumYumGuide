import { IsOptional, IsString, Matches } from 'class-validator';

export class FindScheduleDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, {
    message: 'Start date must be in YYYYMMDD format',
  })
  startDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, {
    message: 'End date must be in YYYYMMDD format',
  })
  endDate?: string;
} 