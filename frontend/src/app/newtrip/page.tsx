'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';

const NewTrip = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState(21);
  const [endDate, setEndDate] = useState(23);
  const [selectedRegion, setSelectedRegion] = useState('도쿄');

  const goBack = () => {
    router.back();
  };

  const regions = [
    { id: 'tokyo', name: '도쿄', icon: '☀️' },
    { id: 'kyoto', name: '교토', icon: '🌸' },
    { id: 'hokkaido', name: '홋카이도', icon: '❄️' },
    { id: 'osaka', name: '오사카', icon: '🔷' }
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = [18, 19, 20, 21, 22, 23, 24];

  return (
    <div className="max-w-[500px] mx-auto bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="flex items-center p-5">
        <button 
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
        >
          &lt;
        </button>
        <h1 className="text-xl font-semibold">새로운 일정</h1>
      </div>

      {/* 시작 일자 선택 */}
      <div className="bg-gray-50 mx-5 p-5 rounded-3xl mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">✈️</span>
            <h2 className="text-lg font-medium">시작 일자</h2>
          </div>
          <div className="flex">
            <button className="w-8 h-8 flex items-center justify-center">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center">&gt;</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map((day, index) => (
            <div key={`start-day-${index}`} className="text-gray-400 text-sm">
              {day}
            </div>
          ))}
          
          {dates.map((date, index) => (
            <div 
              key={`start-date-${index}`} 
              className={`py-2 rounded-lg ${date === startDate ? 'bg-[#5DC697] text-white font-semibold' : ''}`}
            >
              {date}
            </div>
          ))}
        </div>
      </div>

      {/* 종료 일자 선택 */}
      <div className="bg-gray-50 mx-5 p-5 rounded-3xl mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🏠</span>
            <h2 className="text-lg font-medium">종료 일자</h2>
          </div>
          <div className="flex">
            <button className="w-8 h-8 flex items-center justify-center">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center">&gt;</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map((day, index) => (
            <div key={`end-day-${index}`} className="text-gray-400 text-sm">
              {day}
            </div>
          ))}
          
          {dates.map((date, index) => (
            <div 
              key={`end-date-${index}`} 
              className={`py-2 rounded-lg ${date === endDate ? 'bg-[#5DC697] text-white font-semibold' : ''}`}
            >
              {date}
            </div>
          ))}
        </div>
      </div>

      {/* 여행 지역 선택 */}
      <div className="mx-5 mb-8">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">📍</span>
          <h2 className="text-lg font-medium">여행 지역</h2>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {regions.map((region) => (
            <div 
              key={region.id}
              onClick={() => setSelectedRegion(region.name)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer
                ${selectedRegion === region.name ? 'bg-[#5DC697] text-black' : 'bg-gray-100'}`}
            >
              <span className="text-2xl mb-1">{region.icon}</span>
              <span className="text-sm">{region.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 일정 생성 버튼 */}
      <div className="mx-5">
        <button className="w-full bg-[#5DC697] text-black py-4 rounded-full font-medium text-lg flex items-center justify-center">
          <span className="mr-2">🚀</span>
          일정 생성하기
        </button>
      </div>

      {/* 네비게이션 바 */}
      <Nav />
    </div>
  );
};

export default NewTrip;