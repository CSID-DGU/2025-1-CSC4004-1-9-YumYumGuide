import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface Event {
  type: 'attraction' | 'restaurant';
  refId: string;
  name: string;
  image?: string;
}

interface Day {
  day: number;
  events: Event[];
}

interface Schedule {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  days: Day[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ScheduleResponse {
  data: Schedule[];
  meta: {
    total: number;
    page: number;
    take: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ScheduleParams {
  startDate?: string;
  endDate?: string;
}

const fetchSchedule = async (params?: ScheduleParams): Promise<ScheduleResponse> => {
  const token = Cookies.get('auth_token');
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/schedule`;

  // URLSearchParams를 사용하여 쿼리 문자열을 만듭니다.
  if (params && (params.startDate || params.endDate)) {
    const query = new URLSearchParams();
    if (params.startDate) {
      query.append('startDate', params.startDate);
    }
    if (params.endDate) {
      query.append('endDate', params.endDate);
    }
    // 생성된 쿼리 문자열이 있는 경우에만 URL에 추가합니다.
    if (query.toString()) {
      url += `?${query.toString()}`;
    }
  }

  const response = await fetch(url, { // 수정된 URL 사용
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
  }
  return response.json();
};

export const useQuerySchedule = (params?: ScheduleParams) => {
  return useQuery({
    queryKey: ['schedule', params?.startDate, params?.endDate],
    queryFn: () => fetchSchedule(params),
  });
};

export const useQueryScheduleById = (id: string) => {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/schedule/${id}`, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }

      return response.json();
    },
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
}; 