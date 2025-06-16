'use client';
import React, { useState, useRef, useEffect } from 'react';
import Nav from '../../../componets/nav';
import AlertModal from '../../../../components/AlertModal';
import { useQueryScheduleById } from '@/api/schedule';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from '../result.module.css';
import Image from 'next/image';
import { useQueryDetail } from '@/api/detail';

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
  const router = useRouter();
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
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const {
    data: detailData,
    isLoading: detailLoading,
    isError: detailError,
  } = useQueryDetail(selectedItem?.refId || '');

  console.log('scheduleResponse', scheduleResponse);
  // 탭 바 위치 계산
  const tabRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const ref = tabRefs[activeTab - 1].current;
    if (ref) {
      setUnderlineStyle({ left: ref.offsetLeft, width: ref.offsetWidth });
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSchedule();
  }, [params.id]);

  const fetchSchedule = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data.data);
      } else {
        console.error('Failed to fetch schedule');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

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
      handleDeleteEvent(activeTab - 1, deleteIdx);
    }
    setModalOpen(false);
    setDeleteIdx(null);
    setOpenedActionIdx(null);
  };

  const handleDeleteEvent = async (dayIndex: number, eventIndex: number) => {
    try {
      const token = Cookies.get('auth_token');
      console.log('=== Frontend Delete Event Debug ===');
      console.log('Token:', token);

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${id}/days/${dayIndex}/events/${eventIndex}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.log('Delete failed:', errorData);
        alert(`삭제 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('장소 삭제 중 오류가 발생했습니다.');
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 처리
  if (!schedule) {
    return <div className={styles.error}>일정을 찾을 수 없습니다.</div>;
  }

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
              <div
                className="mt-2 text-green-600 cursor-pointer font-semibold"
                onClick={() => {
                  setSelectedItem(item);
                  setDetailViewOpen(true);
                }}
              >
                상세보기 &gt;
              </div>
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
      {detailViewOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailViewOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-[400px] max-h-[80vh] overflow-y-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-medium">상세 정보</h3>
              <button onClick={() => setDetailViewOpen(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <div className="p-4">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : detailError ? (
                <div className="text-red-500 text-center py-4">정보를 불러오는데 실패했습니다.</div>
              ) : (
                <div className="space-y-4">
                  {/* 이미지 */}
                  {detailData &&
                    (detailData.data.type === 'restaurant' ? detailData.data.video : detailData.data.image) && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <img
                          src={detailData.data.type === 'restaurant' ? detailData.data.video : detailData.data.image}
                          alt={`${detailData.data.name} 이미지`}
                          width={400}
                          height={400}
                          className="object-cover"
                        />
                      </div>
                    )}
                  {/* 이름 */}
                  <h4 className="font-medium text-lg break-words w-full">{detailData?.data.name}</h4>
                  {/* 설명 */}
                  <p className="text-gray-600 text-sm break-words w-full">{detailData?.data.description}</p>
                  {/* 키워드 */}
                  <div className="flex flex-wrap gap-2">
                    {detailData?.data.keywords?.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-sm rounded-full text-gray-600">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  {/* 음식점 상세 */}
                  {detailData?.data.type === 'restaurant' && (
                    <>
                      <div className="space-y-2">
                        {/* 영업시간 토글 */}
                        <div>
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setShowHours(!showHours)}
                          >
                            <h5 className="font-medium">영업시간</h5>
                            <span className="text-gray-400">{showHours ? '▼' : '▶'}</span>
                          </div>
                          {showHours && (
                            <p className="text-sm mt-2">
                              <span className="break-words w-[300px] inline-block">
                                {detailData.data.business_hours}
                              </span>
                            </p>
                          )}
                        </div>
                        {/* 예산/전화 */}
                        <p className="text-sm">
                          <span className="font-medium">예산:</span>{' '}
                          <span className="break-words w-[300px] inline-block">{detailData.data.budget}</span>
                        </p>
                        {detailData.data.tel && (
                          <p className="text-sm">
                            <span className="font-medium">전화:</span>{' '}
                            <span className="break-words w-[300px] inline-block">{detailData.data.tel}</span>
                          </p>
                        )}
                      </div>
                      {/* 메뉴 토글 */}
                      {detailData.data.menus && detailData.data.menus.length > 0 && (
                        <div className="mt-4">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setShowMenu(!showMenu)}
                          >
                            <h5 className="font-medium">메뉴</h5>
                            <span className="text-gray-400">{showMenu ? '▼' : '▶'}</span>
                          </div>
                          {showMenu && (
                            <div className="mt-2 max-h-[200px] overflow-y-auto pr-2">
                              {detailData.data.menus.map((menuItem: any) => (
                                <div
                                  key={menuItem._id}
                                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                                >
                                  <span className="text-gray-900 break-words w-[200px]">{menuItem.menu}</span>
                                  <span className="text-gray-600 ml-2">¥{menuItem.price.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Nav />
    </div>
  );
}
