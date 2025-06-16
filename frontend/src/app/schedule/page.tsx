'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../componets/nav';
import './schedule.css';
import CustomCalender from './CustomCalender';
import PlanList from './PlanList';
import ScheduelHeader from './ScheduleHeader';
import { useQuerySchedule } from '@/api/schedule';

export default function SchedulePage() {
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [scheduleDates, setScheduleDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data } = useQuerySchedule(dateRange);

  useEffect(() => {
    if (data?.data) {
      const newScheduleDates = data.data.flatMap(schedule =>
        schedule.days.map(day => {
          const dateObj = new Date(day.date);
          const kstDate = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
          const yyyy = kstDate.getFullYear();
          const mm = String(kstDate.getMonth() + 1).padStart(2, '0');
          const dd = String(kstDate.getDate()).padStart(2, '0');
          return `${yyyy}${mm}${dd}`;
        })
      );
      setScheduleDates(newScheduleDates);
    }
  }, [data]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20 max-w-[500px] mx-auto px-2.5">
      <ScheduelHeader />
      <CustomCalender onDateSelect={handleDateSelect} scheduleDates={scheduleDates} />
      <PlanList dateRange={dateRange} selectedDate={selectedDate} />
      <Navbar />
    </div>
  );
}
