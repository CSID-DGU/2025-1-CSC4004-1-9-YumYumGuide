import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';

@Injectable()
export class OpenAIClient {
  private openai: OpenAI;
  private readonly googleMapsApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY')!;
  }

  async generateArticle(
    restaurants: string[],
    touristSpots: string[],
    startDate: string,
    endDate: string,
  ) {
    const systemPrompt = `You are a travel itinerary planner specializing in Tokyo. Create a detailed daily schedule that includes:
    1. Breakfast, lunch, and dinner times
    2. Nearby locations grouped together to minimize travel time
    3. Optimal visiting times for each location
    4. Meal places coordinated with nearby tourist spots
    5. Maximum 3-4 tourist spots per day
    6. Consider operating hours and special considerations
    7. Realistic travel times and distances
    8. Budget considerations`;

    const userPrompt = `Please create a detailed itinerary for Tokyo with the following:
    Restaurants: ${restaurants.join(', ')}
    Tourist Spots: ${touristSpots.join(', ')}
    Travel Period: ${startDate} to ${endDate}
    
    Please format the response in a clear, structured way with daily schedules.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    console.log(completion);
    return completion.choices[0].message.content;
  }

  async getPublicTransportDirections(
    origin: string,
    destination: string,
    departureTime?: string,
  ) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin,
            destination,
            mode: 'transit',
            departure_time: departureTime || 'now',
            key: this.googleMapsApiKey,
            language: 'ko',
            region: 'jp',
            alternatives: true,
          },
        },
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API Error: ${response.data.status}`);
      }

      // 경로 정보를 프론트엔드에서 사용하기 쉽게 가공
      const routes = response.data.routes.map(route => ({
        summary: route.summary,
        distance: route.legs[0].distance,
        duration: route.legs[0].duration,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance,
          duration: step.duration,
          travelMode: step.travel_mode,
          transitDetails: step.transit_details ? {
            line: step.transit_details.line,
            departureStop: step.transit_details.departure_stop,
            arrivalStop: step.transit_details.arrival_stop,
            departureTime: step.transit_details.departure_time,
            arrivalTime: step.transit_details.arrival_time,
          } : null,
          polyline: step.polyline.points,
        })),
        overviewPolyline: route.overview_polyline.points,
      }));

      return {
        status: 'OK',
        routes,
      };
    } catch (error) {
      console.error('Error fetching directions:', error);
      throw new Error('Failed to fetch directions: ' + error.message);
    }
  }
}

// @Injectable()
// export class OpenAIClient {
//   private openai: OpenAI;

//   constructor(private readonly configService: ConfigService) {
//     this.openai = new OpenAI({
//       apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
//       baseURL: 'https://openrouter.ai/api/v1',
//       defaultHeaders: {
//         'HTTP-Referer': this.configService.get<string>(
//           'OPENROUTER_HTTP_REFERER',
//           'https://github.com/joshephan/cocoa',
//         ),
//         'X-Title': this.configService.get<string>(
//           'OPENROUTER_APP_NAME',
//           'COCOA(Coin Coin Korea)',
//         ),
//       },
//     });
//   }

//   async generateArticle(
//     systemPrompt: string,
//     userPrompt: string,
//   ): Promise<{ title: string; content: string }> {
//     const response = await this.openai.chat.completions.create({
//       model: 'openai/gpt-4',
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: userPrompt },
//       ],
//       temperature: 0.7,
//       max_tokens: 3000,
//     });

//     const report = response.choices[0].message.content || '';

//     try {
//       // 4. 제목과 본문 분리
//       const [title, content] = report
//         .split('<DIVIDER>')
//         .map((part) => part.trim());

//       console.log(title, content);
//       return {
//         title: title,
//         content: content,
//       };
//     } catch (error) {
//       console.error('Failed to parse OpenAI response:', report);
//       throw new Error('Failed to parse article content: ' + error.message);
//     }
//   }
// }