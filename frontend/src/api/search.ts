import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface SearchResult {
  _id: string;
  type: string;
  title: string;
  description?: string;
  image?: string;
  score: number;
}

interface SearchResponse {
  data: {
    paginatedResults: SearchResult[];
    totalCount: { count: number }[];
  };
  success: boolean;
  statusCode: number;
  message: string;
}

interface SearchParams {
  query: string;
  location: string;
  pageSize?: number;
}

const fetchSearch = async ({ pageParam = 1, query, location, pageSize = 10 }: { pageParam?: number } & SearchParams): Promise<SearchResponse> => {
  const token = Cookies.get('auth_token'); // Assuming token is needed, adjust if not
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&page=${pageParam}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Adjust if token is not needed
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }
  return response.json();
};

export const useSearchPlaces = (params: SearchParams, enabled: boolean) => {
  return useInfiniteQuery<SearchResponse, Error, InfiniteData<SearchResponse, number>, readonly unknown[], number>({
    queryKey: ['searchPlaces', params.query, params.location, params.pageSize],
    queryFn: ({ pageParam }) => fetchSearch({ ...params, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalResults = lastPage.data.totalCount[0]?.count || 0;
      const loadedResults = allPages.reduce((acc, page) => acc + page.data.paginatedResults.length, 0);
      const currentPage = allPages.length;
      const totalPages = Math.ceil(totalResults / (params.pageSize || 10));

      if (loadedResults < totalResults && currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    enabled: enabled && !!params.query && !!params.location,
  });
}; 