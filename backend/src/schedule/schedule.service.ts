import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateScheduleDto, AttractionType, TravelStyle } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule, ScheduleDocument, Day, Event } from './schema/schedule.schema';
import * as dayjs from 'dayjs';
import { AttractionService } from '../attraction/attraction.service';
import { FavoriteService } from '../favorite/favorite.service';
import { Restaurant, RestaurantDocument } from '../restaurant/schema/restaurant.schema';
import { ApiResponseDto } from 'src/common/response/api.response.dto';
import { OpenAIClient } from '../client/openai.client';

interface DailyBudget {
  total: number;
  transportation: number;
  food: number;
  activity: number;
}

// 지역명 한글-영어 매핑
const regionNameMap: { [key: string]: string } = {
  '고탄다': 'Gotanda',
  '긴자': 'Ginza',
  '나카메': 'Nakame',
  '니혼바시': 'Nihonbashi',
  '도쿄역 주변': 'tokyo_station',
  '마루노우치': 'Marunouchi',
  '메구로': 'Meguro',
  '시부야': 'Shibuya',
  '신바시': 'Shimbashi',
  '신주쿠': 'Shinjuku',
  '아사쿠사': 'Asakusa',
  '아키하바라': 'Akihabara',
  '에비스': 'Ebisu',
  '우에노': 'Ueno',
  '유라쿠초': 'Yurakucho',
  '이케부코로': 'Ikebukuro',
  '칸다': 'Kanda',
  '타마 치': 'Tamachi',
  '하마 마츠': 'Hamamatsu',
};
function yyyymmddStringToUtcDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // JavaScript의 month는 0부터 시작
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(Date.UTC(year, month, day));
}

