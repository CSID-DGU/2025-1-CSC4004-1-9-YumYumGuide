'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import './newSchedule.css';

const NewSchedule = () => {
  const [budget, setBudget] = useState(1100000);
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>(['규카츠 모토무라 시부야점']);
  const [editingPlaceIndex, setEditingPlaceIndex] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('치요다구');
  const router = useRouter();

  // 팝업에서 선택 가능한 명소 목록 (예시)
  const popupPlaces = [
    { name: '스카이트리', meta: '관광 | ₩14,949' },
    { name: '규카츠 모토무라 시부야점', meta: '맛집 | ₩8,811' },
    { name: '센소지', meta: '관광 | ₩1,980' },
    { name: '도쿄타워', meta: '관광 | ₩13,860' },
    { name: '금각사', meta: '' },
  ];

  const handleAddPlace = (placeName: string) => {
    if (editingPlaceIndex !== null) {
      // Replace existing place
      const newPlaces = [...selectedPlaces];
      newPlaces[editingPlaceIndex] = placeName;
      setSelectedPlaces(newPlaces);
      setEditingPlaceIndex(null);
    } else {
      // Add new place only if under the limit of 5
      if (!selectedPlaces.includes(placeName) && selectedPlaces.length < 5) {
        setSelectedPlaces([...selectedPlaces, placeName]);
      }
    }
    setIsPlacePopupOpen(false);
  };

  const handleEditPlace = (index: number) => {
    setEditingPlaceIndex(index);
    setIsPlacePopupOpen(true);
  };

  return (
    <div className="new-schedule-container">
      <div className="text-center p-6 font-bold text-[24px]">새로운 일정</div>
      <div className="new-schedule-content">
        {/* 시작/종료 날짜 */}
        <div className="date-section-cal">
          <div className="date-block-cal">
            <div className="date-title-cal">
              <img src="/icons/airplane.png" alt="airplane" className="date-icon-cal" />
              <span>시작 일자</span>
            </div>
            <div className="calendar-header-cal">{'< 2025년 4월 21일 >'}</div>
            <table className="calendar-table-cal">
              <thead>
                <tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>
              </thead>
              <tbody>
                <tr><td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
                <tr><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td></tr>
                <tr><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td></tr>
                <tr><td className="calendar-selected-cal">21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td></tr>
                <tr><td>28</td><td>29</td><td>30</td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
          <div className="calendar-divider-cal"></div>
          <div className="date-block-cal">
            <div className="date-title-cal">
              <img src="/icons/comebackhome.png" alt="home" className="date-icon-cal" />
              <span>종료 일자</span>
            </div>
            <div className="calendar-header-cal">{'< 2025년 4월 23일 >'}</div>
            <table className="calendar-table-cal">
              <thead>
                <tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>
              </thead>
              <tbody>
                <tr><td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
                <tr><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td></tr>
                <tr><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td></tr>
                <tr><td>21</td><td>22</td><td className="calendar-selected-cal">23</td><td>24</td><td>25</td><td>26</td><td>27</td></tr>
                <tr><td>28</td><td>29</td><td>30</td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* 여행 지역 */}
        <div className="region-section">
          <div className="region-title">여행 지역</div>
          <div className="region-list">
            <div 
              className={`region-item ${selectedRegion === '치요다구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('치요다구')}
            >치요다구</div>
            <div 
              className={`region-item ${selectedRegion === '주오구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('주오구')}
            >주오구</div>
            <div 
              className={`region-item ${selectedRegion === '미나토구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('미나토구')}
            >미나토구</div>
            <div 
              className={`region-item ${selectedRegion === '신주쿠구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('신주쿠구')}
            >신주쿠구</div>
            <div 
              className={`region-item ${selectedRegion === '분쿄구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('분쿄구')}
            >분쿄구</div>
            <div 
              className={`region-item ${selectedRegion === '다이토구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('다이토구')}
            >다이토구</div>
            <div 
              className={`region-item ${selectedRegion === '스미다구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('스미다구')}
            >스미다구</div>
            <div 
              className={`region-item ${selectedRegion === '고토구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('고토구')}
            >고토구</div>
            <div 
              className={`region-item ${selectedRegion === '시나가와구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('시나가와구')}
            >시나가와구</div>
            <div 
              className={`region-item ${selectedRegion === '메구로구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('메구로구')}
            >메구로구</div>
            <div 
              className={`region-item ${selectedRegion === '오타구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('오타구')}
            >오타구</div>
            <div 
              className={`region-item ${selectedRegion === '세타가야구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('세타가야구')}
            >세타가야구</div>
            <div 
              className={`region-item ${selectedRegion === '시부야구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('시부야구')}
            >시부야구</div>
            <div 
              className={`region-item ${selectedRegion === '나카노구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('나카노구')}
            >나카노구</div>
            <div 
              className={`region-item ${selectedRegion === '스기나미구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('스기나미구')}
            >스기나미구</div>
            <div 
              className={`region-item ${selectedRegion === '도시마구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('도시마구')}
            >도시마구</div>
            <div 
              className={`region-item ${selectedRegion === '키타구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('키타구')}
            >키타구</div>
            <div 
              className={`region-item ${selectedRegion === '아라카와구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('아라카와구')}
            >아라카와구</div>
            <div 
              className={`region-item ${selectedRegion === '이타바시구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('이타바시구')}
            >이타바시구</div>
            <div 
              className={`region-item ${selectedRegion === '네리마구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('네리마구')}
            >네리마구</div>
            <div 
              className={`region-item ${selectedRegion === '아다치구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('아다치구')}
            >아다치구</div>
            <div 
              className={`region-item ${selectedRegion === '카츠시카구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('카츠시카구')}
            >카츠시카구</div>
            <div 
              className={`region-item ${selectedRegion === '에도가와구' ? 'region-selected' : ''}`}
              onClick={() => setSelectedRegion('에도가와구')}
            >에도가와구</div>
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
                onClick={() => handleEditPlace(idx)}
              >
                <span className="place-name">{place}</span>
              </div>
            ))}
            {editingPlaceIndex === null && selectedPlaces.length < 5 && (
              <div className="place-item place-add" onClick={() => setIsPlacePopupOpen(true)}>+</div>
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
            <input className="popup-search" placeholder="검색하기..." />
            <div className="popup-place-list">
              {popupPlaces.map((place) => (
                <div 
                  className={"popup-place-card" + (selectedPlaces.includes(place.name) ? ' selected' : '')} 
                  key={place.name}
                >
                  <div className="popup-place-title">{place.name} {place.meta.includes('추천') && <span className="popup-place-badge">추천</span>}</div>
                  <div className="popup-place-meta">{place.meta}</div>
                  <button className="popup-place-add-btn" onClick={() => handleAddPlace(place.name)}>+</button>
                  <div className="popup-place-detail">상세보기 &gt;</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <Nav />
    </div>
  );
};

export default NewSchedule;