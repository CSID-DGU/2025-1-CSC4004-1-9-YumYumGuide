'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './schedule.css';
import { useQuerySchedule } from '@/api/schedule';

interface PlanListProps {
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
  selectedDate?: string | null;
}

// --- 날짜 헬퍼 함수 ---
function yyyymmddStringToUtcDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // JS month는 0부터 시작
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(Date.UTC(year, month, day));
}

function formatDateToDisplay(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dayOfMonth = date.getUTCDate().toString().padStart(2, '0');
  return `${year}.${month}.${dayOfMonth}`;
}

export default function PlanList({ dateRange, selectedDate }: PlanListProps) {
  const { data, isLoading, isError, refetch } = useQuerySchedule(dateRange);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      refetch();
    }
  }, [dateRange.startDate, dateRange.endDate, refetch]);

  if (isLoading) {
    return <div className="schedule-list px-4 mt-6 text-center">로딩 중...</div>;
  }

  if (isError) {
    return <div className="schedule-list px-4 mt-6 text-center text-red-500">일정을 불러오는데 실패했습니다.</div>;
  }

  let schedules = data?.data || [];
  if (selectedDate) {
    schedules = [
      ...schedules.filter((schedule) =>
        schedule.days.some((day) => {
          const dateObj = new Date(day.date);
          const kstDate = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
          const yyyy = kstDate.getFullYear();
          const mm = String(kstDate.getMonth() + 1).padStart(2, '0');
          const dd = String(kstDate.getDate()).padStart(2, '0');
          return `${yyyy}${mm}${dd}` === selectedDate;
        }),
      ),
      ...schedules.filter(
        (schedule) =>
          !schedule.days.some((day) => {
            const dateObj = new Date(day.date);
            const kstDate = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
            const yyyy = kstDate.getFullYear();
            const mm = String(kstDate.getMonth() + 1).padStart(2, '0');
            const dd = String(kstDate.getDate()).padStart(2, '0');
            return `${yyyy}${mm}${dd}` === selectedDate;
          }),
      ),
    ];
  }

  // days의 date(UTC)를 KST로 변환하여 'YYYYMMDD' 포맷으로 scheduleDates 생성
  const scheduleDates = (data?.data || []).flatMap((schedule) =>
    schedule.days.map((day) => {
      const dateObj = new Date(day.date);
      // KST 변환: UTC + 9시간
      const kstDate = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
      const yyyy = kstDate.getFullYear();
      const mm = String(kstDate.getMonth() + 1).padStart(2, '0');
      const dd = String(kstDate.getDate()).padStart(2, '0');
      return `${yyyy}${mm}${dd}`;
    }),
  );

  return (
    <div className="schedule-list px-4 mt-6">
      <h3 className="list-title text-lg font-bold mb-4">나의 일정</h3>

      <div className="schedule-scroll-container max-h-[calc(100vh-200px)] md:max-h-[580px] overflow-y-auto scrollbar-hide pb-24">
        <div className="space-y-6">
          {schedules.length === 0 ? (
            <Link href="/newSchedule">
              <div className="empty-schedule-box flex flex-col items-center justify-center mx-auto mt-8 mb-8">
                <div style={{ fontSize: 40, color: '#bdbdbd', marginBottom: 8 }}>+</div>
                <div style={{ color: '#888', fontSize: 16 }}>일정 추가하기</div>
              </div>
            </Link>
          ) : (
            schedules.map((schedule) => {
              const scheduleBaseDate = yyyymmddStringToUtcDate(schedule.startDate);
              return (
                <div key={schedule._id} className="schedule-block bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-semibold text-gray-800 group-hover:text-blue-600">
                      {`${schedule.startDate.substring(4, 6)}.${schedule.startDate.substring(
                        6,
                        8,
                      )} ~ ${schedule.endDate.substring(4, 6)}.${schedule.endDate.substring(6, 8)}`}
                    </h4>
                  </div>

                  {/* 각 Day 순회 */}
                  <div className="space-y-4">
                    {schedule.days.map((day) => {
                      const currentDayDate = new Date(scheduleBaseDate.getTime());
                      currentDayDate.setUTCDate(scheduleBaseDate.getUTCDate() + (day.day - 1));
                      const displayDateForDay = formatDateToDisplay(currentDayDate);

                      return (
                        <div key={day.day} className="day-section pt-2">
                          <h5 className="text-sm font-medium text-gray-500 mb-3">
                            {day.day}일차 - <span className="text-gray-700">{displayDateForDay}</span>
                          </h5>
                          {/* 각 Event 순회 */}
                          <div className="space-y-3">
                            {day.events.length > 0 ? (
                              day.events.map((event, eventIndex) => (
                                <Link
                                  href={`/detail/${event.refId}`}
                                  key={`${event.refId}-${eventIndex}`}
                                  className="block mb-3 group"
                                >
                                  <div className="event-card bg-gray-50 p-3 rounded-lg shadow-sm flex items-center hover:bg-gray-100 transition-colors duration-150">
                                    {/* Image container to maintain size even if image fails to load */}
                                    <div className="image-container w-[80px] h-[80px] rounded-md mr-4 flex-shrink-0 overflow-hidden relative">
                                    <img
                                      src={event?.image} // 초기 로드 시도 (event.image가 없으면 default_image.png 시도)
                                      alt={'img'}
                                      className="custom-image w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/default_image.png';
                                      }}
                                    />
                                    </div>
                                    <div className="event-details flex-1 min-w-0">
                                      <div className="text-xs text-gray-400 mb-0.5">
                                        <span className="mr-1">🗓️</span>
                                        {displayDateForDay}
                                      </div>
                                      <p className="text-sm font-semibold text-gray-800 truncate">{event.name}</p>
                                    </div>
                                    <div className="text-gray-400 ml-2 flex-shrink-0 self-center">
                                      <span>&gt;</span>
                                    </div>
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 pl-1">해당 날짜의 일정이 없습니다.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
