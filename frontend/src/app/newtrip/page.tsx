'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import './newtrip.css';
import Header from './components/Header';
import DateSelector from './components/DateSelector';
import RegionSelector from './components/RegionSelector';
import CreateButton from './components/CreateButton';

const NewTrip = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState(21);
  const [endDate, setEndDate] = useState(23);
  const [selectedRegion, setSelectedRegion] = useState('도쿄');

  const goBack = () => {
    router.back();
  };

  return (
    <div className="max-w-[500px] mx-auto bg-white min-h-screen pb-24 relative">
      {/* 헤더 */}
      <Header goBack={goBack} />

      <div className="px-6 space-y-5">
        {/* 시작 일자 선택 */}
        <DateSelector
          type="start"
          selectedDate={startDate}
          setSelectedDate={setStartDate}
        />

        {/* 종료 일자 선택 */}
        <DateSelector
          type="end"
          selectedDate={endDate}
          setSelectedDate={setEndDate}
        />

        {/* 여행 지역 선택 */}
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />

        {/* 일정 생성 버튼 */}
        <CreateButton onClick={() => router.push('/schedule/result')} />
      </div>

      {/* 네비게이션 바 */}
      <Nav />
    </div>
  );
};

export default NewTrip;