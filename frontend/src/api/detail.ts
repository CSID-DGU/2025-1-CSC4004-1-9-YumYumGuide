import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';

interface BaseDetailData {
  id: string;
  name: string;
  location: string;
  rating: number;
  keywords: string[];
  image: string;
  description: string;
  price: string;
}

interface RestaurantDetailData extends BaseDetailData {
  type: 'restaurant';
  restaurant_name: string;
  translated_restaurant_name: string;
  url: string;
  tel: string;
  genre: string;
  business_hours: string;
  closed_days: string;
  budget: string;
  credit_card: string;
  ic_card_payment: string | null;
  qr_code_payment: string | null;
  address: string;
  entrance: string;
  parking: string;
  seats: number;
  counter_seats: number | null;
  smoking: string;
  private_room: string;
  private: string | null;
  store_website: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  remarks: string | null;
  lecture: string | null;
  available_drinks: string | null;
  cooking_specialties: string | null;
  drinking_specialties: string | null;
  reservation: string | null;
  usage_scenes: string;
  waiting: string | null;
  service: string | null;
  dress_code: string | null;
  child_friendly: string | null;
  pet_friendly: string | null;
  power_supply_available: string | null;
  wifi_available: string;
  phone_number: string;
  foreign_language_support: string | null;
  video: string;
  additional_equipment: string | null;
  beer_maker: string | null;
  menuAvgPrice: number;
  dinner_budget: number;
  lunch_budget: number;
  genre_code: number;
  closed_days_code: number | null;
  genre_fuzzy: string[];
  translated_restaurant_name_fuzzy: string[];
  smoking_code: number;
  drinking_code: number;
}

interface AttractionDetailData extends BaseDetailData {
  type: 'attraction';
  category: string;
  attraction: string;
  address: string;
  attraction_fuzzy: string[];
  category_fuzzy: string[];
  description_fuzzy: string[];
}

type DetailData = RestaurantDetailData | AttractionDetailData;

interface DetailResponse {
  data: DetailData;
}

const fetchDetail = async (id: string): Promise<DetailResponse> => {
  const token = Cookies.get('auth_token');

  // Try attraction detail first
  const attractionResponse = await axios(`${process.env.NEXT_PUBLIC_API_URL}/api/attraction/detail/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (attractionResponse.data.status != 404) {
    return {
      data: {
        ...attractionResponse.data.data,
        type: 'attraction'
      }
    };
  }

  const restaurantResponse = await axios(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurant/detail/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (restaurantResponse.data.status != 404) {
    return {
      data: {
        ...restaurantResponse.data.data,
        type: 'restaurant'
      }
    };
  }

  // If both fail, throw an error
  throw new Error('Failed to fetch detail - not found in both restaurant and attraction');
};

export const useQueryDetail = (id: string) => {
  return useQuery({
    queryKey: ['detail', id],
    queryFn: () => fetchDetail(id),
    enabled: !!id,
  });
}; 