import React from 'react';
import Image from 'next/image';

type Event = {
  id: number;
  title: string;
  image: string;
};

const defaultEvents: Event[] = [
  { id: 1, title: '우에노 벚꽃 축제', image: '' },
  { id: 2, title: '지요다 벚꽃 축제', image: '' },
];

const EventList = () => {
  const events = defaultEvents;
  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-2xl font-semibold mb-2">현재 이벤트</p>
      {events.map((event) => (
        <div
          className="flex items-center justify-between bg-white rounded-xl shadow p-3 w-full hover:bg-gray-50 cursor-pointer h-[100px]"
          key={event.id}
        >
          <div className="flex items-center gap-4">
            <Image
              src="/icons/80x80.svg"
              alt={event.title}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="text-base font-medium truncate">{event.title}</div>
          </div>
          <Image src="/icons/arrow.svg" alt="arrow" width={24} height={24} className="mr-2" />
        </div>
      ))}
    </div>
  );
};

export default EventList;
