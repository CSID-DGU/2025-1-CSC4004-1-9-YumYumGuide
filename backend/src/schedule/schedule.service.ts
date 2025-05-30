import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto, AttractionType, TravelStyle } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule, ScheduleDocument, Day, Event } from './schema/schedule.schema';
import * as dayjs from 'dayjs';
import { AttractionService } from '../attraction/attraction.service';
import { FavoriteService } from '../favorite/favorite.service';

interface DailyBudget {
  total: number;
  transportation: number;
  food: number;
  activity: number;
}

// 지역명 한글-영어 매핑
const regionNameMap: { [key: string]: string } = {
  '스기나미구': 'Suginami',
  '네리마구': 'Nerima',
  '이타바시구': 'Itabashi',
  '나카노구': 'Nakano',
  '도시마구': 'Toshima',
  '키타구': 'Kita',
  '아다치구': 'Adachi',
  '신주쿠구': 'Shinjuku',
  '분쿄구': 'Bunkyo',
  '다이토구': 'Taito',
  '아라카와구': 'Arakawa',
  '세타가야구': 'Setagaya',
  '메구로구': 'Meguro',
  '시부야구': 'Shibuya',
  '치요다구': 'Chiyoda',
  '미나토구': 'Minato',
  '주오구': 'Chuo',
  '스미다구': 'Sumida',
  '카츠시카구': 'Katsushika',
  '오타구': 'Ota',
  '시나가와구': 'Shinagawa',
  '고토구': 'Koto',
  '에도가와구': 'Edogawa'
};

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private readonly attractionService: AttractionService,
    private readonly favoriteService: FavoriteService,
  ) {}

  private selectRegion(locations: string[]): string {
    const selectedKoreanRegion = locations[Math.floor(Math.random() * locations.length)];
    return regionNameMap[selectedKoreanRegion] || selectedKoreanRegion;
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

    const schedule = new this.scheduleModel(createScheduleDto);
    
    // 여행 일수 계산
    const startDate = dayjs(createScheduleDto.startDate);
    const endDate = dayjs(createScheduleDto.endDate);
    const duration = endDate.diff(startDate, 'day') + 1;
    this.logger.log(`여행 기간: ${duration}일 (${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')})`);

    // 일별 예산 계산
    const dailyBudgets = this.calculateDailyBudgets(
      createScheduleDto.budget,
      duration,
      createScheduleDto.flightDeparture,
      createScheduleDto.flightArrival,
      createScheduleDto.travelStyle
    );
    this.logger.log('일별 예산 계산 완료:', JSON.stringify(dailyBudgets, null, 2));

    // 레스토랑 목록 가져오기
    const restaurants = await this.attractionService.findByType('restaurant');
    this.logger.log(`가능한 레스토랑 수: ${restaurants.length}`);

    // 관광지 목록 가져오기
    const attractions = await this.attractionService.findByType('attraction');
    this.logger.log(`가능한 관광지 수: ${attractions.length}`);

    // 사용자 선호도에 따른 일일 추천 개수 설정
    const dailyRecommendations = this.calculateDailyRecommendations(createScheduleDto.travelStyle);
    this.logger.log('일일 추천 개수:', JSON.stringify(dailyRecommendations, null, 2));

    // 일별 일정 생성
    const days: Day[] = [];
    for (let i = 0; i < duration; i++) {
      const currentDate = startDate.add(i, 'day');
      const dailyBudget = dailyBudgets[i];

      // 해당 날짜의 지역 선택 (영어로 변환)
      const selectedRegion = this.selectRegion(createScheduleDto.selectedRegions);
      this.logger.log(`Day ${i + 1} 선택된 지역: ${selectedRegion}`);

      // 해당 지역의 레스토랑 필터링
      const regionRestaurants = restaurants.filter(r => r.location === selectedRegion);
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

      // 사용자 선호도에 맞는 관광지 선택
      const selectedAttractions = this.selectAttractionsByPreference(
        regionAttractions,
        userPreferences,
        dailyRecommendations.attractions
      );
      this.logger.log(`Day ${i + 1} 선택된 관광지 수: ${selectedAttractions.length}`);

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
          name: restaurant.name,
          location: restaurant.location,
          startTime: this.generateRandomTime(9, 21), // 9시부터 21시 사이
          endTime: this.generateRandomTime(9, 21),
          budget: restaurant.price,
          description: `${restaurant.cuisine} | 평점: ${restaurant.rating} | ${restaurant.address}`
        };
        day.events.push(mealEvent);
      });

      // 관광 일정 추가
      selectedAttractions.forEach(attraction => {
        const attractionEvent: Event = {
          type: 'attraction',
          refId: attraction._id.toString(),
          name: attraction.name,
          location: attraction.location,
          startTime: this.generateRandomTime(9, 18), // 9시부터 18시 사이
          endTime: this.generateRandomTime(9, 18),
          budget: attraction.price,
          description: `${attraction.category} | 평점: ${attraction.rating} | ${attraction.address}`
        };
        day.events.push(attractionEvent);
      });

      days.push(day);
    }

    schedule.days = days;
    return schedule.save();
  }

  private calculateDailyRecommendations(travelStyle: TravelStyle): { restaurants: number; attractions: number } {
    if (travelStyle === TravelStyle.FOOD) {
      return {
        restaurants: Math.floor(Math.random() * 4) + 4, // 4-7개
        attractions: 2 // 2개
      };
    } else { // TravelStyle.SIGHTSEEING
      return {
        restaurants: Math.floor(Math.random() * 3) + 3, // 3-5개
        attractions: Math.floor(Math.random() * 3) + 3 // 3-5개
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
      if (preferences.groupType === '1인&2인' && restaurant.seats <= 50) {
        score += 2;
      } else if (preferences.groupType === '3인 이상' && restaurant.seats > 50) {
        score += 2;
      }

      // 흡연/음주 취향 매칭
      if (preferences.smoking === 1 && restaurant.smoking === true) {
        score += 2;
      }
      if (preferences.drinking === 1 && restaurant.drinking === true) {
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
      if (preferences.travelStyle === TravelStyle.SIGHTSEEING && attraction.category !== '맛집') {
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

  findOne(id: string) {
    return this.scheduleModel.findById(id).exec();
  }

  update(id: string, updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleModel.findByIdAndUpdate(id, updateScheduleDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }
}
