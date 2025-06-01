'use client';
import React, { useState, useRef, useEffect } from 'react';
import Nav from '../../../componets/nav';
import AlertModal from '../../../../components/AlertModal';
import { useQueryScheduleById } from '@/api/schedule';
import { useParams } from 'next/navigation';

// 타입 정의
type PlaceType = 'attraction' | 'meal';

const icons: Record<PlaceType, string> = {
  attraction: '🏛️',
  meal: '🍜',
};

const categories = [
  { key: 'attraction', icon: '🏛️' },
  { key: 'meal', icon: '🍜' },
];

export default function ScheduleResult() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading } = useQueryScheduleById(id);
  const [activeTab, setActiveTab] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popupTop, setPopupTop] = useState(0);
  const [popupLeft, setPopupLeft] = useState(0);
  const [openedActionIdx, setOpenedActionIdx] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  console.log(scheduleResponse);
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
      const popupWidth = 180;
      let left = btnRect.left - containerRect.left;
      if (left + popupWidth > containerRect.width) {
        left = containerRect.width - popupWidth - 8;
      }
      setPopupLeft(left);
      setPopupTop(btnRect.bottom - containerRect.top + 10);
    }
    setFilterOpen(!filterOpen);
  };

  const handleDelete = () => {
    if (deleteIdx !== null) {
      // TODO: API 호출로 삭제 구현
      console.log('Delete event at index:', deleteIdx);
    }
    setModalOpen(false);
    setDeleteIdx(null);
    setOpenedActionIdx(null);
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafbfa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 처리
  if (!scheduleResponse?.data) {
    return (
      <div className="min-h-screen bg-[#fafbfa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">일정을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const schedule = scheduleResponse.data;
  const currentDay = schedule.days[activeTab - 1];

  // 필터링된 데이터
  const filteredData = activeFilters.length
    ? currentDay.events.filter((p) => activeFilters.includes(p.type))
    : currentDay.events;

  return (
    <div ref={containerRef} className="schedule-result-container relative min-h-screen bg-[#fafbfa] pb-24">
      <div className="text-center p-6 font-bold text-[24px]">일정 생성 결과</div>
      {/* 탭 */}
      <div className="flex justify-center gap-8 mb-4 relative" style={{ height: 40 }}>
        {schedule.days.map((day, idx) => (
          <div
            key={day.day}
            ref={tabRefs[idx]}
            className={`cursor-pointer pb-1 text-lg font-semibold ${
              activeTab === day.day ? 'text-green-600' : 'text-gray-700'
            }`}
            onClick={() => setActiveTab(day.day)}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {day.day}일차
          </div>
        ))}
        {/* 밑줄 바 */}
        <div
          className="absolute bottom-0 h-1 bg-green-500 rounded transition-all duration-200"
          style={{ left: underlineStyle.left, width: underlineStyle.width }}
        />
      </div>
      {/* 요약 바 중앙 정렬 */}
      <div className="flex justify-center mb-4 px-[30px]">
        <div className="flex items-center gap-2 bg-white rounded-full px-6 py-2 shadow">
          <span>🏛️x{currentDay.events.filter((p) => p.type === 'attraction').length}</span>
          <span>🍜x{currentDay.events.filter((p) => p.type === 'meal').length}</span>
          <span className="ml-2 font-semibold">₩{currentDay.totalBudget.toLocaleString()}</span>
        </div>
      </div>
      {/* 필터 팝업 */}
      {filterOpen && (
        <>
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
                  setActiveFilters((filters) =>
                    filters.includes(cat.key) ? filters.filter((f) => f !== cat.key) : [...filters, cat.key],
                  )
                }
              >
                <span className="text-xl w-5 mr-2">{activeFilters.includes(cat.key) ? '✓' : ''}</span>
                <span className="text-xl mr-2">{cat.icon}</span>
                <span className="font-semibold">{cat.key === 'attraction' ? '관광' : '맛집'}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {/* 리스트 헤더 + 필터 버튼 */}
      <div className="flex items-center justify-between px-[30px] mt-4 mb-2 text-gray-400 text-sm">
        <div className="flex items-center">
          <div className="w-10">순서</div>
          <div className="h-5 w-px bg-gray-200 mx-2" />
          <div>장소</div>
        </div>
        <div className="flex gap-2">
          <button
            ref={filterBtnRef}
            className="w-10 h-10 flex items-center justify-center text-2xl"
            onClick={handleFilterBtnClick}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-filter"
            >
              <polygon points="22 3 2 3 10 14 10 21 14 21 14 14 22 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
      {/* 일정 카드 리스트 */}
      <div className="px-[30px]">
        {filteredData.map((item, idx) => (
          <div key={item.refId} className="flex items-start mb-4">
            {/* 순서 번호 */}
            <div className="w-8 flex-shrink-0 flex items-center justify-center text-lg font-bold text-gray-500 pt-2">
              {idx + 1}
            </div>
            {/* 카드 */}
            <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col relative ml-4">
              <div
                className="absolute top-4 right-4 text-2xl text-gray-300 cursor-pointer"
                onClick={() => setOpenedActionIdx(idx)}
              >
                ⋮
              </div>
              {openedActionIdx === idx && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenedActionIdx(null)} />
                  <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg z-50 w-24">
                    <button
                      className="w-full py-2 hover:bg-gray-100"
                      onClick={() => {
                        setModalOpen(true);
                        setDeleteIdx(idx);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
              <div className="font-bold text-lg">{item.name}</div>
              <div className="text-gray-500 text-sm mt-1">
                {icons[item.type]} {item.type === 'attraction' ? '관광' : '맛집'} | ₩
                {item.budget?.toLocaleString() || '-'}
              </div>
              <div className="mt-2 text-green-600 cursor-pointer font-semibold">상세보기 &gt;</div>
            </div>
          </div>
        ))}
      </div>
      <AlertModal
        open={modalOpen}
        type="confirm"
        icon={<span className="text-3xl">⚠️</span>}
        title="정말 삭제하시겠습니까?"
        message="이 일정을 삭제하면 복구할 수 없습니다."
        confirmText="예"
        cancelText="아니오"
        onConfirm={handleDelete}
        onCancel={() => setModalOpen(false)}
      />
      <Nav />
    </div>
  );
}
