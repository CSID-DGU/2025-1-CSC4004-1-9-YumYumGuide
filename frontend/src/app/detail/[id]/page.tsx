'use client';
import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import './detail.css';
import Image from 'next/image';
import { useQueryDetail } from '@/api/detail';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data, isLoading, error } = useQueryDetail(id);

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen max-w-[500px] mx-auto">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-[500px] mx-auto">
        <div className="text-lg text-red-500 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</div>
        <button onClick={goBack} className="px-4 py-2 bg-blue-500 text-white rounded-md">
          돌아가기
        </button>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-[500px] mx-auto">
        <div className="text-lg text-red-500 mb-4">데이터를 찾을 수 없습니다.</div>
        <button onClick={goBack} className="px-4 py-2 bg-blue-500 text-white rounded-md">
          돌아가기
        </button>
      </div>
    );
  }

  const tripDetail = data.data;

  return (
    <div className="detail-container">
      <div className="detail-image-container">
        <Image src={tripDetail.image || '/restaurant.png'} alt={tripDetail.name} className="detail-image" />
      </div>

      <div className="content-container">
        <div className="flex title-container">
          <h1 className="title">{tripDetail.name}</h1>
          <div className="rating-badge">
            <span className="rating-star">★</span>
            <span className="rating-text">{tripDetail.rating}</span>
          </div>
        </div>
        <div className="location">
          <span className="location-icon">📍</span>
          <span>{tripDetail.location}</span>
        </div>

        <div className="divider"></div>

        <h2 className="section-title">리뷰 키워드</h2>
        <div className="keyword-container">
          {(tripDetail.keywords || []).map((keyword: string, index: number) => (
            <span key={index} className="keyword">
              {keyword}
            </span>
          ))}
        </div>

        <div className="divider"></div>

        <h2 className="section-title">상세 리뷰</h2>
        <p className="review-text">{tripDetail.description}</p>

        <div className="divider"></div>

        <h2 className="section-title">가격 정보</h2>
        <p className="price-info">{tripDetail.price}</p>
      </div>
    </div>
  );
}
