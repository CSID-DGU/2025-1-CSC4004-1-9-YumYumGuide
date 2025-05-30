'use client';
import React, { useState } from 'react';
import Navbar from '../componets/nav';
import './schedule.css';
import CustomCalender from './CustomCalender';
import PlanList from './PlanList';
import ScheduelHeader from './ScheduleHeader';

export default function SchedulePage() {
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});

  const handleDateSelect = (startDate: string, endDate: string) => {
    setDateRange({ ...{ startDate, endDate } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20 max-w-[500px] mx-auto px-2.5">
      <ScheduelHeader />
      <CustomCalender onDateSelect={handleDateSelect} />
      <PlanList dateRange={dateRange} />
      <Navbar />
    </div>
  );
}
