// app/components/googleMap.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '550px',
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780,
};

interface Props {
  selectedPlaceName: string | null;
  routeToPlaceName: string | null;
}

const GoogleMapComponent: React.FC<Props> = ({
  selectedPlaceName,
  routeToPlaceName,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'], // 필요 시 directions, places 등 명시
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);

  const geocode = (placeName: string): Promise<google.maps.LatLngLiteral> => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: placeName }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject(`Geocode failed for "${placeName}": ${status}`);
        }
      });
    });
  };

  useEffect(() => {
    if (!isLoaded) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setCurrentPosition(coords);
      setCenter(coords);
    });
  }, [isLoaded]);

  useEffect(() => {
    if (selectedPlaceName && isLoaded) {
      geocode(selectedPlaceName)
        .then((coords) => {
          setMarkerPosition(coords);
          setCenter(coords);
          setDirections(null);
        })
        .catch(console.error);
    }
  }, [selectedPlaceName, isLoaded]);

  useEffect(() => {
    if (routeToPlaceName && currentPosition && isLoaded) {
      geocode(routeToPlaceName)
        .then((destCoords) => {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: currentPosition,
              destination: destCoords,
              travelMode: google.maps.TravelMode.TRANSIT,
            },
            (result, status) => {
              if (status === 'OK' && result) {
                setDirections(result);
                setMarkerPosition(null);
              } else {
                console.error('길찾기 실패:', status);
              }
            }
          );
        })
        .catch(console.error);
    }
  }, [routeToPlaceName, currentPosition, isLoaded]);

  if (!isLoaded) return <div>Loading map...</div>; // ✅ 실제 로딩 중 표시

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
      {markerPosition && <Marker position={markerPosition} />}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default GoogleMapComponent;