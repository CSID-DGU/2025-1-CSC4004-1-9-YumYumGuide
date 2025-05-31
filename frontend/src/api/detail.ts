import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface DetailData {
  id: string;
  name: string;
  location: string;
  rating: number;
  keywords: string[];
  image: string;
  description: string;
  price: string;
}

interface DetailResponse {
  data: DetailData;
}

const fetchDetail = async (id: string): Promise<DetailResponse> => {
  const token = Cookies.get('auth_token');

  // Try restaurant detail first
  const restaurantResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurant/detail/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (restaurantResponse.ok) {
    return restaurantResponse.json();
  }

  // If restaurant detail fails, try attraction detail
  const attractionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attraction/detail/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (attractionResponse.ok) {
    return attractionResponse.json();
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