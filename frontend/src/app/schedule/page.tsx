'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../componets/nav';
import './schedule.css';

const Schedule = () => {
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
      image: '/tokyo-tower.jpg' // 실제 이미지 경로로 대체 필요
    },
    {
      id: 2,
      date: '2025.04.22',
      title: '스카이트리',
      location: 'Sumida City, Tokyo',
      image: '/skytree.jpg' // 실제 이미지 경로로 대체 필요
    },
    {
      id: 3,
      date: '2025.04.22',
      title: '규카츠 모토무라 시부야점',
      location: 'Shibuya, Tokyo',
      image: '/restaurant.jpg' // 실제 이미지 경로로 대체 필요
    }
  ];

  return (
    <div className="schedule-container max-w-[500px] mx-auto bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="schedule-header flex justify-between items-center p-4">
        <button className="back-button w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          <span>&lt;</span>
        </button>
        <h1 className="header-title text-xl font-medium">일정</h1>
        <button className="notification-button w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          <span>🔔</span>
        </button>
      </div>

      {/* 날짜 선택 */}
      <div className="date-selector px-4 py-2 flex justify-between items-center">
        <h2 className="date-title text-lg font-medium">4월 22일</h2>
        <div className="date-navigation flex gap-2">
          <button className="nav-button w-6 h-6 flex items-center justify-center">&lt;</button>
          <button className="nav-button w-6 h-6 flex items-center justify-center">&gt;</button>
        </div>
      </div>

      {/* 요일 및 날짜 */}
      <div className="week-view grid grid-cols-7 text-center bg-gray-50 p-4 rounded-lg mx-4">
        {weekDays.map((day, index) => (
          <div className="day-column" key={index}>
            <div className="day-label text-sm text-gray-500 mb-2">{day}</div>
            <div className={`date-circle w-10 h-10 mx-auto flex items-center justify-center rounded-full 
              ${dates[index] === 22 ? 'bg-[#27C289] text-white' : ''} 
              ${[21, 23].includes(dates[index]) ? 'bg-[#B3E9D5]' : 'bg-transparent'}`}>
              {dates[index]}
            </div>
          </div>
        ))}
      </div>

      {/* 일정 목록 */}
      <div className="schedule-list px-4 mt-6">
        <h3 className="list-title text-lg font-medium mb-4">나의 일정</h3>
        
        <div className="space-y-3">
          {schedules.map(schedule => (
            <div className="schedule-item flex items-center border-b border-gray-200 py-4" key={schedule.id}>
              <div className="schedule-image w-12 h-12 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                <img src={schedule.image} alt={schedule.title} className="w-full h-full object-cover" />
              </div>
              <div className="schedule-details flex-1">
                <div className="schedule-date text-xs text-gray-500 mb-1">
                  <span className="calendar-icon mr-1">📅</span>
                  <span>{schedule.date}</span>
                </div>
                <div className="schedule-title font-medium mb-1">{schedule.title}</div>
                <div className="schedule-location text-xs text-gray-500">
                  <span className="location-icon mr-1">📍</span>
                  <span>{schedule.location}</span>
                </div>
              </div>
              <div className="schedule-arrow text-gray-400 flex-shrink-0">
                <span>&gt;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Schedule;
