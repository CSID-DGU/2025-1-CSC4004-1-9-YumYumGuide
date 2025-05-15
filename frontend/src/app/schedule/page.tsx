"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../componets/nav';
import './schedule.css';

const Schedule = () => {
  // 요일 데이터
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // 오늘 날짜 기준 초기 연/월
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // 범위 선택 상태
  const [range, setRange] = useState<{start: number|null, end: number|null}>({start: null, end: null});

  // 달력 데이터 생성 함수
  function getCalendarMatrix(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay(); // 0: Sunday
    const lastDate = new Date(year, month + 1, 0).getDate();
    const matrix = [];
    let day = 1 - firstDay;
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        if (day > 0 && day <= lastDate) {
          row.push(day);
        } else {
          row.push(null);
        }
        day++;
      }
      matrix.push(row);
    }
    return matrix;
  }

  const calendarMatrix = getCalendarMatrix(currentYear, currentMonth);

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

  // 날짜 클릭 핸들러
  const handleDateClick = (date: number) => {
    if (range.start === null || (range.start !== null && range.end !== null)) {
      setRange({start: date, end: null});
    } else {
      setRange({start: range.start, end: date});
    }
  };

  // 날짜가 선택된 범위에 포함되는지
  const isSelected = (date: number) => {
    if (range.start !== null && range.end !== null) {
      const [min, max] = [range.start, range.end].sort((a, b) => a - b);
      return date >= min && date <= max;
    }
    return date === range.start;
  };

  // 월 이동 핸들러
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 월/일 포맷
  const monthLabel = `${currentYear}년 ${currentMonth + 1}월`;

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20 max-w-[500px] mx-auto px-2.5">
      {/* 헤더 */}
      <div className="schedule-header flex justify-between items-center p-4">
        <h1 className="header-title text-xl font-medium">일정</h1>
      </div>

      {/* 날짜 선택 (동적 달력) */}
      <div className="date-block-cal px-2.5 mx-2.5 py-4 border border-gray-200 rounded-xl overflow-x-auto">
        <div className="date-title-cal flex items-center gap-2">
          <img src="/icons/airplane.png" alt="airplane" className="date-icon-cal" />
          <span>시작 일자</span>
        </div>
        <div className="calendar-header-cal font-bold text-lg my-2 flex items-center gap-2">
          <button onClick={handlePrevMonth} className="text-2xl px-2">{'<'}</button>
          <span>{monthLabel}</span>
          <button onClick={handleNextMonth} className="text-2xl px-2">{'>'}</button>
        </div>
        <div className="w-full min-w-[340px]">
          <table className="calendar-table-cal w-full text-center">
            <thead>
              <tr>
                {weekDays.map((day, i) => (
                  <th key={i} className="text-gray-400 font-semibold text-base py-1">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarMatrix.map((row, i) => (
                <tr key={i}>
                  {row.map((date, j) => (
                    <td
                      key={j}
                      className={
                        date
                          ? isSelected(date)
                            ? 'calendar-selected-cal bg-[#4CC88A] text-white font-bold rounded-lg transition-all duration-150 cursor-pointer w-9 h-9 md:w-10 md:h-10'
                            : 'cursor-pointer w-9 h-9 md:w-10 md:h-10 transition-all duration-150'
                          : ''
                      }
                      onClick={() => {
                        if (!date) return;
                        handleDateClick(date);
                      }}
                      style={{ minWidth: 36, minHeight: 36 }}
                    >
                      {date || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 일정 목록 */}
      <div className="schedule-list px-4 mt-6">
        <h3 className="list-title text-lg font-bold mb-4">나의 일정</h3>
        
        <div className="schedule-scroll-container max-h-[580px] overflow-y-scroll scrollbar-hide pb-24">
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