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
      image: '/tokyo-tower.png',
      spot: 'Minato City, Tokyo'
    },
    {
      id: 2,
      date: '2025.04.22',
      title: '스카이트리',
      image: '/skytree.png',
      spot: 'Sumida City, Tokyo'
    },
    {
      id: 3,
      date: '2025.04.22',
      title: '규카츠 모토무라 시부야점',
      image: '/restaurant.png',
      spot: 'Shibuya City, Tokyo'
    },
    {
      id: 4,
      date: '2025.04.22',
      title: '규카츠 모토무라 시부야점',
      image: '/restaurant.png',
      spot: 'Shibuya City, Tokyo'
    },
    {
      id: 5,
      date: '2025.04.22',
      title: '규카츠 모토무라 시부야점',
      image: '/restaurant.png',
      spot: 'Shibuya City, Tokyo'
    },
    {
      id: 6,
      date: '2025.04.22',
      title: '규카츠 모토무라 시부야점',
      image: '/restaurant.png',
      spot: 'Shibuya City, Tokyo'
    },
    {
      id: 7,
      date: '2025.04.22',
      title: '규카츠 모토무라 시부야점',
      image: '/restaurant.png',
      spot: 'Shibuya City, Tokyo'
    },
  ];

  return (
    <div className="schedule-container max-w-[500px] mx-auto bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="schedule-header flex justify-between items-center p-4">
        <h1 className="header-title text-xl font-medium">일정</h1>
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
      <div className="week-view grid grid-cols-7 text-center bg-gray-50 p-4 rounded-xl mx-4">
        {weekDays.map((day, index) => (
          <div 
            className={`day-column relative flex flex-col items-center ${[21, 22, 23].includes(dates[index]) ? 'bg-[#B3E9D5] rounded-lg' : ''}`} 
            key={index}
          >
            <div className="day-label text-sm text-gray-400 mb-2 weekly">{day}</div>
            <div className="date-container">
              <div className={`date-number text-lg ${[21, 22, 23].includes(dates[index]) ? 'text-black font-semibold' : 'text-gray-500'}`}>
                {dates[index]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 일정 목록 */}
      <div className="schedule-list px-4 mt-6">
        <h3 className="list-title text-lg font-bold mb-4">나의 일정</h3>
        
        <div className="schedule-scroll-container max-h-[580px] overflow-y-scroll scrollbar-hide">
          <div className="space-y-4">
            {schedules.map(schedule => (
              <Link href={`/detail/${schedule.id}`} key={schedule.id}>
                <div className="schedule-item flex items-center bg-gray-50 p-3 rounded-xl">
                  <div className="schedule-image w-16 h-16 rounded-xl overflow-hidden mr-4 flex-shrink-0">
                    <img src={schedule.image} alt={schedule.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="schedule-details flex-1">
                    {schedule.date && (
                      <div className="schedule-date text-xs text-gray-500 mb-1">
                        <span className="calendar-icon mr-1">📅</span>
                        <span>{schedule.date}</span>
                      </div>
                    )}
                    <div className="schedule-title text-base font-medium">{schedule.title}</div>
                    <div className="schedule-subtitle text-sm text-gray-600">{schedule.spot}</div>
                  </div>
                  <div className="schedule-arrow text-gray-400 flex-shrink-0 mr-2">
                    <span>&gt;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Schedule;