'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '550px' };
const defaultCenter = { lat: 37.5665, lng: 126.978 };

interface LatLng { lat: number; lng: number; }
interface PlaceInfo { name: string; address: string; }
interface Props {
  selectedPlaceName: string | null;
  routeToPlace: PlaceInfo | null;
  placesForDay?: PlaceInfo[];
  customRoute?: { from: PlaceInfo; to: PlaceInfo } | null;
}

const jitter = () => (Math.random() - 0.5) * 0.008;

const GoogleMapComponent: React.FC<Props> = ({
  selectedPlaceName,
  routeToPlace,
  placesForDay,
  customRoute,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const [center, setCenter] = useState<LatLng>(defaultCenter);
  const [markerPos, setMarkerPos] = useState<LatLng | null>(null);
  const [multiMarkers, setMarkers] = useState<{ position: LatLng; label: string }[]>([]);
  const [coordsMap, setCoordsMap] = useState<Record<string, LatLng>>({});
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [posMe, setPosMe] = useState<LatLng | null>(null);

  const fallbackRef = useRef<LatLng>({ lat: 35.6895, lng: 139.6917 });
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = (m: google.maps.Map) => {
    mapRef.current = m;
  };

  const inTokyo = (c: LatLng) => {
    const bounds = new window.google.maps.LatLngBounds(
      { lat: 35.52, lng: 139.55 },
      { lat: 35.93, lng: 139.96 }
    );
    return bounds.contains(new window.google.maps.LatLng(c.lat, c.lng));
  };

  const centroid = (pts: LatLng[]): LatLng => {
    const sum = pts.reduce((a, p) => ({ lat: a.lat + p.lat, lng: a.lng + p.lng }), { lat: 0, lng: 0 });
    return { lat: sum.lat / pts.length, lng: sum.lng / pts.length };
  };

  const geocode = (addr: string): Promise<LatLng> => new Promise((resolve) => {
    const g = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds(
      { lat: 35.52, lng: 139.55 },
      { lat: 35.93, lng: 139.96 }
    );
    g.geocode({ address: addr, bounds, region: 'jp' }, (r, s) => {
      if (s === 'OK' && r?.[0]) {
        const l = r[0].geometry.location;
        const c = { lat: l.lat(), lng: l.lng() };
        resolve(inTokyo(c) ? c : fallbackRef.current);
      } else {
        resolve(fallbackRef.current);
      }
    });
  });

  useEffect(() => {
    if (!isLoaded) return;
    navigator.geolocation.getCurrentPosition((p) => {
      const c = { lat: p.coords.latitude, lng: p.coords.longitude };
      setPosMe(c);
      setCenter(c);
    });
  }, [isLoaded]);

  const dayKey = useMemo(() => (placesForDay ?? []).map((p) => p.name).join(','), [placesForDay]);
  useEffect(() => {
    if (!isLoaded || !placesForDay) return;
    (async () => {
      const valids: LatLng[] = [];
      const tmpCoords: Record<string, LatLng> = {};
      const raws = await Promise.all(
        placesForDay.map(async (p) => ({ name: p.name, coord: await geocode(p.address) }))
      );
      raws.forEach(({ coord }) => { if (inTokyo(coord)) valids.push(coord); });
      const base = valids.length ? centroid(valids) : fallbackRef.current;
      fallbackRef.current = base;
      const mkrs: { position: LatLng; label: string }[] = [];
      raws.forEach(({ name, coord }) => {
        let final = coord;
        if (!inTokyo(coord)) {
          if (valids.length) {
            const near = valids[Math.floor(Math.random() * valids.length)];
            final = { lat: near.lat + jitter(), lng: near.lng + jitter() };
          } else return;
        }
        tmpCoords[name] = final;
        mkrs.push({ position: final, label: name });
      });
      setCoordsMap(tmpCoords);
      setMarkers(mkrs);
      setMarkerPos(null);
      setDirections(null);
      if (mkrs.length && mapRef.current) {
        const b = new window.google.maps.LatLngBounds();
        mkrs.forEach((m) => b.extend(m.position));
        mapRef.current.fitBounds(b);
      }
    })();
  }, [isLoaded, dayKey]);

  useEffect(() => {
    if (!isLoaded || !selectedPlaceName) return;
    const coord = coordsMap[selectedPlaceName];
    if (coord) {
      setMarkerPos(coord);
      setCenter(coord);
      setDirections(null);
      setMarkers([]);
      mapRef.current?.panTo(coord);
      mapRef.current?.setZoom(14);
    }
  }, [selectedPlaceName, coordsMap, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !posMe || !routeToPlace) return;
    const dest = coordsMap[routeToPlace.name];
    if (!dest) return;
    const dir = new window.google.maps.DirectionsService();
    dir.route(
      { origin: posMe, destination: dest, travelMode: google.maps.TravelMode.WALKING },
      (r, s) => { if (s === 'OK' && r) { setDirections(r); setMarkerPos(null); setMarkers([]); } }
    );
  }, [routeToPlace, posMe, coordsMap, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !customRoute) return;
    const o = coordsMap[customRoute.from.name];
    const d = coordsMap[customRoute.to.name];
    if (!o || !d) return;
    const dir = new window.google.maps.DirectionsService();
    dir.route(
      { origin: o, destination: d, travelMode: google.maps.TravelMode.WALKING },
      (r, s) => { if (s === 'OK' && r) { setDirections(r); setMarkerPos(null); setMarkers([]); } }
    );
  }, [customRoute, coordsMap, isLoaded]);

  if (!isLoaded) return <div>Loading map…</div>;
  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14} onLoad={onLoad}>
      {markerPos && <Marker position={markerPos} />}

      {!selectedPlaceName && multiMarkers.map((m, i) => (
        <React.Fragment key={i}>
          <Marker position={m.position} />
          <OverlayView
            position={m.position}
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
                {m.label}
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