// Helper: Date 객체를 YYYYMMDD 형식의 숫자로 변환
function dateToYYYYMMDDNumber(date: Date): number {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dayOfMonth = date.getUTCDate().toString().padStart(2, '0');
  return parseInt(`${year}${month}${dayOfMonth}`);
}
@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private readonly attractionService: AttractionService,
    private readonly favoriteService: FavoriteService,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private readonly openAIClient: OpenAIClient,
  ) { }

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

  private generateRandomTime(startHour: number, endHour: number): string {
    const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  async create(createScheduleDto: CreateScheduleDto) {

    this.logger.log('=== 일정 생성 시작 ===');
    this.logger.log('입력 데이터:', JSON.stringify(createScheduleDto, null, 2));

    // 사용자 취향 정보 가져오기
    const userPreferences = await this.favoriteService.findByUserId(createScheduleDto.userId);
    if (!userPreferences) {
      throw new Error('사용자 취향 정보를 찾을 수 없습니다.');
    }
    this.logger.log('사용자 취향 정보:', JSON.stringify(userPreferences, null, 2));

    const selectedRegions = createScheduleDto.selectedRegions;
    // 각 지역명이 5글자 이하인지 검증
    const invalidRegions = selectedRegions.filter(region => region.length > 5);
    if (invalidRegions.length > 0) {
      this.logger.warn(`다음 지역명이 5글자를 초과합니다: ${invalidRegions.join(', ')}`);
    }

    const schedule = new this.scheduleModel(createScheduleDto);
    this.logger.log('Schedule object created initially:', JSON.stringify({ startDate: schedule.startDate, endDate: schedule.endDate }, null, 2));

    // 여행 일수 계산
    const startDate = dayjs(createScheduleDto.startDate);
    const endDate = dayjs(createScheduleDto.endDate);
    const duration = endDate.diff(startDate, 'day') + 1;
    this.logger.log(`여행 기간: ${duration}일 (${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')})`);

    // Ensure endDate on the schedule object is in YYYYMMDD string format before saving
    // startDate is expected to be a Date object casted by Mongoose from the DTO based on schema
    schedule.endDate = endDate.format('YYYYMMDD'); // Schema expects String, format as YYYYMMDD
    // Ensure dates on the schedule object are in the desired format before saving
    // Note: Schema defines startDate as Date and endDate as String (YYYYMMDD)
    // Assigning dayjs Date object to startDate (Schema expects Date)
    schedule.startDate = startDate.format('YYYYMMDD');
    // Assigning formatted string to endDate (Schema expects String)
    schedule.endDate = endDate.format('YYYYMMDD');
    this.logger.log('Schedule object after setting date formats:', JSON.stringify({ startDate: schedule.startDate, endDate: schedule.endDate }, null, 2));

    // 일별 예산 계산
    const dailyBudgets = this.calculateDailyBudgets(
      createScheduleDto.budget,
      duration,
      createScheduleDto.flightDeparture,
      createScheduleDto.flightArrival,
      createScheduleDto.travelStyle
    );
    this.logger.log('일별 예산 계산 완료:', JSON.stringify(dailyBudgets, null, 2));

    // 레스토랑 목록 가져오기 (MongoDB restaurants 컬렉션 직접 조회)
    const restaurants = await this.restaurantModel.find({}).lean();
    this.logger.log(`가능한 레스토랑 수: ${restaurants.length}`);

    // 관광지 목록 가져오기
    const attractions = await this.attractionService.findByType('attraction');
    this.logger.log(`main DB attractions 컬렉션에서 조회된 관광지 수: ${attractions.length}`);

    // 사용자 선호도에 따른 일일 추천 개수 설정
    const dailyRecommendations = this.calculateDailyRecommendations(createScheduleDto.travelStyle);
    this.logger.log('일일 추천 개수:', JSON.stringify(dailyRecommendations, null, 2));

    // 일별 일정 생성 
    // 여기 부터 작동이 원하는대로 안됨....
    const days: Day[] = [];
    for (let i = 0; i < duration; i++) {
      const currentDate = startDate.add(i, 'day');
      const dailyBudget = dailyBudgets[i];

      // 순환 방식으로 지역 배정
      const selectedRegionKorean = selectedRegions[i % selectedRegions.length];
      const selectedRegion = regionNameMap[selectedRegionKorean] || selectedRegionKorean;
      this.logger.log(`Day ${i + 1} 순환 배정된 지역: ${selectedRegion}`);

      // 해당 지역의 레스토랑 필터링 (부분일치, 대소문자 무시)
      const regionRestaurants = restaurants.filter(r =>
        r.location && r.location.toLowerCase().includes(selectedRegion.toLowerCase()) && (r.dinner_budget ? r.dinner_budget * 10 <= 120000 : true)
      );
      this.logger.log(`Day ${i + 1} 지역 레스토랑 수: ${regionRestaurants.length}`);

      // 사용자 선호도에 맞는 레스토랑 선택
      const selectedRestaurants = this.selectRestaurantsByPreference(
        regionRestaurants,
        userPreferences,
        dailyRecommendations.restaurants
      );
      this.logger.log(`Day ${i + 1} 선택된 레스토랑 수: ${selectedRestaurants.length}`);

      // 해당 지역의 관광지 필터링
      const regionAttractions = attractions.filter(a =>
        a.location === selectedRegion &&
        createScheduleDto.attractionTypes.includes(a.category as AttractionType)
      );
      this.logger.log(`Day ${i + 1} 지역 관광지 수: ${regionAttractions.length}`);

      // 일정 구성
      const day: Day = {
        day: i + 1,
        date: currentDate.toDate(),
        totalBudget: dailyBudget.total,
        transportationBudget: dailyBudget.transportation,
        foodBudget: dailyBudget.food,
        activityBudget: dailyBudget.activity,
        events: []
      };

      // 식사 일정 추가
      selectedRestaurants.forEach(restaurant => {
        const mealEvent: Event = {
          type: 'meal',
          refId: restaurant._id.toString(),
          name: restaurant.translated_restaurant_name || restaurant.restaurant_name || restaurant.name,
          image: restaurant.video,
          location: restaurant.location,
          address: restaurant.address || '',
          startTime: this.generateRandomTime(9, 21), // 9시부터 21시 사이
          endTime: this.generateRandomTime(9, 21),
          budget: (restaurant.menuAvgPrice != null ? restaurant.menuAvgPrice * 10 : (restaurant.dinner_budget ? restaurant.dinner_budget * 10 : 0)) || restaurant.budget || 0,
          description: `${restaurant.cuisine || ''} | 평점: ${restaurant.rating || ''} | ${restaurant.address || ''}`
        };
        day.events.push(mealEvent);
      });

      // 관광 일정 추가
      const filteredAttractions = attractions.filter(attraction =>
        createScheduleDto.attractionTypes.includes(attraction.category as AttractionType)
      );
      const selectedAttractions = this.selectAttractionsByPreference(filteredAttractions, userPreferences, dailyRecommendations.attractions);
      selectedAttractions.forEach(attraction => {
        const attractionEvent: Event = {
          type: 'attraction',
          refId: attraction._id.toString(),
          name: attraction.attraction,
          image: attraction.image,
          location: attraction.location,
          address: attraction.address || '',
          startTime: this.generateRandomTime(9, 18), // 9시부터 18시 사이
          endTime: this.generateRandomTime(9, 18),
          budget: attraction.price || attraction.budget || 0,
          description: `${attraction.category} | 평점: ${attraction.rating} | ${attraction.address || ''}`
        };
        day.events.push(attractionEvent);
      });

      days.push(day);
      // 예산 초과 확인
      const totalEventBudget = day.events.reduce((sum, event) => sum + event.budget, 0);
      const totalDailyBudget = day.foodBudget + day.activityBudget;
      if (totalEventBudget > totalDailyBudget) {
        this.logger.warn(`Day ${i + 1}의 총 이벤트 예산(${totalEventBudget})이 일일 예산(${totalDailyBudget})을 초과합니다. (foodBudget: ${day.foodBudget}, activityBudget: ${day.activityBudget})`);
        // 마지막 추가된 식사 이벤트 제거
        const lastMealEventIndex = day.events.findIndex(event => event.type === 'meal');
        if (lastMealEventIndex !== -1) {
          day.events.splice(lastMealEventIndex, 1);
        }
        // 새로운 레스토랑 선택
        const newRestaurant = this.selectRestaurantsByPreference(regionRestaurants, userPreferences, 1)[0];
        if (newRestaurant) {
          const newMealEvent: Event = {
            type: 'meal',
            refId: newRestaurant._id.toString(),
            name: newRestaurant.translated_restaurant_name || newRestaurant.restaurant_name || newRestaurant.name,
            image: newRestaurant.video,
            location: newRestaurant.location,
            address: newRestaurant.address || '',
            startTime: this.generateRandomTime(9, 21),
            endTime: this.generateRandomTime(9, 21),
            budget: (newRestaurant.menuAvgPrice != null ? newRestaurant.menuAvgPrice : (newRestaurant.dinner_budget ? newRestaurant.dinner_budget * 10 : 0)) || newRestaurant.budget || 0,
            description: `${newRestaurant.cuisine || ''} | 평점: ${newRestaurant.rating || ''} | ${newRestaurant.address || ''}`
          };
          day.events.push(newMealEvent);
        }
      }
    }

    // 일정 최적화 days에 대해 schedule.days 말고
    const optimizedDays = await this.openAIClient.optimizeSchedule(days);
    schedule.days = optimizedDays;

    return schedule.save();
  }

  private calculateDailyRecommendations(travelStyle: TravelStyle | string | number): { restaurants: number; attractions: number } {
    if (travelStyle === TravelStyle.FOOD || travelStyle === 'food' || travelStyle === 0) {
      return {
        restaurants: 6, // 맛집 위주(0)일 때 음식점 6개
        attractions: 4  // 맛집 위주(0)일 때 관광지 4개
      };
    } else {
      return {
        restaurants: 4, // 관광 위주(1)일 때 음식점 4개
        attractions: 5  // 관광 위주(1)일 때 관광지 5개
      };
    }
  }

  private selectRestaurantsByPreference(restaurants: any[], preferences: any, count: number) {
    // 취향에 따라 레스토랑 점수 계산
    const scoredRestaurants = restaurants.map(restaurant => {
      let score = 0;

      // 음식 취향 매칭
      if (restaurant.cuisine === preferences.favoriteFood) {
        score += 3;
      }

      // 그룹 타입 매칭
      if (preferences.groupType === '0' && restaurant.seats <= 50) {
        score += 2;
      } else if (preferences.groupType === '1' && restaurant.seats > 50) {
        score += 2;
      }

      // 흡연/음주 취향 매칭
      if (preferences.smoking === 1 && restaurant.smoking === '가능') {
        score += 2;
      }
      if (preferences.drinking === 1 && restaurant.drinking === '가능') {
        score += 2;
      }

      return { ...restaurant, score };
    });

    // 점수순으로 정렬하고 상위 count개 선택
    return scoredRestaurants
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  private selectAttractionsByPreference(attractions: any[], preferences: any, count: number) {
    // 취향에 따라 관광지 점수 계산
    const scoredAttractions = attractions.map(attraction => {
      let score = 0;

      // 관광지 유형 매칭
      if (preferences.attractionType.includes(attraction.category)) {
        score += 3;
      }

      // 여행 스타일 매칭
      if (preferences.travelStyle === TravelStyle.SIGHTSEEING && attraction.category !== 0) {
        score += 2;
      }

      return { ...attraction, score };
    });

    // 점수순으로 정렬하고 상위 count개 선택
    return scoredAttractions
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  private calculateDailyBudgets(
    totalBudget: number,
    duration: number,
    flightDeparture: string,
    flightArrival: string,
    travelStyle: TravelStyle
  ): DailyBudget[] {
    this.logger.log('일별 예산 계산 시작');
    this.logger.debug(`총 예산: ${totalBudget.toLocaleString()}원, 기간: ${duration}일`);

    const dailyBudgets: DailyBudget[] = [];
    const baseTransportation = 80000; // 기본 교통비 8만원
    const remainingBudget = totalBudget - baseTransportation;
    this.logger.debug(`기본 교통비 제외 후 남은 예산: ${remainingBudget.toLocaleString()}원`);

    // 여행 스타일에 따른 예산 분배
    const foodRatio = travelStyle === TravelStyle.FOOD ? 0.63 : 0.53;
    const activityRatio = travelStyle === TravelStyle.FOOD ? 0.24 : 0.27;
    const foodBudget = remainingBudget * foodRatio;
    const activityBudget = remainingBudget * activityRatio;

    this.logger.debug(`식비 비율: ${foodRatio}, 활동비 비율: ${activityRatio}`);
    this.logger.debug(`총 식비: ${foodBudget.toLocaleString()}원, 총 활동비: ${activityBudget.toLocaleString()}원`);

    // 일별 예산 계산
    for (let i = 0; i < duration; i++) {
      const dayBudget: DailyBudget = {
        total: 0,
        transportation: 0,
        food: 0,
        activity: 0
      };

      // 첫날
      if (i === 0) {
        dayBudget.transportation = 40000; // 공항-호텔, 패스 구매
        dayBudget.food = foodBudget / duration * 1.2; // 첫날 식비 20% 증가
        dayBudget.activity = activityBudget / duration * 0.8; // 첫날 활동비 20% 감소
        this.logger.debug(`Day ${i + 1} (첫날) 예산 계산: 교통비 20% 증가, 식비 20% 증가, 활동비 20% 감소`);
      }
      // 마지막 날
      else if (i === duration - 1) {
        dayBudget.transportation = 20000; // 호텔-공항
        dayBudget.food = foodBudget / duration * 1.4; // 마지막 날 식비 40% 증가
        dayBudget.activity = activityBudget / duration * 0.6; // 마지막 날 활동비 40% 감소
        this.logger.debug(`Day ${i + 1} (마지막 날) 예산 계산: 교통비 50% 감소, 식비 40% 증가, 활동비 40% 감소`);
      }
      // 중간 날
      else {
        dayBudget.transportation = 15000; // 패스 외 추가 교통비
        dayBudget.food = foodBudget / duration;
        dayBudget.activity = activityBudget / duration;
        this.logger.debug(`Day ${i + 1} (중간 날) 예산 계산: 기본 예산 분배`);
      }

      dayBudget.total = dayBudget.transportation + dayBudget.food + dayBudget.activity;
      dailyBudgets.push(dayBudget);
      this.logger.debug(`Day ${i + 1} 최종 예산:`, JSON.stringify(dayBudget, null, 2));
    }

    return dailyBudgets;
  }

  findAll() {
    return this.scheduleModel.find().exec();
  }

  async findOne(id: string) {
    const ObjectId = mongoose.Types.ObjectId;

    const schedule = await this.scheduleModel.findOne({ _id: new ObjectId(id) }).lean();

    if (!schedule) {
      throw new NotFoundException('해당 ID의 상품을 찾을 수 없습니다.');
    }
    return new ApiResponseDto(true, 200, 'success', schedule);

  }

  update(id: string, updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleModel.findByIdAndUpdate(id, updateScheduleDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }

  async createSampleData(userId: string) {
    const sampleSchedule = new this.scheduleModel({
      userId,
      title: '샘플 일정',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
      budget: 500000,
      selectedRegions: ['시부야', '신주쿠'],
      attractionTypes: ['문화', '자연'],
      travelStyle: '일반',
      flightDeparture: '09:00',
      flightArrival: '18:00'
    });

    return await sampleSchedule.save();
  }

  async deleteSchedule(scheduleId: string, userId: string) {
    const schedule = await this.scheduleModel.findById(scheduleId);
    
    if (!schedule) {
      throw new NotFoundException('일정을 찾을 수 없습니다.');
    }

    if (schedule.userId !== userId) {
      throw new UnauthorizedException('이 일정을 삭제할 권한이 없습니다.');
    }

    await this.scheduleModel.findByIdAndDelete(scheduleId);
    return { message: '일정이 성공적으로 삭제되었습니다.' };
  }

  async deleteEvent(scheduleId: string, dayIndex: number, eventIndex: number, userId: string) {
    console.log('=== Delete Event Debug ===');
    console.log('Requested userId:', userId);
    
    const schedule = await this.scheduleModel.findById(scheduleId);
    console.log('Found schedule:', schedule);
    console.log('Schedule userId:', schedule?.userId);
    
    if (!schedule) {
      throw new NotFoundException('일정을 찾을 수 없습니다.');
    }

    if (schedule.userId.toString() !== userId.toString()) {
      console.log('Permission denied:');
      console.log('Schedule userId:', schedule.userId.toString());
      console.log('Request userId:', userId.toString());
      throw new UnauthorizedException('이 일정을 수정할 권한이 없습니다.');
    }

    if (!schedule.days[dayIndex]) {
      throw new NotFoundException('해당 날짜를 찾을 수 없습니다.');
    }

    if (!schedule.days[dayIndex].events[eventIndex]) {
      throw new NotFoundException('해당 이벤트를 찾을 수 없습니다.');
    }

    // 삭제할 이벤트의 budget 값 저장
    const eventToDelete = schedule.days[dayIndex].events[eventIndex];
    const eventBudget = eventToDelete.budget || 0;

    // 해당 이벤트 삭제
    schedule.days[dayIndex].events.splice(eventIndex, 1);

    // totalBudget 업데이트
    schedule.days[dayIndex].totalBudget -= eventBudget;

    // 변경사항 저장
    await schedule.save();
    
    return { message: '이벤트가 성공적으로 삭제되었습니다.' };
  }

  async updateDayBudget(scheduleId: string, dayIndex: number, totalBudget: number, userId: string) {
    const schedule = await this.scheduleModel.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.userId.toString() !== userId) {
      throw new UnauthorizedException('You are not authorized to update this schedule');
    }

    if (!schedule.days[dayIndex]) {
      throw new NotFoundException('Day not found');
    }

    schedule.days[dayIndex].totalBudget = totalBudget;
    return schedule.save();
  }
}
