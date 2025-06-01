'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import TripDetailModal from '../map/components/TripDetailModal';
import './newSchedule.css';
import dayjs from 'dayjs';
import axios from 'axios';

const flightTimes = [
  { label: '오전', value: 'morning' },
  { label: '오후', value: 'afternoon' },
  { label: '저녁', value: 'evening' },
  { label: '새벽', value: 'dawn' },
];

type SearchResult = {
  "restaurants": any[],
  "attractions": any[],
  "totalCount": {
    "restaurants": number;
    "attractions": number;
  },
  "searchInfo": {
    "query": string;
    "region": string;
    "searchTime": number;
  }
}

const NewSchedule = () => {
  const [budget, setBudget] = useState(0);
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [editingPlaceIndex, setEditingPlaceIndex] = useState<number | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const router = useRouter();
  const [flightDeparture, setFlightDeparture] = useState('morning');
  const [flightArrival, setFlightArrival] = useState('morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  
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

  // 검색 함수
  const searchPlaces = async (query: string) => {
    if (!query.trim() || selectedRegions.length === 0) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
        "query": query,
        "region": selectedRegions[0]
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("검색 오류:", error);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddPlace = (placeName: string) => {
    if (editingPlaceIndex !== null) {
      const newPlaces = [...selectedPlaces];
      newPlaces[editingPlaceIndex] = placeName;
      setSelectedPlaces(newPlaces);
      setEditingPlaceIndex(null);
    } else {
      if (!selectedPlaces.includes(placeName) && selectedPlaces.length < 5) {
        setSelectedPlaces([...selectedPlaces, placeName]);
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

  // 검색 입력 처리
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: any) => {
    searchPlaces(searchQuery);
  };
  
    const regionData = [
    { name: '고탄다', region: 'gotanda' },
    { name: '긴자', region: 'ginza' },
    { name: '나카메', region: 'nakame' },
    { name: '니혼바시', region: 'nihonbashi' },
    { name: '도쿄역 주변', region: 'tokyo_station' },
    { name: '마루노우치', region: 'marunouchi' },
    { name: '메구로', region: 'meguro' },
    { name: '시부야', region: 'shibuya' },
    { name: '신바시', region: 'shimbashi' },
    { name: '신주쿠', region: 'shinjuku' },
    { name: '아사쿠사', region: 'asakusa' },
    { name: '아키하바라', region: 'akihabara' },
    { name: '에비스', region: 'ebisu' },
    { name: '우에노', region: 'ueno' },
    { name: '유라쿠초', region: 'yurakucho' },
    { name: '이케부코로', region: 'ikebukuro' },
    { name: '칸다', region: 'kanda' },
    { name: '타마 치', region: 'tamachi' },
    { name: '하마 마츠', region: 'hamamatsu' },
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

  useEffect(()=> {
    searchPlaces(searchQuery)
  }, [searchQuery])

  return (
    <div className="new-schedule-container">
      <div className="text-center p-6 font-bold text-[24px]">새로운 일정</div>
      {/* 비행기 출발/도착 시간 선택 UI */}
      <div className="flight-time-section">
        <div className="flight-time-block">
          <span className="flight-time-title"><img src="/icons/clock.png" alt="clock" className="flight-time-icon" /> 비행기 출발 시간</span>
          <div className="flight-time-list">
            {flightTimes.map(t => (
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
          <span className="flight-time-title"><img src="/icons/clock.png" alt="clock" className="flight-time-icon" /> 비행기 도착 시간</span>
          <div className="flight-time-list">
            {flightTimes.map(t => (
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
              <img src="/icons/airplane.png" alt="airplane" className="date-icon-cal" />
              <span>시작 일자</span>
            </div>
            <div className="calendar-header-cal">
              <button onClick={() => {
                let m = startCalendar.month - 1, y = startCalendar.year;
                if (m < 0) { m = 11; y--; }
                const newCal = { ...startCalendar, year: y, month: m };
                setStartCalendar(newCal);
                const duration = calculateTripDuration();
                if (selectedRegions.length > duration) {
                  setSelectedRegions([]);
                }
              }}>{'<'}</button>
              {` ${startCalendar.year}년 ${startCalendar.month + 1}월 `}
              <button onClick={() => {
                let m = startCalendar.month + 1, y = startCalendar.year;
                if (m > 11) { m = 0; y++; }
                const newCal = { ...startCalendar, year: y, month: m };
                setStartCalendar(newCal);
                const duration = calculateTripDuration();
                if (selectedRegions.length > duration) {
                  setSelectedRegions([]);
                }
              }}>{'>'}</button>
            </div>
            <table className="calendar-table-cal">
              <thead>
                <tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>
              </thead>
              <tbody>
                {getCalendarMatrix(startCalendar.year, startCalendar.month).map((week, i) => (
                  <tr key={i}>
                    {week.map((d, j) => (
                      <td
                        key={j}
                        className={
                          d === null ? '' :
                          d === startCalendar.selected ? 'calendar-selected-cal' :
                          (startCalendar.year === today.year() && startCalendar.month === today.month() && d === today.date()) ? 'calendar-today-cal' : ''
                        }
                        onClick={() => {
                          if (d) {
                            setStartCalendar(cal => ({ ...cal, selected: d }));
                            const duration = calculateTripDuration();
                            if (selectedRegions.length > duration) {
                              setSelectedRegions([]);
                            }
                          }
                        }}
                        style={{ cursor: d ? 'pointer' : 'default' }}
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
              <img src="/icons/comebackhome.png" alt="home" className="date-icon-cal" />
              <span>종료 일자</span>
            </div>
            <div className="calendar-header-cal">
              <button onClick={() => {
                let m = endCalendar.month - 1, y = endCalendar.year;
                if (m < 0) { m = 11; y--; }
                const newCal = { ...endCalendar, year: y, month: m };
                setEndCalendar(newCal);
                const duration = calculateTripDuration();
                if (selectedRegions.length > duration) {
                  setSelectedRegions([]);
                }
              }}>{'<'}</button>
              {` ${endCalendar.year}년 ${endCalendar.month + 1}월 `}
              <button onClick={() => {
                let m = endCalendar.month + 1, y = endCalendar.year;
                if (m > 11) { m = 0; y++; }
                const newCal = { ...endCalendar, year: y, month: m };
                setEndCalendar(newCal);
                const duration = calculateTripDuration();
                if (selectedRegions.length > duration) {
                  setSelectedRegions([]);
                }
              }}>{'>'}</button>
            </div>
            <table className="calendar-table-cal">
              <thead>
                <tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>
              </thead>
              <tbody>
                {getCalendarMatrix(endCalendar.year, endCalendar.month).map((week, i) => (
                  <tr key={i}>
                    {week.map((d, j) => (
                      <td
                        key={j}
                                                className={
                          d === null ? '' :
                          d === endCalendar.selected ? 'calendar-selected-cal' :
                          (endCalendar.year === today.year() && endCalendar.month === today.month() && d === today.date()) ? 'calendar-today-cal' : ''
                        }
                        onClick={() => {
                          if (d) {
                            setEndCalendar(cal => ({ ...cal, selected: d }));
                            const duration = calculateTripDuration();
                            if (selectedRegions.length > duration) {
                              setSelectedRegions([]);
                            }
                          }
                        }}
                        style={{ cursor: d ? 'pointer' : 'default' }}
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
          <div className="region-title">여행 지역 ({selectedRegions.length}/{calculateTripDuration()}개 선택 가능)</div>
          <div className="region-list">
            {regionData.map(region => (
              <div
                key={region.region}
                className={`region-item ${selectedRegions.includes(region.region) ? 'region-selected' : ''}`}
                onClick={() => {
                  const duration = calculateTripDuration();
                  if (selectedRegions.includes(region.region)) {
                    setSelectedRegions(selectedRegions.filter(r => r !== region.region));
                  } else if (selectedRegions.length < duration) {
                    setSelectedRegions([...selectedRegions, region.region]);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <div>{region.name}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 가고 싶은 명소 */}
        <div className="place-section">
          <div className="place-title">꼭 가고 싶은 명소</div>
          <div className="place-list">
            {selectedPlaces.map((place, idx) => (
              <div 
                key={place} 
                className="place-item place-selected"
              >
                <span className="place-name" onClick={() => handleEditPlace(idx)}>{place}</span>
                <button 
                  className="place-delete-btn"
                  onClick={() => handleDeletePlace(idx)}
                >
                  ×
                </button>
              </div>
            ))}
            {editingPlaceIndex === null && selectedPlaces.length < 5 && (
            <div className="place-item place-add" onClick={handleAddPlaceClick}>+</div>
            )}
          </div>
        </div>
        {/* 여행 예산 */}
        <div className="budget-section-ui">
          <div className="budget-title-ui">$ 여행 예산</div>
          <div className="budget-value-ui">{budget.toLocaleString()}원</div>
          <div className="budget-btns-ui">
            <button onClick={() => setBudget(budget + 1000000)} className="budget-btn-ui">+ 1,000,000</button>
            <button onClick={() => setBudget(budget + 500000)} className="budget-btn-ui">+ 500,000</button>
            <button onClick={() => setBudget(budget + 100000)} className="budget-btn-ui">+ 100,000</button>
          </div>
          <button onClick={() => setBudget(0)} className="budget-reset-ui">초기화</button>
        </div>
        {/* 일정 생성하기 버튼 */}
        <button className="create-schedule-btn" onClick={() => router.push('/schedule/result')}>일정 생성하기</button>
      </div>
      {isPlacePopupOpen && (
        <>
          <div className="popup-overlay" onClick={() => setIsPlacePopupOpen(false)} />
          <div className="place-popup">
            <button className="popup-close-btn" onClick={() => {
              setIsPlacePopupOpen(false);
              setEditingPlaceIndex(null);
            }}>←</button>
            <input 
              className="popup-search" 
              placeholder="검색하기..." 
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value)}}
              onKeyDown={(e) => {console.log(searchQuery); searchPlaces(searchQuery)}}
            />
            <div className="popup-place-list">
              {loading && <div>검색 중...</div>}
              {searchResults ? (
                <>
                  {searchResults.restaurants.map((restaurant) => (
                    <div
                      className={"popup-place-card" + (selectedPlaces.includes(restaurant.data.translated_restaurant_name) ? ' selected' : '')}
                      key={restaurant.data._id}
                    >
                      <div className="popup-place-title">
                        {restaurant.data.translated_restaurant_name} 
                        <span className="popup-place-badge">식당</span>
                      </div>
                      <div className="popup-place-meta">{restaurant.data.genre} | {restaurant.data.budget}</div>
                      <button 
                        className="popup-place-add-btn" 
                        onClick={() => handleAddPlace(restaurant.data.translated_restaurant_name)}
                      >
                        +
                      </button>
                      <div 
                        className="popup-place-detail" 
                        onClick={() => {
                          const id = restaurant.data._id;
                          setDetailId(restaurant.data._id);
                          setIsPlacePopupOpen(false);
                        }}
                      >
                        상세보기 &gt;
                      </div>
                    </div>
                  ))}

                  {searchResults.attractions.map((attraction) => (
                    <div 
                      className={"popup-place-card" + (selectedPlaces.includes(attraction.data.attraction) ? ' selected' : '')} 
                      key={attraction.data._id}
                    >
                      <div className="popup-place-title">
                        {attraction.data.attraction} 
                        <span className="popup-place-badge">관광</span>
                      </div>
                      <div className="popup-place-meta">{attraction.data.description}</div>
                      <button 
                        className="popup-place-add-btn" 
                        onClick={() => handleAddPlace(attraction.data.attraction)}
                      >
                        +
                      </button>
                      <div className="popup-place-detail" onClick={() => {setDetailId(attraction.data._id);setIsPlacePopupOpen(false);}}>상세보기 &gt;</div>
                    </div>
                  ))}
                  {searchResults.totalCount.restaurants === 0 && searchResults.totalCount.attractions === 0 && (
                    <div>검색 결과가 없습니다.</div>
                  )}
                </>
              ) : (
                !loading && <div>검색어를 입력하세요.</div>
              )}
            </div>
          </div>
        </>
      )}
      {detailId && (
        <TripDetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}

      <Nav />
    </div>
  );
};

export default NewSchedule;
