'use client';

import Navbar from '../componets/nav';
import { useState } from 'react';
import Image from 'next/image';

export default function SchedulePage() {
  // 요일 데이터
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = [18, 19, 20, 21, 22, 23, 24];
  
  // 일정 데이터
  const schedules = [
    {
      id: 1,
      date: '2025.04.22',
      title: '도쿄타워',
      location: 'Minato City, Tokyo',
      image: '/icons/home.png'
    },
    {
      id: 2,
      date: '2025.04.22',
      title: '스카이트리',
      location: 'Sumida City, Tokyo',
      image: '/icons/schedule.png'
    },
    {
      id: 3,
      date: '2025.04.22',
      title: '규카츠 모토무라 시부야점',
      location: 'Shibuya, Tokyo',
      image: '/icons/Location.png'
    }
  ];

  return (
    <div className="max-w-[500px] w-full mx-auto bg-white min-h-screen pb-24">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span>&lt;</span>
        </button>
        <h1 className="text-xl font-semibold">일정</h1>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span>🔔</span>
        </button>
      </div>

      {/* 날짜 선택 */}
      <div className="flex justify-between items-center px-4 mb-4">
        <h2 className="text-lg font-semibold">4월 22일</h2>
        <div className="flex gap-2">
          <button>&lt;</button>
          <button>&gt;</button>
        </div>
      </div>

      {/* 요일 및 날짜 */}
      <div className="flex justify-between px-4 mb-6">
        {weekDays.map((day, index) => (
          <div className="flex flex-col items-center" key={index}>
            <div className="text-sm text-gray-500 mb-2">{day}</div>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${dates[index] === 22 ? 'bg-[#8ee3a9]' : ''}`}>
              {dates[index]}
            </div>
          </div>
        ))}
      </div>

      {/* 일정 목록 */}
      <div className="px-4">
        <h3 className="text-lg font-semibold mb-4">나의 일정</h3>
        
        {schedules.map(schedule => (
          <div className="flex items-center mb-4 pb-2 border-b border-gray-100" key={schedule.id}>
            <div className="w-[60px] h-[60px] rounded-lg overflow-hidden mr-3 relative">
              <Image src={schedule.image} alt={schedule.title} width={60} height={60} className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="mr-1">📅</span>
                <span>{schedule.date}</span>
              </div>
              <div className="text-base font-medium mb-1">{schedule.title}</div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-1">📍</span>
                <span>{schedule.location}</span>
              </div>
            </div>
            <div className="text-gray-300">
              <span>&gt;</span>
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 바 */}
      <Navbar />
    </div>
  );
}
