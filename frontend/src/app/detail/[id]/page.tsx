'use client'

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import './detail.css';

interface TripDetailProps {
  params: Promise<{
    id: string;
  }>;
}

interface TripDetailData {
    _id: string;
    translated_restaurant_name: string;
    location: string;
    genre?: string;
    budget?: string;
    image?: string;
}

 // 더미데이터 실제 데이터로 교체해야함!
  const mockDetail = {
    //   id: string;
    // translated_restaurant_name: string;
    // location: string;
    // genre?: string;
    // budget?: string;
    // image?: string;
  };



export default function TripDetailPage({ params }: TripDetailProps) {
  const router = useRouter();
  const { id } =  use(params);
  const [tripDetail, setTripDetail] = useState<TripDetailData|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetail = async () => {
      if (!id) return; // id가 없으면 요청하지 않음
      
      try {
        setLoading(true);
        // 실제 API로 교체
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/search/restaurantById`, {id: id});
        
        const data = await response.data.restaurants[0].data;
        console.log(data.budget);
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

 
  return (
    <>
{tripDetail !== null ? 
    <div className="detail-container">
      <div className="detail-image-container">
        <img 
          src={tripDetail.image || "/restaurant.png"} 
          alt={tripDetail.translated_restaurant_name} 
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
          <h1 className="title">{tripDetail.translated_restaurant_name}</h1>
          {/* <div className="rating-badge">
            <span className="rating-star">★</span>
            <span className="rating-text">{tripDetail.location}</span>
          </div> */}
        </div>
        <div className="location">
          <span className="location-icon">📍</span>
          <span>{tripDetail.location}</span>
        </div>

        <div className="divider"></div>

        {/* <h2 className="section-title">리뷰 키워드</h2>
        <div className="keyword-container">
          {(tripDetail.keywords || []).map((keyword: string, index: number) => (
            <span key={index} className="keyword">
              {keyword}
            </span>
          ))}
        </div> */}

        <div className="divider"></div>

        <h2 className="section-title">설명</h2>
        {/* <div className="review-profile">
          <div className="profile-icon">
            👤
          </div>
          <span className="profile-name">{tripDetail.createdBy}</span>
        </div> */}
        <p className="review-text">{tripDetail.genre}</p>

        <div className="divider"></div>

        <h2 className="section-title">가격 정보</h2>
        <p className="price-info">{tripDetail.budget}</p>
      </div>
    </div>
    :
    <div className="flex items-center justify-center h-screen max-w-[500px] mx-auto">
        <div className="text-lg">로딩 중...</div>
      </div>
    
    }
    </>
  );
}