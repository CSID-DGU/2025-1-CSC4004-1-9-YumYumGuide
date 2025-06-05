import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { SearchResultDto } from './dto/search-result.dto';
import { AttractionDocument } from 'src/attraction/schema/attraction.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel('Attraction') private attractionModel: Model<AttractionDocument>,
    @InjectModel('Restaurant') private restaurantModel: Model<any>,
  ) { }

  async search(
    userInput: string,
    locationInput: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<SearchResultDto> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $search: {
            index: 'attractions_search_index',
            compound: {
              must: [{
                text: {
                  query: userInput,
                  path: ['description', 'attraction']
                }
              }]
            }
          }
        } as PipelineStage,
        {
          $project: {
            _id: 1,
            type: '랜드마크',
            title: '$attraction',
            description: '$description',
            image: '$image',
            score: { $meta: 'searchScore' }
          }
        } as PipelineStage,
        {
          $unionWith: {
            coll: 'restaurants',
            pipeline: [
              {
                $search: {
                  index: 'restaurants_search_index',
                  compound: {
                    must: [{
                      text: {
                        query: userInput,
                        path: ['genre', 'restaurant_name', 'translated_restaurant_name']
                      }
                    }],
                    filter: [{
                      text: {
                        query: locationInput,
                        path: 'location'
                      }
                    }]
                  }
                }
              } as PipelineStage,
              {
                $project: {
                  _id: 1,
                  type: '음식점',
                  title: '$translated_restaurant_name',
                  description: '$genre',
                  image: '$video',
                  score: { $meta: 'searchScore' }
                }
              } as PipelineStage
            ]
          }
        } as PipelineStage,
        {
          $sort: {
            score: -1
          }
        } as PipelineStage,
        {
          $facet: {
            paginatedResults: [
              { $skip: (page - 1) * pageSize },
              { $limit: pageSize }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        } as PipelineStage
      ];

      const result = await this.attractionModel.aggregate(pipeline);
      return result[0];
    } catch (error) {
      throw new InternalServerErrorException('검색 중 오류가 발생했습니다.');
    }
  }
} 