import React from 'react';

interface DateSelectorProps {
  type: 'start' | 'end';
  selectedDate: number;
  setSelectedDate: (date: number) => void;
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dates = [18, 19, 20, 21, 22, 23, 24];

const DateSelector: React.FC<DateSelectorProps> = ({
  type,
  selectedDate,
  setSelectedDate,
}) => {
  return (
    <div className="date-selector bg-gray-50 p-4 rounded-xl">
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          <span className="text-lg mr-2">{type === 'start' ? '✈️' : '🏁'}</span>
          <h2 className="text-base font-medium">{type === 'start' ? '시작 일자' : '종료 일자'}</h2>
        </div>
        <div className="flex items-center ml-auto">
          <button className="w-6 h-6 flex items-center justify-center text-gray-400">&lt;</button>
          <button className="w-6 h-6 flex items-center justify-center text-gray-400 ml-1">&gt;</button>
        </div>
      </div>
      
      {/* 요일 */}
      <div className="day-row grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div key={`${type}-weekday-${index}`} className="text-center text-gray-400 text-sm">
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 */}
      <div className="date-row grid grid-cols-7 gap-2">
        {dates.map((date, index) => (
          <div 
            key={`${type}-date-${index}`}
            className="text-center"
          >
            <div 
              className={`date-circle w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center
                ${date === selectedDate ? 'active-date bg-[#7ED1AA]' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className={`text-lg ${date === selectedDate ? 'text-white' : 'text-gray-700'}`}>{date}</span>
              {date === selectedDate && <span className="text-[10px] text-white">{type === 'start' ? '시작' : '종료'}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DateSelector; 