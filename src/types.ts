export interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

export interface RouteSummary {
  totalDistance: number; // in meters
  totalTime: number; // in seconds
}
