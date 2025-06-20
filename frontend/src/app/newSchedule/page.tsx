'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Nav from '../componets/nav';
import './newSchedule.css';
import dayjs from 'dayjs';
import PlaceSearchPopup from './PlaceSearchPopup';

const flightTimes = [
  { label: '오전', value: 'morning' },
  { label: '오후', value: 'afternoon' },
  { label: '저녁', value: 'evening' },
  { label: '새벽', value: 'dawn' },
];

interface UserPreferences {
  smoking: number;
  drinking: number;
  travelStyle: string;
  favoriteFood: number;
  groupType: string;
  attractionTypes: string[];
  [key: string]: any; // Allow other properties if they exist
}

interface Place {
  name: string;
  type: 'restaurant' | 'attraction';
  address: string;
  budget?: number;
  description?: string;
  image?: string;
  genre?: string;
  category?: string;
}

const NewSchedule = () => {
  const [budget, setBudget] = useState(0);
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [editingPlaceIndex, setEditingPlaceIndex] = useState<number | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [flightDeparture, setFlightDeparture] = useState('morning');
  const [flightArrival, setFlightArrival] = useState('morning');
  const [userId, setUserId] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // 캘린더 상태 추가
  const today = dayjs();
  const [startCalendar, setStartCalendar] = useState({
    year: today.year(),
    month: today.month(), // 0-indexed
    selected: today.date(),
  });
  const [endCalendar, setEndCalendar] = useState({
    year: today.year(),
    month: today.month(),
    selected: today.date() + 2,
  });

  // 달력 날짜 배열 생성 함수
  const getCalendarMatrix = (year: number, month: number) => {
    const firstDay = dayjs(`${year}-${month + 1}-01`);
    const startDay = firstDay.day();
    const daysInMonth = firstDay.daysInMonth();
    const matrix = [];
    let day = 1 - startDay;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++, day++) {
        week.push(day > 0 && day <= daysInMonth ? day : null);
      }
      matrix.push(week);
    }
    return matrix;
  };

  // 시작일자 선택 핸들러
  const handleStartDateSelect = (day: number | null) => {
    if (!day) return;

    const newStartDate = dayjs(`${startCalendar.year}-${startCalendar.month + 1}-${day}`);
    const currentEndDate = dayjs(`${endCalendar.year}-${endCalendar.month + 1}-${endCalendar.selected}`);

    if (newStartDate.isAfter(currentEndDate)) {
      // 시작일자가 종료일자보다 늦으면 종료일자를 시작일자로 설정
      setEndCalendar({
        year: startCalendar.year,
        month: startCalendar.month,
        selected: day,
      });
    }

    setStartCalendar((cal) => ({ ...cal, selected: day }));
  };

  // 종료일자 선택 핸들러
  const handleEndDateSelect = (day: number | null) => {
    if (!day) return;

    const currentStartDate = dayjs(`${startCalendar.year}-${startCalendar.month + 1}-${startCalendar.selected}`);
    const newEndDate = dayjs(`${endCalendar.year}-${endCalendar.month + 1}-${day}`);

    if (newEndDate.isBefore(currentStartDate)) {
      alert('종료일자는 시작일자보다 이전일 수 없습니다.');
      return;
    }

    // 10일 제한 체크
    const duration = newEndDate.diff(currentStartDate, 'day') + 1;
    if (duration > 10) {
      alert('최대 여행 기간은 10일입니다.');
      return;
    }

    setEndCalendar((cal) => ({ ...cal, selected: day }));
  };

  const handleAddPlace = (place: Place) => {
    if (editingPlaceIndex !== null) {
      const newPlaces = [...selectedPlaces];
      newPlaces[editingPlaceIndex] = place;
      setSelectedPlaces(newPlaces);
      setEditingPlaceIndex(null);
    } else {
      if (!selectedPlaces.some((p) => p.name === place.name) && selectedPlaces.length < 5) {
        setSelectedPlaces([...selectedPlaces, place]);
      }
    }
    setIsPlacePopupOpen(false);
  };

  const handleEditPlace = (index: number) => {
    if (selectedRegions.length === 0) {
      alert('먼저 여행지역을 선택해 주세요.');
      return;
    }
    setEditingPlaceIndex(index);
    setIsPlacePopupOpen(true);
  };

  const handleAddPlaceClick = () => {
    if (selectedRegions.length === 0) {
      alert('먼저 여행지역을 선택해 주세요.');
      return;
    }
    setIsPlacePopupOpen(true);
  };

  const handleDeletePlace = (index: number) => {
    setSelectedPlaces(selectedPlaces.filter((_, i) => i !== index));
  };

  const regionData = [
    { name: '고탄다' },
    { name: '긴자' },
    { name: '나카메' },
    { name: '니혼바시' },
    { name: '도쿄역 주변' },
    { name: '마루노우치' },
    { name: '메구로' },
    { name: '시부야' },
    { name: '신바시' },
    { name: '신주쿠' },
    { name: '아사쿠사' },
    { name: '아키하바라' },
    { name: '에비스' },
    { name: '우에노' },
    { name: '유라쿠초' },
    { name: '이케부코로' },
    { name: '칸다' },
    { name: '타마 치' },
    { name: '하마 마츠' },
  ];

  // Calculate trip duration
  const calculateTripDuration = () => {
    const startDate = dayjs(`${startCalendar.year}-${startCalendar.month + 1}-${startCalendar.selected}`);
    const endDate = dayjs(`${endCalendar.year}-${endCalendar.month + 1}-${endCalendar.selected}`);
    return endDate.diff(startDate, 'day') + 1;
  };

  // 여행 기간이 변경될 때마다 선택된 지역 초기화
  useEffect(() => {
    const duration = calculateTripDuration();
    if (selectedRegions.length > duration) {
      setSelectedRegions([]);
    }
  }, [startCalendar, endCalendar]);

  useEffect(() => {
    setSelectedPlaces([]);
  }, [selectedRegions]);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log('사용자 정보 요청 시작');
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        console.log('응답 상태:', response.status);
        const responseData = await response.json();
        console.log('응답 데이터:', responseData);

        if (!response.ok) {
          if (response.status === 401) {
            console.log('인증되지 않은 사용자');
            router.push('/login');
            return;
          }
          throw new Error(responseData.message || '사용자 정보를 가져오는데 실패했습니다.');
        }

        if (!responseData.data) {
          throw new Error('사용자 데이터가 없습니다.');
        }

        const userData = responseData.data;
        setUserId(userData._id);
        // preferences가 없는 경우 기본값 설정
        setUserPreferences({
          smoking: userData.preferences.smoking,
          drinking: userData.preferences.drinking,
          travelStyle: userData.preferences.travelStyle,
          favoriteFood: userData.preferences.favoriteFood,
          groupType: userData.preferences.groupType,
          attractionTypes: userData.preferences.attractionType,
          ...userData.preferences,
        });

        console.log('사용자 정보 설정 완료:', {
          userId: userData._id,
          preferences: userData.preferences,
        });
      } catch (error) {
        console.error('사용자 정보 조회 중 상세 오류:', error);
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert('사용자 정보를 가져오는데 실패했습니다. 다시 로그인해주세요.');
        }
        router.push('/login');
      }
    };

    fetchUserInfo();
  }, [router]);

  // 여행 지역 선택 핸들러 추가
  const handleRegionSelect = (regionName: string) => {
    const duration = calculateTripDuration();
    const minRegions = Math.ceil(duration / 2); // 최소 선택해야 하는 지역 수 (날짜의 절반)

    if (selectedRegions.includes(regionName)) {
      // 지역을 제거하려고 할 때
      const newSelectedRegions = selectedRegions.filter((r) => r !== regionName);
      if (newSelectedRegions.length < minRegions) {
        alert(`최소 ${minRegions}개의 지역을 선택해야 합니다.`);
        return;
      }
      setSelectedRegions(newSelectedRegions);
    } else if (selectedRegions.length < duration) {
      // 새로운 지역을 추가할 때
      setSelectedRegions([...selectedRegions, regionName]);
    }
  };

  // 일정 생성 핸들러 수정
  const handleCreateSchedule = async () => {
    try {
      const duration = calculateTripDuration();
      const minRegions = Math.ceil(duration / 2);

      if (selectedRegions.length < minRegions) {
        alert(`최소 ${minRegions}개의 지역을 선택해야 합니다.`);
        return;
      }

      setIsLoading(true);
      if (!userId || !userPreferences) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      console.log('일정 생성 시작');

      const scheduleData = {
        userId,
        flightDeparture,
        flightArrival,
        startDate: new Date(startCalendar.year, startCalendar.month, startCalendar.selected),
        endDate: new Date(endCalendar.year, endCalendar.month, endCalendar.selected),
        selectedRegions,
        selectedPlaces: selectedPlaces.map((place) => place.name),
        budget,
        smoking: userPreferences.smoking === 1,
        drinking: userPreferences.drinking === 1,
        travelStyle: userPreferences.travelStyle === '맛집 위주' ? 'food' : 'sightseeing',
        foodPreference: Number(userPreferences.favoriteFood) || 0,
        groupSize: userPreferences.groupType === '1인&2인' ? 0 : 1,
        attractionTypes: userPreferences.attractionTypes,
      };

      console.log('전송할 데이터:', {
        ...scheduleData,
        startDate: scheduleData.startDate.toISOString(),
        endDate: scheduleData.endDate.toISOString(),
      });

      console.log('백엔드 API 호출 시작');
      const response = await fetch('http://localhost:5000/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(scheduleData),
      });

      console.log('API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = '일정 생성에 실패했습니다.';
        try {
          // const errorData = await response.json();
          // console.error('API 응답 에러:', {
          //   status: response.status,
          //   statusText: response.statusText,
          //   error: errorData,
          // });
          // errorMessage = errorData.message || errorMessage;
        } catch (e) {
          alert('데이터상에 여행지역이 적어요. 여행지역을 추가해주세요');
          // console.error('에러 응답 파싱 실패:', e);
          // const text = await response.text();
          // console.error('원본 응답:', text);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('일정 생성 성공:', result);

      console.log('결과 페이지로 이동');
      router.push(`/schedule/result/${result._id}`);
    } catch (error) {
      console.error('일정 생성 중 오류 발생:', error);
      alert('일정 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-schedule-container">
      <div className="text-center p-6 font-bold text-[24px]">새로운 일정</div>
      {/* 비행기 출발/도착 시간 선택 UI */}
      <div className="flight-time-section">
        <div className="flight-time-block">
          <span className="flight-time-title">
            <Image src="/icons/clock.png" alt="clock" width={20} height={20} className="flight-time-icon" /> 출국 시간
          </span>
          <div className="flight-time-list">
            {flightTimes.map((t) => (
              <div
                key={t.value}
                className={`flight-time-item${flightDeparture === t.value ? ' flight-time-selected' : ''}`}
                onClick={() => setFlightDeparture(t.value)}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flight-time-block">
          <span className="flight-time-title">
            <Image src="/icons/clock.png" alt="clock" width={20} height={20} className="flight-time-icon" /> 귀국 시간
          </span>
          <div className="flight-time-list">
            {flightTimes.map((t) => (
              <div
                key={t.value}
                className={`flight-time-item${flightArrival === t.value ? ' flight-time-selected' : ''}`}
                onClick={() => setFlightArrival(t.value)}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="new-schedule-content">
        {/* 시작/종료 날짜 */}
        <div className="date-section-cal">
          <div className="date-block-cal">
            <div className="date-title-cal">
              <Image src="/icons/airplane.png" alt="airplane" width={20} height={20} className="date-icon-cal" />
              <span>시작 일자</span>
            </div>
            <div className="calendar-header-cal">
              <button
                onClick={() => {
                  let m = startCalendar.month - 1,
                    y = startCalendar.year;
                  if (m < 0) {
                    m = 11;
                    y--;
                  }
                  const newCal = { ...startCalendar, year: y, month: m };
                  setStartCalendar(newCal);
                  const duration = calculateTripDuration();
                  if (selectedRegions.length > duration) {
                    setSelectedRegions([]);
                  }
                }}
              >
                {'<'}
              </button>
              {` ${startCalendar.year}년 ${startCalendar.month + 1}월 `}
              <button
                onClick={() => {
                  let m = startCalendar.month + 1,
                    y = startCalendar.year;
                  if (m > 11) {
                    m = 0;
                    y++;
                  }
                  const newCal = { ...startCalendar, year: y, month: m };
                  setStartCalendar(newCal);
                  const duration = calculateTripDuration();
                  if (selectedRegions.length > duration) {
                    setSelectedRegions([]);
                  }
                }}
              >
                {'>'}
              </button>
            </div>
            <table className="calendar-table-cal">
              <thead>
                <tr>
                  <th>S</th>
                  <th>M</th>
                  <th>T</th>
                  <th>W</th>
                  <th>T</th>
                  <th>F</th>
                  <th>S</th>
                </tr>
              </thead>
              <tbody>
                {getCalendarMatrix(startCalendar.year, startCalendar.month).map((week, i) => (
                  <tr key={i}>
                    {week.map((d, j) => (
                      <td
                        key={j}
                        className={
                          d === null
                            ? ''
                            : d === startCalendar.selected
                            ? 'calendar-selected-cal'
                            : startCalendar.year === today.year() &&
                              startCalendar.month === today.month() &&
                              d === today.date()
                            ? 'calendar-today-cal'
                            : ''
                        }
                        onClick={() => handleStartDateSelect(d)}
                        style={{
                          cursor: d ? 'pointer' : 'default',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          width: '40px',
                          height: '40px',
                        }}
                      >
                        {d || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="calendar-divider-cal"></div>
          <div className="date-block-cal">
            <div className="date-title-cal">
              <Image src="/icons/comebackhome.png" alt="home" width={20} height={20} className="date-icon-cal" />
              <span>종료 일자</span>
            </div>
            <div className="calendar-header-cal">
              <button
                onClick={() => {
                  let m = endCalendar.month - 1,
                    y = endCalendar.year;
                  if (m < 0) {
                    m = 11;
                    y--;
                  }
                  const newCal = { ...endCalendar, year: y, month: m };
                  setEndCalendar(newCal);
                  const duration = calculateTripDuration();
                  if (selectedRegions.length > duration) {
                    setSelectedRegions([]);
                  }
                }}
              >
                {'<'}
              </button>
              {` ${endCalendar.year}년 ${endCalendar.month + 1}월 `}
              <button
                onClick={() => {
                  let m = endCalendar.month + 1,
                    y = endCalendar.year;
                  if (m > 11) {
                    m = 0;
                    y++;
                  }
                  const newCal = { ...endCalendar, year: y, month: m };
                  setEndCalendar(newCal);
                  const duration = calculateTripDuration();
                  if (selectedRegions.length > duration) {
                    setSelectedRegions([]);
                  }
                }}
              >
                {'>'}
              </button>
            </div>
            <table className="calendar-table-cal">
              <thead>
                <tr>
                  <th>S</th>
                  <th>M</th>
                  <th>T</th>
                  <th>W</th>
                  <th>T</th>
                  <th>F</th>
                  <th>S</th>
                </tr>
              </thead>
              <tbody>
                {getCalendarMatrix(endCalendar.year, endCalendar.month).map((week, i) => (
                  <tr key={i}>
                    {week.map((d, j) => (
                      <td
                        key={j}
                        className={
                          d === null
                            ? ''
                            : d === endCalendar.selected
                            ? 'calendar-selected-cal'
                            : endCalendar.year === today.year() &&
                              endCalendar.month === endCalendar.month &&
                              d === today.date()
                            ? 'calendar-today-cal'
                            : ''
                        }
                        onClick={() => handleEndDateSelect(d)}
                        style={{
                          cursor: d ? 'pointer' : 'default',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          width: '40px',
                          height: '40px',
                        }}
                      >
                        {d || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* 여행 지역 */}
        <div className="region-section">
          <div className="region-title">
            여행 지역 ({selectedRegions.length}/{calculateTripDuration()}개 선택 가능)
          </div>
          <div className="region-list">
            {regionData.map((region) => (
              <div
                key={region.name}
                className={`region-item ${selectedRegions.includes(region.name) ? 'region-selected' : ''}`}
                onClick={() => handleRegionSelect(region.name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '60px',
                  padding: '12px 20px',
                  fontSize: '1.2rem',
                }}
              >
                <div>{region.name}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 가고 싶은 명소 */}
        <div className="place-section">
          <div className="place-title"> 가고 싶은 명소</div>
          <div className="place-list">
            {selectedPlaces.map((place, idx) => (
              <div key={place.name} className="place-item place-selected">
                <span className="place-name" onClick={() => handleEditPlace(idx)}>
                  {place.name}
                </span>
                <button className="place-delete-btn" onClick={() => handleDeletePlace(idx)}>
                  ×
                </button>
              </div>
            ))}
            {editingPlaceIndex === null && selectedPlaces.length < 5 && (
              <div className="place-item place-add" onClick={handleAddPlaceClick}>
                +
              </div>
            )}
          </div>
        </div>
        {/* 여행 예산 */}
        <div className="budget-section-ui">
          <div className="budget-title-ui">$ 여행 예산</div>
          <div className="budget-value-ui">{budget.toLocaleString()}원</div>
          <div className="budget-btns-ui">
            <button onClick={() => setBudget(budget + 1000000)} className="budget-btn-ui">
              + 1,000,000
            </button>
            <button onClick={() => setBudget(budget + 500000)} className="budget-btn-ui">
              + 500,000
            </button>
            <button onClick={() => setBudget(budget + 100000)} className="budget-btn-ui">
              + 100,000
            </button>
          </div>
          <button onClick={() => setBudget(0)} className="budget-reset-ui">
            초기화
          </button>
        </div>
        {/* 일정 생성하기 버튼 */}
        <button
          className={`create-schedule-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleCreateSchedule}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <span>일정 생성 중...</span>
            </div>
          ) : (
            '일정 생성하기'
          )}
        </button>
      </div>
      <PlaceSearchPopup
        isOpen={isPlacePopupOpen}
        onClose={() => {
          setIsPlacePopupOpen(false);
          setEditingPlaceIndex(null);
        }}
        onSelectPlace={handleAddPlace}
        selectedRegions={selectedRegions}
        existingSelectedPlaces={selectedPlaces.map((p) => p.name)}
      />
      <Nav />
    </div>
  );
};

export default NewSchedule;
