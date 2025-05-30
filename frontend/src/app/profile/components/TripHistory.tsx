import React from 'react';
import TripCard from './TripCard';

interface Trip {
  id: string;
  title: string;
  date: string;
  image: string;
}

interface TripHistoryProps {
  trips: Trip[];
  onTripClick: (tripId: string) => void;
}

const TripHistory: React.FC<TripHistoryProps> = ({ trips, onTripClick }) => {
  return (
    <div className="trip-history">
      <h2 className="text-xl font-bold mb-4">나의 여행</h2>
      <div className="trip-list">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            title={trip.title}
            date={trip.date}
            image={trip.image}
            onClick={() => onTripClick(trip.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TripHistory; 