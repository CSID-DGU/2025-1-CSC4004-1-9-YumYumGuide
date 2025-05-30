import React from 'react';
import { CityIcons } from '../icons';

interface RegionSelectorProps {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

const regions = [
  { id: 'tokyo', name: '도쿄', icon: <CityIcons.Tokyo /> },
  { id: 'kyoto', name: '교토', icon: <CityIcons.Kyoto /> },
  { id: 'hokkaido', name: '홋카이도', icon: <CityIcons.Hokkaido /> },
  { id: 'osaka', name: '오사카', icon: <CityIcons.Osaka /> }
];

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  setSelectedRegion,
}) => {
  return (
    <div>
      <div className="flex items-center mb-5">
        <span className="text-xl mr-3">📍</span>
        <h2 className="text-lg font-semibold">여행 지역</h2>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {regions.map((region) => (
          <div 
            key={region.id}
            onClick={() => setSelectedRegion(region.name)}
            className={`city-container cursor-pointer
              ${selectedRegion === region.name ? 'selected' : ''}`}
          >
            <div className="city-icon">
              {region.icon}
            </div>
            <span className="text-sm font-medium">{region.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionSelector; 