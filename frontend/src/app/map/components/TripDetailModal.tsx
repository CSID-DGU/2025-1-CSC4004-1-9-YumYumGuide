'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import './tripDetailModal.css';

interface TripDetailModalProps {
  id: string;
  onClose: () => void;
}

const TripDetailModal: React.FC<TripDetailModalProps> = ({ id, onClose }) => {
  const router = useRouter();
  const [tripDetail, setTripDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/search/restaurantById`,
          { id: id }
        );
        const data = response.data.restaurants[0].data;
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
    router.back();
  };

  const fieldValueToText = (key: string, value: any) => {
    if (key === 'smoking_code') {
      if (value === 1 || value === '1') return '예';
      if (value === 0 || value === '0') return '아니오';
      return '-';
    }
    // 다른 변환이 필요하면 여기에 추가
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };


  // 보여줄 주요 필드만 선택
  const mainFields = [
    { key: 'closed_days', label: '휴무일' },
    { key: 'smoking_code', label: '흡연 가능 여부' },
    { key: 'pet_friendly', label: '반려동물 출입 가능 여부'},
  ];

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
      <div className="popup-overlay" onClick={onClose}>
        <div className="place-popup" onClick={e => e.stopPropagation()}>
          <button className="popup-close-btn" onClick={onClose}>
            ←
          </button>
          {tripDetail !== null ? (
            <div className="detail-container">
              <div className="detail-image-container">
                <img
                  src={tripDetail.image || '/restaurant.png'}
                  alt={tripDetail.translated_restaurant_name}
                  className="detail-image"
                />
              </div>
              <div className="content-container">
                <div className="flex title-container">
                  <h1 className="title">{tripDetail.translated_restaurant_name}</h1>
                </div>
                <div className="location">
                  <span className="location-icon">📍</span>
                  <span>{tripDetail.location}</span>
                </div>
                <div className="divider"></div>
                <h2 className="section-title">설명</h2>
                <p className="review-text">{tripDetail.genre}</p>
                <div className="divider"></div>
                <h2 className="section-title">가격 정보</h2>
                <p className="price-review-text">{tripDetail.budget}</p>
                <div className="divider"></div>
                {/* 주요 필드만 출력 */}
                {mainFields.map(field => {
                  const value = tripDetail[field.key];
                  if (!value && value !== 0) return null; // falsy 값(0 포함) 방지

                  let displayValue;
                  if (field.key === 'smoking_code') {
                    // smoking_code만 따로 처리
                    displayValue = value === 1 || value === '1' ? '예'
                                : value === 0 || value === '0' ? '아니오'
                                : '-';
                  } else if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  } else if (typeof value === 'object') {
                    displayValue = JSON.stringify(value);
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <div key={field.key}>
                      <h2 className="section-title">{field.label}</h2>
                      <p className="review-text">{displayValue}</p>
                      <div className="divider"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-screen max-w-[500px] mx-auto">
              <div className="text-lg">로딩 중...</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TripDetailModal;
