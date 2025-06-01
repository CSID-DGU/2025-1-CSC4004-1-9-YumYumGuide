'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TripDetailModalProps {
  id: string;
  onClose: () => void;
}

const TripDetailModal: React.FC<TripDetailModalProps> = ({ id, onClose }) => {
  const router = useRouter();
  const [tripDetail, setTripDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/trips/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('데이터를 불러오는데 실패했습니다');
        const data = await res.json();
        setTripDetail(data);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetail();
  }, [id]);
  // useEffect(() => {
  //     const fetchTripDetail = async () => {
  //       if (!id) return; // id가 없으면 요청하지 않음
        
  //       try {
  //         setLoading(true);
  //         // 실제 API로 교체
  //         const response = await fetch(`/api/trips/${id}`, {
  //           credentials: 'include'
  //         });
          
  //         if (!response.ok) {
  //           throw new Error('데이터를 불러오는데 실패했습니다');
  //         }
          
  //         const data = await response.json();
  //         setTripDetail(data);
  //         setLoading(false);
  //       } catch (err) {
  //         setError('데이터를 불러오는 중 오류가 발생했습니다.');
  //         setLoading(false);
  //         console.error('Error fetching trip detail:', err);
  //       }
  //   };

  return (
    <>
      {/* 바깥 영역 클릭 시 닫힘 */}
      <div className="popup-overlay" onClick={onClose} />

      <div className="detail-popup">
        <button className="popup-close-btn" onClick={onClose}>×</button>

        {loading && <p>로딩 중...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {tripDetail && (
          <>
            <h2>{tripDetail.translated_restaurant_name || tripDetail.attraction || '상세 정보'}</h2>
            {tripDetail.genre && <p><strong>장르:</strong> {tripDetail.genre}</p>}
            {tripDetail.budget && <p><strong>예산:</strong> {tripDetail.budget}</p>}
            {tripDetail.description && <p><strong>설명:</strong> {tripDetail.description}</p>}
          </>
        )}
      </div>
    </>
  );
};

export default TripDetailModal;
