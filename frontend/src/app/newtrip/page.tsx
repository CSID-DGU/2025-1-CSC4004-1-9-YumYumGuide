'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import { CityIcons } from './icons';
import './newtrip.css';

const NewTrip = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState(21);
  const [endDate, setEndDate] = useState(23);
  const [selectedRegion, setSelectedRegion] = useState('도쿄');

  const goBack = () => {
    router.back();
  };

  const regions = [
    { id: 'tokyo', name: '도쿄', icon: <CityIcons.Tokyo /> },
    { id: 'kyoto', name: '교토', icon: <CityIcons.Kyoto /> },
    { id: 'hokkaido', name: '홋카이도', icon: <CityIcons.Hokkaido /> },
    { id: 'osaka', name: '오사카', icon: <CityIcons.Osaka /> }
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = [18, 19, 20, 21, 22, 23, 24];

  return (
    <div className="max-w-[500px] mx-auto bg-white min-h-screen pb-24 relative">
      {/* 헤더 */}
      <div className="flex items-center pt-6 px-6 pb-4">
        <button 
          onClick={goBack}
          className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-5 text-lg"
        >
          &lt;
        </button>
        <h1 className="text-xl font-bold">새로운 일정</h1>
      </div>

      <div className="px-6 space-y-5">
        {/* 시작 일자 선택 */}
        <div className="date-selector bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <span className="text-lg mr-2">✈️</span>
              <h2 className="text-base font-medium">시작 일자</h2>
            </div>
            <div className="flex items-center ml-auto">
              <button className="w-6 h-6 flex items-center justify-center text-gray-400">&lt;</button>
              <button className="w-6 h-6 flex items-center justify-center text-gray-400 ml-1">&gt;</button>
            </div>
          </div>
          
          {/* 요일 */}
          <div className="day-row grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day, index) => (
              <div key={`start-weekday-${index}`} className="text-center text-gray-400 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* 날짜 */}
          <div className="date-row grid grid-cols-7 gap-2">
            {dates.map((date, index) => (
              <div 
                key={`start-date-${index}`}
                className="text-center"
              >
                <div 
                  className={`date-circle w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center
                    ${date === startDate ? 'active-date bg-[#7ED1AA]' : ''}`}
                >
                  <span className={`text-lg ${date === startDate ? 'text-white' : 'text-gray-700'}`}>{date}</span>
                  {date === startDate && <span className="text-[10px] text-white">시작</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 종료 일자 선택 */}
        <div className="date-selector bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <span className="text-lg mr-2">🏁</span>
              <h2 className="text-base font-medium">종료 일자</h2>
            </div>
            <div className="flex items-center ml-auto">
              <button className="w-6 h-6 flex items-center justify-center text-gray-400">&lt;</button>
              <button className="w-6 h-6 flex items-center justify-center text-gray-400 ml-1">&gt;</button>
            </div>
          </div>
          
          {/* 요일 */}
          <div className="day-row grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day, index) => (
              <div key={`end-weekday-${index}`} className="text-center text-gray-400 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* 날짜 */}
          <div className="date-row grid grid-cols-7 gap-2">
            {dates.map((date, index) => (
              <div 
                key={`end-date-${index}`}
                className="text-center"
              >
                <div 
                  className={`date-circle w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center
                    ${date === endDate ? 'active-date bg-[#7ED1AA]' : ''}`}
                >
                  <span className={`text-lg ${date === endDate ? 'text-white' : 'text-gray-700'}`}>{date}</span>
                  {date === endDate && <span className="text-[10px] text-white">종료</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 여행 지역 선택 */}
        <div>
          <div className="flex items-center mb-5">
            <span className="text-xl mr-3">📍</span>
            <h2 className="text-lg font-semibold">여행 지역</h2>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {regions.map((region) => (
              <div 
                key={region.id}
                onClick={() => setSelectedRegion(region.name)}
                className={`city-container cursor-pointer
                  ${selectedRegion === region.name ? 'selected' : ''}`}
              >
                <div className="city-icon">
                  {region.icon}
                </div>
                <span className="text-sm font-medium">{region.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 일정 생성 버튼 */}
        <button className="create-button">
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