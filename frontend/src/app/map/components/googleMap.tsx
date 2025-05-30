// googleMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '550px',
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
};

interface Props {
  selectedPlaceName: string | null;
  routeToPlaceName: string | null;
  placesForDay?: string[];
}

const GoogleMapComponent: React.FC<Props> = ({
  selectedPlaceName,
  routeToPlaceName,
  placesForDay,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [multiMarkerPositions, setMultiMarkerPositions] = useState<
    { position: google.maps.LatLngLiteral; label: string }[]
  >([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

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
          setMultiMarkerPositions([]);
          if (mapRef.current) {
            mapRef.current.setZoom(14);
            mapRef.current.panTo(coords);
          }
        })
        .catch(console.error);
    }
  }, [selectedPlaceName, isLoaded]);

  useEffect(() => {
    if (placesForDay && isLoaded) {
      const geocodeAll = async () => {
        try {
          const results = await Promise.all(
            placesForDay.map(async (placeName) => {
              const coords = await geocode(placeName);
              return { position: coords, label: placeName };
            })
          );
          setMultiMarkerPositions(results);
          setMarkerPosition(null);
          setDirections(null);
          if (results.length > 0 && mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            results.forEach((marker) => {
              bounds.extend(marker.position);
            });
            mapRef.current.fitBounds(bounds);
          }
        } catch (e) {
          console.error(e);
        }
      };
      geocodeAll();
    }
  }, [placesForDay, isLoaded]);

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
                setMultiMarkerPositions([]);
              } else {
                console.error('길찾기 실패:', status);
              }
            }
          );
        })
        .catch(console.error);
    }
  }, [routeToPlaceName, currentPosition, isLoaded]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
    >
      {markerPosition && <Marker position={markerPosition} />}
      {multiMarkerPositions.map((marker, index) => (
        <React.Fragment key={index}>
          <Marker position={marker.position} />
          <OverlayView
            position={marker.position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                transform: 'translate(-50%, -260%)',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                {marker.label}
              </div>
            </div>
          </OverlayView>
        </React.Fragment>
      ))}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default GoogleMapComponent;