'use client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// 요일 데이터
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 오늘 날짜 기준 초기 연/월
const today = new Date();

interface CustomCalenderProps {
  onDateSelect: (startDate: string, endDate: string) => void;
}

export default function CustomCalender({ onDateSelect }: CustomCalenderProps) {
  const searchParams = useSearchParams();

  // URL에서 startDate 파라미터를 가져와서 초기 연/월 설정
  const [currentYear, setCurrentYear] = useState(() => {
    const startDate = searchParams.get('startDate');
    if (startDate) {
      return parseInt(startDate.substring(0, 4));
    }
    return today.getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const startDate = searchParams.get('startDate');
    if (startDate) {
      return parseInt(startDate.substring(4, 6)) - 1; // 월은 0부터 시작하므로 1을 빼줌
    }
    return today.getMonth();
  });

  // 범위 선택 상태
  const [range, setRange] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });

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

  // 일정 데이터 (이 부분은 더미 데이터이며 실제 API 데이터로 교체해야 합니다)
  type ScheduleType = {
    id: number;
    date: string;
    title: string;
    image: string;
    spot: string;
  };

  // 오늘과 내일 날짜 구하기 (string)
  function formatDate(dateObj: Date) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  const todayDateObj = new Date();
  const tomorrowDateObj = new Date();
  tomorrowDateObj.setDate(todayDateObj.getDate() + 1);
  const todayStr = formatDate(todayDateObj);
  const tomorrowStr = formatDate(tomorrowDateObj);

  const schedules: ScheduleType[] = [
    // 이 데이터는 PlanList에서 가져와야 함
    {
      id: 1,
      date: todayStr,
      title: '도쿄타워',
      image: '/tokyo-tower.png',
      spot: 'Minato City, Tokyo',
    },
    {
      id: 2,
      date: tomorrowStr,
      title: '스카이트리',
      image: '/skytree.png',
      spot: 'Sumida City, Tokyo',
    },
  ];

  // 일정이 있는 날짜 배열 (YYYYMMDD) (이 데이터는 PlanList에서 가져와야 함)
  const scheduleDates = schedules.map((s) => s.date);

  // 날짜 클릭 핸들러
  const handleDateClick = (date: number) => {
    const newRange = { start: date, end: date };
    setRange(newRange);
    
    // 즉시 날짜 선택 이벤트 발생
    const formattedDate = `${currentYear}${String(currentMonth + 1).padStart(2, '0')}${String(date).padStart(2, '0')}`;
    onDateSelect(formattedDate, formattedDate);
  };

  // 날짜가 선택된 범위에 포함되는지
  const isSelected = (date: number) => {
    return date === range.start;
  };

  // 월 이동 핸들러
  const handlePrevMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth;

    if (currentMonth === 0) {
      newYear = currentYear - 1;
      newMonth = 11;
    } else {
      newMonth = currentMonth - 1;
    }

    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setRange({ start: null, end: null }); // 월이 변경되면 선택 초기화
  };

  const handleNextMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth;

    if (currentMonth === 11) {
      newYear = currentYear + 1;
      newMonth = 0;
    } else {
      newMonth = currentMonth + 1;
    }

    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setRange({ start: null, end: null }); // 월이 변경되면 선택 초기화
  };

  // 월/일 포맷
  const monthLabel = `${currentYear}년 ${currentMonth + 1}월`;

  return (
    <>
      <div className="date-block-cal px-4 py-4 border border-gray-200 rounded-xl bg-white">
        <div className="date-title-cal flex items-center gap-2">
          <Image width={18} height={18} src="/icons/airplane.png" alt="airplane" className="date-icon-cal" />
          <span>시작 일자</span>
        </div>
        <div className="calendar-header-cal font-bold text-lg my-2 flex items-center gap-2">
          <button onClick={handlePrevMonth} className="text-2xl px-2">
            {'<'}
          </button>
          <span>{monthLabel}</span>
          <button onClick={handleNextMonth} className="text-2xl px-2">
            {'>'}
          </button>
        </div>
        <div className="w-full">
          <table className="calendar-table-cal w-full text-center">
            <thead>
              <tr>
                {weekDays.map((day, i) => (
                  <th key={i} className="text-gray-400 font-semibold text-base py-1 w-9 md:w-10">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarMatrix.map((row, i) => (
                <tr key={i}>
                  {row.map((date, j) => {
                    // 날짜 포맷 맞추기
                    const dateStr = date
                      ? `${currentYear}${String(currentMonth + 1).padStart(2, '0')}${String(date).padStart(2, '0')}`
                      : '';
                    return (
                      <td
                        key={j}
                        className={date ? 'cursor-pointer transition-all duration-150' : ''}
                        onClick={() => {
                          if (!date) return;
                          handleDateClick(date);
                        }}
                      >
                        {date ? (
                          <div
                            className={
                              isSelected(date)
                                ? 'bg-[#4CC88A] text-white font-bold rounded-lg flex items-center justify-center w-9 h-10 md:w-10 md:h-11 mx-auto'
                                : scheduleDates.includes(dateStr)
                                ? 'bg-green-100 text-[#4CC88A] font-semibold rounded-lg flex items-center justify-center w-9 h-10 md:w-10 md:h-11 mx-auto'
                                : 'flex items-center justify-center w-9 h-10 md:w-10 md:h-11 mx-auto'
                            }
                          >
                            {date}
                          </div>
                        ) : (
                          ''
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
