'use client';

import React from 'react';
import Image from 'next/image';

type Schedule = {
  id: number;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
};

const defaultSchedules: Schedule[] = [
  // 예시: 일정이 있을 때 아래 주석 해제
  {
    id: 1,
    title: '도쿄타워',
    image: '',
    rating: 4.7,
    reviews: 512,
    location: 'Minato City, Tokyo',
  },
  {
    id: 2,
    title: '스카이트리',
    image: '',
    rating: 4.3,
    reviews: 320,
    location: 'Sumida City, Tokyo',
  },
];

const ScheduleList = () => {
  const schedules = defaultSchedules;
  const handleAdd = () => alert('일정 추가하기');
  const handleSelect = (id: number) => alert(`일정 선택: ${id}`);

  if (!schedules || schedules.length === 0) {
    return (
      <div>
        <p className="text-2xl font-semibold mb-2">다음 일정</p>
        <div
          className="flex flex-col items-center justify-center bg-gray-200 rounded-xl shadow p-6 cursor-pointer hover:bg-gray-300 transition w-full h-[100px]"
          onClick={handleAdd}
        >
          <span className="text-3xl text-gray-400 mb-2">+</span>
          <div className="text-gray-500 text-base">일정 추가하기</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-2xl font-semibold mb-2">다음 일정</p>
      {schedules.map((schedule) => (
        <div
          className="flex items-center justify-between bg-white rounded-xl shadow p-3 w-full hover:bg-gray-50 cursor-pointer h-[100px]"
          key={schedule.id}
          onClick={() => handleSelect(schedule.id)}
        >
          <div className="flex items-center gap-4">
            <Image
              src="/icons/80x80.svg"
              alt={schedule.title}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="flex flex-col flex-1">
              <div className="font-bold text-base truncate">{schedule.title}</div>
              <div className="text-gray-500 text-sm">
                ⭐ {schedule.rating} ({schedule.reviews})
              </div>
              <div className="text-gray-400 text-xs truncate">🚩 {schedule.location}</div>
            </div>
          </div>
          <Image src="/icons/arrow.svg" alt="arrow" width={24} height={24} className="mr-2" />
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;
