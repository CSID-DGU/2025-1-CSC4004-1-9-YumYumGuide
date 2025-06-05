'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSearchPlaces } from '@/api/search';
import { useQueryDetail } from '../../api/detail';
import { useInView } from 'react-intersection-observer';

interface PlaceSearchPopupProps {
  onClose: () => void;
  onSelectPlace: (placeName: string) => void;
  existingSelectedPlaces: string[];
  isOpen: boolean;
  selectedRegions: string[];
}

function DetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading, isError } = useQueryDetail(id);
  const [showMenu, setShowMenu] = useState(false);
  const [showHours, setShowHours] = useState(false);

  if (!id) return null;

  const imageUrl = data?.data.type === 'restaurant' ? data.data.video : data?.data.image;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[400px] max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-medium">상세 정보</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-4">정보를 불러오는데 실패했습니다.</div>
          ) : (
            <div className="space-y-4">
              {imageUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image src={imageUrl} alt={`${data.data.name} 이미지`} fill className="object-cover" />
                </div>
              )}
              <h4 className="font-medium text-lg break-words w-full">{data?.data.name}</h4>
              <p className="text-gray-600 text-sm break-words w-full">{data?.data.description}</p>
              <div className="flex flex-wrap gap-2">
                {data?.data.keywords?.map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-sm rounded-full text-gray-600">
                    {keyword}
                  </span>
                ))}
              </div>
              {data?.data.type === 'restaurant' && (
                <>
                  <div className="space-y-2">
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
                          <span className="break-words w-[300px] inline-block">{data.data.business_hours}</span>
                        </p>
                      )}
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">예산:</span>{' '}
                      <span className="break-words w-[300px] inline-block">{data.data.budget}</span>
                    </p>
                    {data.data.tel && (
                      <p className="text-sm">
                        <span className="font-medium">전화:</span>{' '}
                        <span className="break-words w-[300px] inline-block">{data.data.tel}</span>
                      </p>
                    )}
                  </div>
                  {data.data.menus && data.data.menus.length > 0 && (
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
                          {data.data.menus.map((menuItem) => (
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
  );
}

export default function PlaceSearchPopup({
  onClose,
  onSelectPlace,
  existingSelectedPlaces,
  isOpen,
  selectedRegions,
}: PlaceSearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { ref: lastPlaceElementRef, inView } = useInView();

  // 디바운스된 검색어 상태 추가
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 선택된 지역 가져오기
  const getLocationInEnglish = (koreanLocation: string) => {
    const locationMap: { [key: string]: string } = {
      // 도쿄 지역
      고탄다: 'gotanda',
      긴자: 'ginza',
      나카메: 'nakame',
      니혼바시: 'nihonbashi',
      '도쿄역 주변': 'tokyo-station',
      마루노우치: 'marunouchi',
      메구로: 'meguro',
      시부야: 'shibuya',
      신바시: 'shinbashi',
      신주쿠: 'shinjuku',
      아사쿠사: 'asakusa',
      아키하바라: 'akihabara',
      에비스: 'ebisu',
      우에노: 'ueno',
      유라쿠초: 'yurakucho',
      이케부코로: 'ikebukuro',
      칸다: 'kanda',
      '타마 치': 'tamachi',
      '하마 마츠': 'hamamatsu',
    };
    return locationMap[koreanLocation] || koreanLocation.toLowerCase();
  };

  const searchLocation = selectedRegions.length > 0 ? getLocationInEnglish(selectedRegions[0]) : '';

  // 검색 쿼리 실행
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useSearchPlaces(
    {
      query: debouncedQuery,
      location: searchLocation,
      pageSize: 10,
    },
    debouncedQuery.length > 0 && !!searchLocation,
  );
  console.log('data', data);
  // 무한 스크롤을 위한 인터섹션 옵저버 처리
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 모든 검색 결과를 하나의 배열로 합치기
  const allSearchResults = data?.pages.flatMap((page) => page.data.paginatedResults) ?? [];

  // ESC 키 처리
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Popup */}
      <div
        ref={popupRef}
        className="relative w-[480px] mx-auto mt-4 bg-white rounded-2xl shadow-xl"
        style={{
          height: 'min(640px, 85vh)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Image src="/icons/search.png" alt="Search" width={20} height={20} className="text-gray-400" />
            </div>
            <input
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              placeholder="이자카야, 우동, 라멘..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 hide-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-red-500">오류가 발생했습니다: {error?.message}</div>
          ) : allSearchResults.length > 0 ? (
            <div className="space-y-4 pt-4">
              {allSearchResults.map((place, index) => {
                const isLastElement = index === allSearchResults.length - 1;
                const isSelected = existingSelectedPlaces.includes(place.title);

                return (
                  <div
                    key={place._id}
                    ref={isLastElement ? lastPlaceElementRef : null}
                    className={`p-4 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {place.image ? (
                          <Image src={place.image} alt={`${place.title} 이미지`} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image
                              src="/icons/location.png"
                              alt="No image"
                              width={24}
                              height={24}
                              className="opacity-30"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 truncate pr-4">{place.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {place.type === '음식점' && (
                                <span className="inline-block px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
                                  맛집
                                </span>
                              )}
                              {place.score > 5 && (
                                <span className="inline-block px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
                                  인기
                                </span>
                              )}
                            </div>
                            {place.description && (
                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {place.description.split(',').map((item, i) => (
                                  <span key={i} className="after:content-[','] after:mr-1 last:after:content-none">
                                    {item.trim()}
                                  </span>
                                ))}
                              </p>
                            )}
                            <button
                              onClick={() => setSelectedDetailId(place._id)}
                              className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                            >
                              상세보기 &gt;
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlace(place.title);
                            }}
                            className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                              isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? '✓' : '+ '}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isFetchingNextPage && <div className="py-4 text-center text-gray-500">더 불러오는 중...</div>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              {searchQuery ? (
                <p>검색 결과가 없습니다</p>
              ) : (
                <>
                  <Image src="/icons/search.png" alt="Search" width={40} height={40} className="mb-3 opacity-40" />
                  <p>검색어를 입력해주세요</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetailId && <DetailModal id={selectedDetailId} onClose={() => setSelectedDetailId(null)} />}
    </div>
  );
}
