'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import './newSchedule.css';

const NewSchedule = () => {
  const [budget, setBudget] = useState(1100000);

  return (
    <div className="new-schedule-container">
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
            <div className="region-item region-selected">치요다구</div>
            <div className="region-item">주오구</div>
            <div className="region-item">미나토구</div>
            <div className="region-item">신주쿠구</div>
            <div className="region-item">분쿄구</div>
            <div className="region-item">다이토구</div>
            <div className="region-item">스미다구</div>
            <div className="region-item">고토구</div>
            <div className="region-item">시나가와구</div>
            <div className="region-item">메구로구</div>
            <div className="region-item">오타구</div>
            <div className="region-item">세타가야구</div>
            <div className="region-item">시부야구</div>
            <div className="region-item">나카노구</div>
            <div className="region-item">스기나미구</div>
            <div className="region-item">도시마구</div>
            <div className="region-item">키타구</div>
            <div className="region-item">아라카와구</div>
            <div className="region-item">이타바시구</div>
            <div className="region-item">네리마구</div>
            <div className="region-item">아다치구</div>
            <div className="region-item">카츠시카구</div>
            <div className="region-item">에도가와구</div>
          </div>
        </div>
        {/* 가고 싶은 명소 */}
        <div className="place-section">
          <div className="place-title">꼭 가고 싶은 명소</div>
          <div className="place-list">
            <div className="place-item place-selected">
              <span className="place-name">규카츠 모토무라 시부야점</span>
              <img src="/icons/BackArrow.png" alt="place" />
            </div>
            <div className="place-item place-add">+</div>
            <div className="place-item place-add">+</div>
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
        <button className="create-schedule-btn">일정 생성하기</button>
      </div>
      <Nav />
    </div>
  );
};

export default NewSchedule;