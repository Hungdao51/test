import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Location, RouteSummary } from '../types';

interface Props {
  start: Location | null;
  end: Location | null;
  onRouteFound: (summary: RouteSummary) => void;
}

export default function RoutingMachine({ start, end, onRouteFound }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    // @ts-ignore
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lon),
        L.latLng(end.lat, end.lon)
      ],
      routeWhileDragging: false,
      show: false, // Hide default UI
      addWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      createMarker: function() { return null; } // We will draw our own markers
    } as any).addTo(map);

    routingControl.on('routesfound', function(e: any) {
      const routes = e.routes;
      const summary = routes[0].summary;
      onRouteFound({
        totalDistance: summary.totalDistance,
        totalTime: summary.totalTime
      });
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end, onRouteFound]);

  return null;
}
