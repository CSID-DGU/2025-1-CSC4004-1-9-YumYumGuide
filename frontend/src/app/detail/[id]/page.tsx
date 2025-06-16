'use client';
import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './detail.css';
import { useQueryDetail } from '@/api/detail';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data, isLoading, error } = useQueryDetail(id);
  const [showMenu, setShowMenu] = useState(false);
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

  const detail = data.data;

  if (detail.type === 'restaurant') {
    return (
      <div className="detail-container">
        <button onClick={goBack} className="back-button">
          ←
        </button>
        <div className="detail-image-container">
          <img
            src={detail.video || '/restaurant.png'}
            alt={detail.restaurant_name}
            sizes="(max-width: 768px) 100vw, 600px"
            className="detail-image "
          />
        </div>

        <div className="content-container">
          <div className="flex title-container">
            <h1 className="title">{detail.restaurant_name}</h1>
            {detail.rating && (
              <div className="rating-badge">
                <span className="rating-star">★</span>
                <span className="rating-text">{detail.rating}</span>
              </div>
            )}
          </div>

          <div className="location">
            <span className="location-icon">📍</span>
            <span>{detail.location}</span>
          </div>

          <div className="divider"></div>

          <h2 className="section-title">영업 정보</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">영업시간</span>
              <span className="info-value">{detail.business_hours}</span>
            </div>
            <div className="info-item">
              <span className="info-label">휴무일</span>
              <span className="info-value">{detail.closed_days}</span>
            </div>
            <div className="info-item">
              <span className="info-label">예산</span>
              <span className="info-value">{detail.budget}</span>
            </div>
            <div className="info-item">
              <span className="info-label">좌석 수</span>
              <span className="info-value">{detail.seats}석</span>
            </div>
          </div>

          {detail.menus && detail.menus.length > 0 && (
            <>
              <div className="divider"></div>
              <div className="menu-section">
                <div className="menu-header" onClick={() => setShowMenu(!showMenu)}>
                  <h2 className="section-title">메뉴</h2>
                  <span className="toggle-icon">{showMenu ? '▼' : '▶'}</span>
                </div>
                {showMenu && (
                  <div className="menu-list">
                    {detail.menus.map((menu) => (
                      <div key={menu._id} className="menu-item">
                        <span className="menu-name">{menu.menu}</span>
                        <span className="menu-price">¥{menu.price.toLocaleString()} </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="divider"></div>

          <h2 className="section-title">시설 정보</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">흡연</span>
              <span className="info-value">{detail.smoking}</span>
            </div>
            <div className="info-item">
              <span className="info-label">주차</span>
              <span className="info-value">{detail.parking}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Wi-Fi</span>
              <span className="info-value">{detail.wifi_available}</span>
            </div>
            <div className="info-item">
              <span className="info-label">결제 방법</span>
              <span className="info-value">{detail.credit_card}</span>
            </div>
          </div>

          <div className="divider"></div>

          <h2 className="section-title">상세 정보</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">주소</span>
              <span className="info-value">{detail.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">전화번호</span>
              <span className="info-value">{detail.phone_number}</span>
            </div>
            <div className="info-item">
              <span className="info-label">장르</span>
              <span className="info-value">{detail.genre}</span>
            </div>
          </div>

          {detail.remarks && (
            <>
              <div className="divider"></div>
              <h2 className="section-title">특이사항</h2>
              <p className="remarks-text">{detail.remarks}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Attraction layout
  return (
    <div className="detail-container">
      <button onClick={goBack} className="back-button">
        ←
      </button>
      <div className="detail-image-container">
        <Image
          src={detail.image || '/attraction.png'}
          alt={detail.attraction}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          priority
          quality={90}
          className="detail-image"
        />
      </div>

      <div className="content-container">
        <div className="flex title-container">
          <h1 className="title">{detail.attraction}</h1>
          {/* {detail.category && (
            <div className="category-badge">
              <span className="category-text">{detail.type}</span>
            </div>
          )} */}
        </div>

        <div className="location">
          <span className="location-icon">📍</span>
          <span>{detail.address}</span>
        </div>

        <div className="divider"></div>

        <h2 className="section-title">설명</h2>
        <p className="description-text">{detail.description}</p>

        {detail.price && (
          <>
            <div className="divider"></div>
            <h2 className="section-title">가격 정보</h2>
            <p className="price-info">{detail.price} ￥</p>
          </>
        )}
      </div>
    </div>
  );
}
