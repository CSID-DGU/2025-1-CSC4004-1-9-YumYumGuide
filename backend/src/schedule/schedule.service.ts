import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './schema/schedule.schema';
import { ApiResponseDto } from 'src/common/response/api.response.dto';

function yyyymmddStringToUtcDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // JavaScript의 month는 0부터 시작
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(Date.UTC(year, month, day));
}

function dateToYYYYMMDDNumber(date: Date): number {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dayOfMonth = date.getUTCDate().toString().padStart(2, '0');
  return parseInt(`${year}${month}${dayOfMonth}`);
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
  ) { }

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    try {
      const createdSchedule = new this.scheduleModel(createScheduleDto);
      return await createdSchedule.save();
    } catch (error) {
      throw new Error(`Failed to create schedule: ${error.message}`);
    }
  }


  async findSchedule(
    userId: string,
    startDate?: string, // 사용자 요청 시작일 "YYYYMMDD"
    endDate?: string,   // 사용자 요청 종료일 "YYYYMMDD"
  ): Promise<ApiResponseDto<Schedule[]>> {
    // Logger 인스턴스 생성 (선택 사항, 디버깅에 유용)
    const logger = new Logger('ScheduleService');

    try {
      const allSchedulesForUser = await this.scheduleModel
        .find({ userId })
        .lean()
        .exec() as Schedule[];

      if (!startDate || !endDate) {
        return new ApiResponseDto<Schedule[]>(
          true,
          200,
          'Schedules retrieved successfully (no date range filter applied)',
          allSchedulesForUser,
        );
      }

      if (!/^\d{8}$/.test(startDate) || !/^\d{8}$/.test(endDate)) {
        throw new BadRequestException('Invalid date format. Dates must be in YYYYMMDD format.');
      }

      const queryStartDateNum = parseInt(startDate);
      const queryEndDateNum = parseInt(endDate);

      if (queryStartDateNum > queryEndDateNum) {
        throw new BadRequestException('Start date cannot be later than end date.');
      }

      const overlappingSchedules = allSchedulesForUser.filter(schedule => {
        // .toString()을 사용하여 명시적으로 문자열로 변환
        const scheduleOwnStartDateNum = parseInt(schedule.startDate.toString());
        const scheduleOwnEndDateNum = parseInt(schedule.endDate.toString());
        console.log(scheduleOwnStartDateNum <= queryEndDateNum);
        console.log(scheduleOwnEndDateNum >= queryStartDateNum);
        return scheduleOwnStartDateNum <= queryEndDateNum && scheduleOwnEndDateNum >= queryStartDateNum;
      });

      const finalSchedules = overlappingSchedules.map(schedule => {
        // .toString()을 사용하여 명시적으로 문자열로 변환
        const scheduleBaseDate = yyyymmddStringToUtcDate(schedule.startDate.toString());

        const filteredDays = schedule.days.filter(dayObj => {
          const currentDayDate = new Date(scheduleBaseDate.getTime());
          currentDayDate.setUTCDate(scheduleBaseDate.getUTCDate() + (dayObj.day - 1));
          const dayActualDateNum = dateToYYYYMMDDNumber(currentDayDate);
          return dayActualDateNum >= queryStartDateNum && dayActualDateNum <= queryEndDateNum;
        });

        return { ...schedule, days: filteredDays };
      });

      return new ApiResponseDto<Schedule[]>(
        true,
        200,
        'Schedules retrieved and days filtered successfully',
        finalSchedules,
      );

    } catch (error) {
      logger.error(`Failed to find schedules for user ${userId}: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        // 이미 BadRequestException인 경우 그대로 throw
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred while processing schedules.');
    }
  }

  async deleteSchedule(scheduleId: string): Promise<ApiResponseDto<null>> {
    try {
      const schedule = await this.scheduleModel.findById(scheduleId);

      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      await this.scheduleModel.deleteOne({ _id: scheduleId });
      return new ApiResponseDto(true, 200, 'Schedule deleted successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete schedule: ${error.message}`);
    }
  }

  async createSampleData(userId: string): Promise<Schedule> {
    try {
      const sampleSchedule = {
        userId,
        title: "도쿄 2박 3일 여행",
        startDate: "20250701",
        endDate: "20250703",
        days: [
          {
            day: 1,
            events: [
              { type: "attraction", refId: "65f1a2b3c4d5e6f7g8h9i0j1", name: "도쿄 스카이트리" },
              { type: "restaurant", refId: "65f1a2b3c4d5e6f7g8h9i0j2", name: "스시 사이토" },
              { type: "attraction", refId: "65f1a2b3c4d5e6f7g8h9i0j3", name: "시부야 스크램블" },
              { type: "restaurant", refId: "65f1a2b3c4d5e6f7g8h9i0j4", name: "이치란 라멘" }
            ]
          },
          {
            day: 2,
            events: [
              { type: "attraction", refId: "65f1a2b3c4d5e6f7g8h9i0j5", name: "아사쿠사 센소지" },
              { type: "restaurant", refId: "65f1a2b3c4d5e6f7g8h9i0j6", name: "츠키지 시장" },
              { type: "attraction", refId: "65f1a2b3c4d5e6f7g8h9i0j7", name: "도쿄 디즈니랜드" },
              { type: "restaurant", refId: "65f1a2b3c4d5e6f7g8h9i0j8", name: "우나기노키도" }
            ]
          },
          {
            day: 3,
            events: [
              { type: "attraction", refId: "65f1a2b3c4d5e6f7g8h9i0j9", name: "하라주쿠" },
              { type: "restaurant", refId: "65f1a2b3c4d5e6f7g8h9i0k1", name: "아키하바라 만쥬" },
              { type: "attraction", refId: "65f1a2b3c4d5e6f7g8h9i0k2", name: "도쿄 타워" },
              { type: "restaurant", refId: "65f1a2b3c4d5e6f7g8h9i0k3", name: "츠키지 우나기" }
            ]
          }
        ]
      };

      const createdSchedule = new this.scheduleModel(sampleSchedule);
      return await createdSchedule.save();
    } catch (error) {
      throw new Error(`Failed to create sample data: ${error.message}`);
    }
  }

  // async findOne(id: string): Promise<Schedule> {
  //   return this.scheduleModel.findById(id).exec();
  // }

  // async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
  //   return this.scheduleModel.findByIdAndUpdate(id, updateScheduleDto, { new: true }).exec();
  // }

  // async remove(id: string): Promise<Schedule> {
  //   return this.scheduleModel.findByIdAndDelete(id).exec();
  // }

}
