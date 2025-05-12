import React from 'react';
import Image from 'next/image';

type Store = {
  id: number;
  name: string;
  image: string;
};

const defaultStores: Store[] = [
  { id: 1, name: '훼미리 마트', image: '/icons/80x80.svg' },
  { id: 2, name: '세븐일레븐', image: '/icons/80x80.svg' },
];

const StoreList = () => {
  const stores = defaultStores;
  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-2xl font-semibold mb-2">편의점 정보</p>
      {stores.map((store) => (
        <div
          className="flex items-center justify-between bg-white rounded-xl shadow p-3 w-full hover:bg-gray-50 cursor-pointer h-[100px]"
          key={store.id}
        >
          <div className="flex items-center gap-4">
            <Image src={store.image} alt={store.name} width={80} height={80} className="rounded-lg object-cover" />
            <div className="text-base font-medium truncate">{store.name}</div>
          </div>
          <Image src="/icons/arrow.svg" alt="arrow" width={24} height={24} className="mr-2" />
        </div>
      ))}
    </div>
  );
};

export default StoreList;
