import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location, RouteSummary } from '../types';
import RoutingMachine from './RoutingMachine';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  start: Location | null;
  end: Location | null;
  onRouteFound: (summary: RouteSummary) => void;
}

function MapUpdater({ start, end }: { start: Location | null, end: Location | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (start && !end) {
      map.flyTo([start.lat, start.lon], 14);
    } else if (end && !start) {
      map.flyTo([end.lat, end.lon], 14);
    }
  }, [start, end, map]);

  return null;
}

export default function MapComponent({ start, end, onRouteFound }: Props) {
  return (
    <MapContainer center={[21.0285, 105.8542]} zoom={13} className="w-full h-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {start && (
        <Marker position={[start.lat, start.lon]}>
          <Popup>Điểm đi: {start.display_name}</Popup>
        </Marker>
      )}
      
      {end && (
        <Marker position={[end.lat, end.lon]}>
          <Popup>Điểm đến: {end.display_name}</Popup>
        </Marker>
      )}

      <MapUpdater start={start} end={end} />
      
      <RoutingMachine start={start} end={end} onRouteFound={onRouteFound} />
    </MapContainer>
  );
}
