import React from 'react';

interface TripCardProps {
  title: string;
  date: string;
  image: string;
  onClick: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ title, date, image, onClick }) => {
  return (
    <div className="trip-card" onClick={onClick}>
      <div className="trip-image">
        <img src={image} alt={title} />
      </div>
      <div className="trip-info">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-500">{date}</p>
      </div>
    </div>
  );
};

export default TripCard; 