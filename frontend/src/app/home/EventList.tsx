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
    <div className="flex flex-col gap-3 w-full max-w-full">
      {events.map((event) => (
        <div
          className="flex items-center gap-4 bg-white rounded-xl shadow p-3 w-full max-w-full h-[100px]"
          key={event.id}
        >
          <Image src="/icons/80x80.svg" alt={event.title} width={80} height={80} className="rounded-lg object-cover" />
          <div className="text-base font-medium truncate">{event.title}</div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
