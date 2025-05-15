"use client";
import React, { useState, useRef, useEffect } from 'react';
import Nav from '../../componets/nav';

// 타입 정의
type PlaceType = '관광' | '맛집';

const mockData = [
  {
    day: 1,
    places: []
  },
  {
    day: 2,
    places: [
      {
        name: '도쿄타워',
        type: '관광' as PlaceType,
        price: 13860,
      },
      {
        name: '스카이트리',
        type: '관광' as PlaceType,
        price: 14949,
      },
      {
        name: '규카츠 모토무라 시부야점',
        type: '맛집' as PlaceType,
        price: 8811,
      },
    ]
  },
  {
    day: 3,
    places: []
  }
];

const icons: Record<PlaceType, string> = {
  관광: '🏛️',
  맛집: '🍜',
};

const categories = [
  { key: '관광', icon: '🏛️' },
  { key: '맛집', icon: '🍜' },
];

export default function ScheduleResult() {
  const [activeTab, setActiveTab] = useState(2);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popupTop, setPopupTop] = useState(0);
  const [popupLeft, setPopupLeft] = useState(0);
  const [openedActionIdx, setOpenedActionIdx] = useState<number | null>(null);
  const [showPlaceChange, setShowPlaceChange] = useState(false);

  // 필터링된 데이터
  const filteredData = activeFilters.length
    ? mockData[activeTab - 1].places.filter(p => activeFilters.includes(p.type.toString()))
    : mockData[activeTab - 1].places;

  // 탭 바 위치 계산
  const tabRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const ref = tabRefs[activeTab - 1].current;
    if (ref) {
      setUnderlineStyle({ left: ref.offsetLeft, width: ref.offsetWidth });
    }
  }, [activeTab]);

  // 필터 팝업 위치 계산
  const handleFilterBtnClick = () => {
    if (filterBtnRef.current && containerRef.current) {
      const btnRect = filterBtnRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const popupWidth = 180; // 예상 팝업 width(px)
      // 버튼의 left를 컨테이너 기준으로 변환
      let left = btnRect.left - containerRect.left;
      // 오른쪽이 넘치면 left를 조정
      if (left + popupWidth > containerRect.width) {
        left = containerRect.width - popupWidth - 8; // 8px margin
      }
      setPopupLeft(left);
      setPopupTop(btnRect.bottom - containerRect.top + 10); // 10px 아래
    }
    setFilterOpen(!filterOpen);
  };

  return (
    <div ref={containerRef} className="schedule-result-container relative min-h-screen bg-[#fafbfa] pb-24">
      <div className="text-center p-6 font-bold text-[24px]">일정 생성 결과</div>
      {/* 탭 */}
      <div className="flex justify-center gap-8 mb-4 relative" style={{height: 40}}>
        {[1,2,3].map((day, idx) => (
          <div
            key={day}
            ref={tabRefs[idx]}
            className={`cursor-pointer pb-1 text-lg font-semibold ${activeTab === day ? 'text-green-600' : 'text-gray-700'}`}
            onClick={() => setActiveTab(day)}
            style={{position: 'relative', zIndex: 1}}
          >{day}일차</div>
        ))}
        {/* 밑줄 바 */}
        <div
          className="absolute bottom-0 h-1 bg-green-500 rounded transition-all duration-200"
          style={{ left: underlineStyle.left, width: underlineStyle.width }}
        />
      </div>
      {/* 요약 바 & 필터 버튼 */}
      <div className="flex items-center justify-between mb-4 px-[30px]">
        <div className="flex items-center gap-2 bg-white rounded-full px-6 py-2 shadow">
          <span>🏛️x{mockData[activeTab - 1].places.filter(p => p.type === '관광').length}</span>
          <span>🍜x{mockData[activeTab - 1].places.filter(p => p.type === '맛집').length}</span>
          <span className="ml-2 font-semibold">₩{filteredData.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            ref={filterBtnRef}
            className="w-10 h-10 flex items-center justify-center text-2xl"
            onClick={handleFilterBtnClick}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-filter"><polygon points="22 3 2 3 10 14 10 21 14 21 14 14 22 3"></polygon></svg>
          </button>
        </div>
      </div>
      {/* 필터 팝업 */}
      {filterOpen && (
        <>
          {/* 오버레이: 팝업 바깥 클릭 시 닫힘 */}
          <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
          <div
            className="absolute z-50 bg-white rounded-2xl shadow-xl p-2"
            style={{ top: popupTop, left: popupLeft, minWidth: 160, width: 180 }}
          >
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className={`flex items-center px-4 py-3 cursor-pointer rounded-xl transition border-b border-gray-200
                  ${activeFilters.includes(cat.key) ? 'bg-gray-100' : ''}
                `}
                onClick={() =>
                  setActiveFilters(filters =>
                    filters.includes(cat.key)
                      ? filters.filter(f => f !== cat.key)
                      : [...filters, cat.key]
                  )
                }
              >
                <span className="text-xl w-5 mr-2">
                  {activeFilters.includes(cat.key) ? '✓' : ''}
                </span>
                <span className="text-xl mr-2">{cat.icon}</span>
                <span className="font-semibold">{cat.key}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {/* 리스트 헤더 */}
      <div className="flex px-[30px] mt-4 mb-2 text-gray-400 text-sm items-center">
        <div className="w-10">순서</div>
        <div className="h-5 w-px bg-gray-200 mx-2" />
        <div>장소</div>
      </div>
      {/* 일정 카드 리스트 */}
      <div className="px-[30px]">
        {filteredData.map((item, idx) => (
          <div key={item.name} className="flex items-start mb-4">
            {/* 순서 번호 */}
            <div className="w-8 flex-shrink-0 flex items-center justify-center text-lg font-bold text-gray-500 pt-2">
              {idx + 1}
            </div>
            {/* 카드 */}
            <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col relative ml-4">
              <div className="absolute top-4 right-4 text-2xl text-gray-300 cursor-pointer"
                   onClick={() => setOpenedActionIdx(idx)}>
                ⋮
              </div>
              {openedActionIdx === idx && (
                <>
                  {/* 오버레이: 팝업 바깥 클릭 시 닫힘 */}
                  <div className="fixed inset-0 z-40" onClick={() => setOpenedActionIdx(null)} />
                  <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg z-50 w-24">
                    <button className="w-full py-2 hover:bg-gray-100" onClick={() => {/* 삭제 로직 */}}>삭제</button>
                    <button className="w-full py-2 hover:bg-gray-100" onClick={() => { setShowPlaceChange(true); setOpenedActionIdx(null); }}>변경</button>
                  </div>
                </>
              )}
              <div className="font-bold text-lg">{item.name}</div>
              <div className="text-gray-500 text-sm mt-1">
                {icons[item.type as PlaceType]} {item.type} | ₩{item.price.toLocaleString()}
              </div>
              <div className="mt-2 text-green-600 cursor-pointer font-semibold">상세보기 &gt;</div>
            </div>
          </div>
        ))}
      </div>
      {showPlaceChange && (
        <>
          {/* 오버레이: 팝업 바깥 클릭 시 닫힘 */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowPlaceChange(false)} />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="bg-white rounded-2xl p-6 w-[340px] max-w-full relative">
              <button className="absolute left-4 top-4 text-2xl" onClick={() => setShowPlaceChange(false)}>←</button>
              <div className="text-center font-bold text-lg mb-6">명소 변경</div>
              <div className="flex items-center mb-4 px-2">
                <input className="flex-1 border-none outline-none bg-transparent" placeholder="검색하기..." />
                <svg className="w-5 h-5 text-gray-400" /* ... */ />
              </div>
              <div className="space-y-4">
                {mockData[activeTab - 1].places.map((place, i) => (
                  <div key={i} className={`rounded-2xl p-4 bg-white flex flex-col relative`}>
                    <div className="font-bold">{place.name}</div>
                    <div className="text-gray-500 text-sm">{icons[place.type as PlaceType]} {place.type} | ₩{place.price.toLocaleString()}</div>
                    <button className="absolute right-4 bottom-4 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow">+</button>
                    <div className="mt-2 text-green-600 cursor-pointer">상세보기 &gt;</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      <Nav />
    </div>
  );
} 