'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ConvenienceList from './ConvenienceList';

type Store = {
  id: number;
  name: string;
  image: string;
  storeTypeIdentifier: 'FamilyMart' | 'SevenEleven' | 'Lawson' | string;
};

const defaultStores: Store[] = [
  { id: 1, name: '훼미리 마트', image: '/icons/familymart.svg', storeTypeIdentifier: 'familymart' },
  { id: 2, name: '세븐일레븐', image: '/icons/seveneleven.svg', storeTypeIdentifier: 'seveneleven' },
  { id: 3, name: '로손', image: '/icons/lawson.svg', storeTypeIdentifier: 'lawson' },
];

const StoreList = () => {
  const stores = defaultStores;
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const handleStoreClick = (storeType: string) => {
    setSelectedStore(storeType);
  };

  const handleCloseConvenienceList = () => {
    setSelectedStore(null);
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full mb-8">
        <p className="text-2xl font-semibold mb-2">편의점 정보</p>
        {stores.map((store) => (
          <div
            className="flex items-center justify-between bg-white rounded-xl shadow p-3 w-full hover:bg-gray-50 cursor-pointer h-[100px]"
            key={store.id}
            onClick={() => handleStoreClick(store.storeTypeIdentifier)}
          >
            <div className="flex items-center gap-4">
              <Image src={store.image} alt={store.name} width={60} height={60} className="rounded-lg object-cover" />
              <div className="text-base font-medium truncate">{store.name}</div>
            </div>
            <Image src="/icons/arrow.svg" alt="arrow" width={24} height={24} className="mr-2" />
          </div>
        ))}
      </div>

      {selectedStore && (
        <ConvenienceList
          storeType={selectedStore}
          onClose={handleCloseConvenienceList}
        />
      )}
    </>
  );
};

export default StoreList;
