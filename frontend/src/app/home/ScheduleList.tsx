'use client';

import React from 'react';
import Image from 'next/image';
import { useQuerySchedule } from '@/api/schedule';
import { useRouter } from 'next/navigation';

const ScheduleList = () => {
  const router = useRouter();
  const { data: scheduleResponse, isLoading } = useQuerySchedule();

  const handleAdd = () => router.push('/newSchedule');
  const handleSelect = () => router.push(`/schedule`);

  if (isLoading) {
    return (
      <div>
        <p className="text-2xl font-semibold mb-2">다음 일정</p>
        <div className="flex items-center justify-center h-[100px]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  const schedules = scheduleResponse?.data || [];

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
      {schedules.map((schedule) => {
        // 첫 번째 이벤트 찾기
        const firstEvent = schedule.days[0]?.events[0];

        return (
          <div
            className="flex items-center justify-between bg-white rounded-xl shadow p-3 w-full hover:bg-gray-50 cursor-pointer h-[100px]"
            key={schedule._id}
            onClick={() => handleSelect()}
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  firstEvent?.image ||
                  (firstEvent?.type === 'attraction'
                    ? '/attraction.png'
                    : firstEvent?.type === 'restaurant'
                    ? '/restaurant.png'
                    : '/default-event.png')
                }
                alt={firstEvent?.name || '일정 이미지'}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
              <div className="flex flex-col flex-1">
                <div className="font-bold text-base truncate">
                  {`${schedule.startDate.substring(4, 6)}.${schedule.startDate.substring(
                    6,
                    8,
                  )} ~ ${schedule.endDate.substring(4, 6)}.${schedule.endDate.substring(6, 8)}`}
                </div>
                <div className="text-gray-500 text-sm">
                  {firstEvent
                    ? `${firstEvent.name} 외 ${
                        schedule.days.reduce((acc, day) => acc + day.events.length, 0) - 1
                      }개 장소`
                    : '일정 없음'}
                </div>
                <div className="text-gray-400 text-xs truncate">{schedule.days.length}일 일정</div>
              </div>
            </div>
            <Image src="/icons/arrow.svg" alt="arrow" width={24} height={24} className="mr-2" />
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleList;
