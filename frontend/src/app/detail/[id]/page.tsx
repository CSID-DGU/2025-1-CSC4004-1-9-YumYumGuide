'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './detail.css';

interface TripDetailProps {
  params: {
    id: string;
  };
}

export default function TripDetailPage({ params }: TripDetailProps) {
  const router = useRouter();
  const { id } = params; // URL 파라미터에서 id 가져오기
  const [tripDetail, setTripDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetail = async () => {
      if (!id) return; // id가 없으면 요청하지 않음
      
      try {
        setLoading(true);
        // 실제 API로 교체
        const response = await fetch(`/api/trips/${id}`);
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        
        const data = await response.json();
        setTripDetail(data);
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        console.error('Error fetching trip detail:', err);
      }
    };

    if (id) {
      fetchTripDetail();
    }
  }, [id]);

  const goBack = () => {
    router.back(); // 이전 페이지로 돌아가기
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-screen max-w-[500px] mx-auto">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-[500px] mx-auto">
        <div className="text-lg text-red-500 mb-4">{error}</div>
        <button 
          onClick={goBack}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 더미데이터 실제 데이터로 교체해야함!
  const mockData = tripDetail || {
    id: id || '1',
    name: '규카츠 모토무라 시부야점',
    location: 'Shibuya, Tokyo',
    area: 'Shibuya',
    rating: 4.2,
    reviewCount: 203,
    price: '¥890/1인',
    keywords: ['맛있다', '깨끗하다', '친절하다'],
    image: '/restaurant.png',
    description: '시부야에 위치한 유명한 규카츠 전문점입니다. 바삭하고 두꺼운 돈까스와 특제 소스가 일품이며, 현지인들에게도 인기가 많은 맛집입니다. 직원들이 매우 친절하고 가게 내부도 깨끗하게 유지되고 있습니다. 시부야역에서 도보 5분 거리에 위치해 있어 접근성도 좋습니다.',
    createdBy: 'LoveTrip'
  };

  return (
    <div className="detail-container">
      <div className="detail-image-container">
        <img 
          src={mockData.image || "/restaurant.png"} 
          alt={mockData.name} 
          className="detail-image"
        />
        {/* <button onClick={goBack} className="back-button">
          &lt;
        </button> */}
        {/* <button className="bookmark-button">
          ☐
        </button> */}
        
      </div>

      <div className="content-container">
        <div className='flex title-container'>
          <h1 className="title">{mockData.name}</h1>
          <div className="rating-badge">
            <span className="rating-star">★</span>
            <span className="rating-text">{mockData.rating}</span>
          </div>
        </div>
        <div className="location">
          <span className="location-icon">📍</span>
          <span>{mockData.location}</span>
        </div>

        <div className="divider"></div>

        <h2 className="section-title">리뷰 키워드</h2>
        <div className="keyword-container">
          {mockData.keywords.map((keyword: string, index: number) => (
            <span key={index} className="keyword">
              {keyword}
            </span>
          ))}
        </div>

        <div className="divider"></div>

        <h2 className="section-title">상세 리뷰</h2>
        {/* <div className="review-profile">
          <div className="profile-icon">
            👤
          </div>
          <span className="profile-name">{mockData.createdBy}</span>
        </div> */}
        <p className="review-text">{mockData.description}</p>

        <div className="divider"></div>

        <h2 className="section-title">가격 정보</h2>
        <p className="price-info">{mockData.price}</p>
      </div>
    </div>
  );
}