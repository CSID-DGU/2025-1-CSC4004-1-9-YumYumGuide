"use client";
import React, { useState } from 'react';
import Nav from '../../componets/nav';

// 타입 정의
type PlaceType = '관광' | '맛집';

const mockData = [
  {
    day: 1,
    places: []
  },
  {
    day: 2,
    places: [
      {
        name: '도쿄타워',
        type: '관광' as PlaceType,
        price: 13860,
      },
      {
        name: '스카이트리',
        type: '관광' as PlaceType,
        price: 14949,
      },
      {
        name: '규카츠 모토무라 시부야점',
        type: '맛집' as PlaceType,
        price: 8811,
      },
    ]
  },
  {
    day: 3,
    places: []
  }
];

const icons: Record<PlaceType, string> = {
  관광: '🏛️',
  맛집: '🍜',
};

export default function ScheduleResult() {
  const [selectedDay, setSelectedDay] = useState(2);
  const dayData = mockData.find(d => d.day === selectedDay);
  const total = dayData?.places.reduce((sum, p) => sum + p.price, 0) || 0;
  const 관광수 = dayData?.places.filter(p => p.type === '관광').length || 0;
  const 맛집수 = dayData?.places.filter(p => p.type === '맛집').length || 0;

  return (
    <div className="min-h-screen bg-white font-sans pb-8">
      {/* 상단 타이틀 */}
      <div style={{ fontWeight: 700, fontSize: 22, textAlign: 'center', marginTop: 0, marginBottom: 0, letterSpacing: '-0.5px' }}>일정 생성 결과</div>
      {/* 탭바 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', margin: '36px 0 0 0', gap: 0, position: 'relative' }}>
        {[1,2,3].map(day => (
          <div
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: selectedDay === day ? '#19c37d' : '#222',
              borderBottom: selectedDay === day ? '2.5px solid #19c37d' : '2.5px solid transparent',
              padding: '0 8px',
              cursor: 'pointer',
              transition: 'color 0.2s, border 0.2s',
              zIndex: 1
            }}
          >
            {day}일차
          </div>
        ))}
        {/* +버튼 */}
        <div style={{ position: 'absolute', right: -32, top: -8 }}>
          <button style={{ width: 44, height: 44, borderRadius: '50%', background: '#19c37d', border: 'none', color: '#fff', fontSize: 32, fontWeight: 700, boxShadow: '0 2px 8px rgba(25,195,125,0.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>
      {/* 요약 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f8f9fa', borderRadius: 16, padding: '10px 18px', width: 180, margin: '0 auto 18px auto', fontWeight: 600, fontSize: 16 }}>
        <span>🏛️x{관광수}</span>
        <span>🍜x{맛집수}</span>
        <span style={{ marginLeft: 8, fontWeight: 700 }}>₩{total.toLocaleString()}</span>
      </div>
      {/* 순서/장소 헤더 + 필터 */}
      <div style={{ maxWidth: 420, margin: '0 auto', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', color: '#b0b0b0', fontWeight: 600, fontSize: 15 }}>
          <div style={{ width: 40 }}>순서</div>
          <div>장소</div>
        </div>
        {/* 필터 아이콘 (이모지 대체) */}
        <span style={{ fontSize: 22, color: '#b0b0b0', cursor: 'pointer', marginRight: 2 }}>⏳</span>
      </div>
      {/* 장소 리스트 */}
      <div style={{ maxWidth: 420, margin: '0 auto', marginTop: 0 }}>
        {dayData?.places.map((place, idx) => (
          <div key={place.name} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px rgba(25,195,125,0.07)', padding: '18px 18px 12px 18px', marginBottom: 16, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: 18, fontWeight: 700, color: '#19c37d', fontSize: 18 }}>{idx+1}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 17, marginLeft: 32 }}>
              <span style={{ color: '#19c37d', fontSize: 20 }}>{icons[place.type]}</span>
              <span>{place.name}</span>
            </div>
            <div style={{ color: '#888', fontWeight: 500, fontSize: 15, margin: '4px 0 8px 32px' }}>
              {place.type} | ₩{place.price.toLocaleString()}
            </div>
            <button style={{ alignSelf: 'flex-start', color: '#222', background: 'none', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: 0, marginLeft: 32, marginTop: 2 }}>상세보기 &gt;</button>
            {/* 카드 우측 상단 점 3개 */}
            <span style={{ position: 'absolute', right: 18, top: 18, fontSize: 22, color: '#b0b0b0', cursor: 'pointer' }}>⋮</span>
          </div>
        ))}
      </div>
      <div style={{ height: 60 }} />
      <Nav />
    </div>
  );
} 