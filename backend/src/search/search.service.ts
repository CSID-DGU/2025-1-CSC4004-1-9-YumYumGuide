import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument, RestaurantModelType } from './schemas/restaurant.schema';
import { Attraction, AttractionDocument, AttractionModelType } from './schemas/attraction.schema';
import { SearchRequestDto } from './dto/search-request.dto';
import { 
  SearchResponseDto, 
  RestaurantSearchResultDto, 
  AttractionSearchResultDto 
} from './dto/search-response.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Restaurant.name) 
    private restaurantModel: RestaurantModelType,
    @InjectModel(Attraction.name) private attractionModel: AttractionModelType,
  ) {}

  async fixFuzzyTokens() {
  const documents = await this.attractionModel.find({});
  for (const doc of documents) {
    await doc.save();
  }
}

  async search(searchDto: SearchRequestDto): Promise<SearchResponseDto> {
    const startTime = Date.now();
    const { query, region } = searchDto;

    // await this.fixFuzzyTokens();
    // await this.attractionModel.collection.dropIndexes();

    // MongoDB 텍스트 검색 쿼리 구성
    const searchQueryR = this.buildSearchQueryRestaurant(query, region);
    const searchQueryA = this.buildSearchQueryAttraction(query, region);

    // 병렬로 음식점과 관광지 검색 실행
    const [restaurantResults, attractionResults] = await Promise.all([
      this.searchRestaurants(searchQueryR),
      this.searchAttractions(searchQueryA),
    ]);

    // console.log(restaurantResults)

    // 검색 결과를 정확도 순으로 정렬하고 상위 2개 선택
    const topRestaurants = this.sortByRelevanceRestaurant(restaurantResults, query).slice(0, 2);
    const topAttractions = this.sortByRelevanceAttraction(attractionResults, query).slice(0, 2);

    const searchTime = Date.now() - startTime;

    return {
      restaurants: topRestaurants.map(restaurant => this.mapToRestaurantDto(restaurant)),
      attractions: topAttractions.map(attraction => this.mapToAttractionDto(attraction)),
      totalCount: {
        restaurants: restaurantResults.length,
        attractions: attractionResults.length,
      },
      searchInfo: {
        query,
        region,
        searchTime,
      },
    };
  }

  private buildSearchQueryRestaurant(query: string, region: string) {
    return {query, region};
    const mongoQuery: any = {
       $text: { $search: query },
    };

    console.log(mongoQuery);
    return mongoQuery;
  }

  private buildSearchQueryAttraction(query: string, region: string) {
    return {query, region};
    const mongoQuery: any = {
        // { region: { $regex: region, $options: 'i' } },
        // isActive: true,
        // $text: { $search: query },
        description: { $regex: query }
    };

    console.log(mongoQuery);
    return mongoQuery;
  }

  private async searchRestaurants(query: any): Promise<RestaurantDocument[]> {
    console.log(query)
    return this.restaurantModel
      .fuzzySearch(query.query, {location: query.region})
      .limit(10)
      .exec();
  }

  private async searchAttractions(query: any): Promise<AttractionDocument[]> {
    console.log(query)
    return this.attractionModel
      .fuzzySearch(query.query)
      // .sort({ score: { $meta: 'textScore' }, rating: -1 })
      .limit(10)
      .exec();
  }

  private sortByRelevanceRestaurant<T extends { restaurant_name: string; genre: string; translated_restaurant_name: string }>(
    results: T[], 
    keyword: string
  ): (T & { calculatedScore: number })[] {
    return results
      .map(item => ({
        ...item,
        calculatedScore: this.calculateRelevanceScoreRestaurant(item, keyword),
      }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  private sortByRelevanceAttraction<T extends { attraction: string; description: string }>(
    results: T[], 
    keyword: string
  ): (T & { calculatedScore: number })[] {
    return results
      .map(item => ({
        ...item,
        calculatedScore: this.calculateRelevanceScoreAttraction(item, keyword),
      }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  private calculateRelevanceScoreRestaurant(
    item: { restaurant_name: string; genre: string}, 
    keyword: string
  ): number {
    const lowerKeyword = keyword.toLowerCase();
    const lowerName = item.restaurant_name?.toLowerCase() || "";
    const lowerDescription = item.genre?.toLowerCase() || "";

    console.log(`q: ${lowerKeyword}\nn: ${lowerName}\nd:${lowerDescription}`)

    let score = 0;

    // 이름에 키워드가 포함된 경우 높은 점수
    if (lowerName.includes(lowerKeyword)) {
      score += 50;
      // 이름과 키워드가 정확히 일치하는 경우 최고 점수
      if (lowerName === lowerKeyword) {
        score += 100;
      }
    }

    // 설명에 키워드가 포함된 경우
    if (lowerDescription.includes(lowerKeyword)) {
      score += 50;
    }

    return score;
  }

  private calculateRelevanceScoreAttraction(
    item: { attraction: string; description: string}, 
    keyword: string
  ): number {
    const lowerKeyword = keyword.toLowerCase();
    const lowerName = item.attraction?.toLowerCase()  || "";
    const lowerDescription = item.description?.toLowerCase()  || "";

    console.log(`q: ${lowerKeyword}\nn: ${lowerName}\nd:${lowerDescription}`)

    let score = 0;

    // 이름에 키워드가 포함된 경우 높은 점수
    if (lowerName.includes(lowerKeyword))
      score += 100;

    // 설명에 키워드가 포함된 경우
    if (lowerDescription.includes(lowerKeyword))
      score += 30;

    return score;
  }

  private mapToRestaurantDto(restaurant): RestaurantSearchResultDto {
    return {
      // _id: d_restaurant._id.toString(),
      // name: d_restaurant.translated_restaurant_name,
      // genre: d_restaurant.genre,
      // lunchBudget: d_restaurant.lunchBudget,
      // dinnerBudget: d_restaurant.dinnerBudget,
      // budget: d_restaurant.budget,
      // wifi: d_restaurant.wifi,
      // address: d_restaurant.address,
      // tel: d_restaurant.tel,
      data: restaurant._doc,
      sort: restaurant.calculatedScore || 0,
    };
  }

  private mapToAttractionDto(attraction): AttractionSearchResultDto {
    return {
      data: attraction._doc,
      sort: attraction.calculatedScore || 0,
    };
  }

   async getAutocompleteSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (query.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();

    // 음식점 이름에서 검색
    const restaurantSuggestions = await this.restaurantModel
      .find({
        restaurant_name: { $regex: query, $options: 'i' }
      })
      .select('translated_restaurant_name')
      .limit(limit / 2)
      .exec();

    // 관광지 이름에서 검색
    const attractionSuggestions = await this.attractionModel
      .find({
        attraction: { $regex: query, $options: 'i' }
      })
      .select('attraction')
      .limit(limit / 2)
      .exec();

    // 결과를 Set에 추가 (중복 제거)
    restaurantSuggestions.forEach(item => {
      if (item.restaurant_name) {
        suggestions.add(item.restaurant_name);
      }
    });

    attractionSuggestions.forEach(item => {
      if (item.attraction) {
        suggestions.add(item.attraction);
      }
    });

    // 관련성 순으로 정렬
    const sortedSuggestions = Array.from(suggestions)
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.length - b.length;
      })
      .slice(0, limit);

    return sortedSuggestions;
  }

  // 장르/카테고리 기반 검색어 추천
  async getGenreSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) {
      return [];
    }

    const genreSuggestions = await this.restaurantModel
      .distinct('genre', {
        genre: { $regex: query, $options: 'i' }
      })
      .limit(limit)
      .exec();

    return genreSuggestions.filter(genre => genre?.toLowerCase().includes(query.toLowerCase()));
  }
}
