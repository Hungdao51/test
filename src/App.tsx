/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Location, RouteSummary } from './types';
import SearchBox from './components/SearchBox';
import MapComponent from './components/MapComponent';
import { Navigation, Map as MapIcon, Clock, Route, Crosshair } from 'lucide-react';

export default function App() {
  const [start, setStart] = useState<Location | null>(null);
  const [end, setEnd] = useState<Location | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);

  // Reset summary when endpoints change
  useEffect(() => {
    setRouteSummary(null);
  }, [start, end]);

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} giờ ${m} phút`;
    return `${m} phút`;
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding to get address name
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            setStart({
              lat: latitude,
              lon: longitude,
              display_name: data.display_name || "Vị trí của bạn"
            });
          } catch (error) {
            setStart({
              lat: latitude,
              lon: longitude,
              display_name: "Vị trí của bạn"
            });
          }
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Không thể lấy vị trí của bạn. Vui lòng cấp quyền truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Geolocation.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-96 bg-white shadow-xl z-10 flex flex-col h-auto md:h-full">
        <div className="p-6 bg-blue-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <MapIcon className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">Bản đồ & Chỉ đường</h1>
          </div>
          <p className="text-blue-100 text-sm">Tìm kiếm địa điểm và tính khoảng cách</p>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đi</label>
              <div className="flex gap-2">
                <SearchBox 
                  placeholder="Nhập vị trí bắt đầu..." 
                  value={start} 
                  onSelect={setStart} 
                />
                <button 
                  onClick={handleGetCurrentLocation}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Sử dụng vị trí hiện tại"
                >
                  <Crosshair className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đến</label>
              <SearchBox 
                placeholder="Nhập vị trí kết thúc..." 
                value={end} 
                onSelect={setEnd} 
              />
            </div>
          </div>

          {routeSummary && (
            <div className="mt-4 p-5 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Thông tin tuyến đường
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Route className="w-4 h-4" />
                    <span>Khoảng cách:</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {formatDistance(routeSummary.totalDistance)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Thời gian dự kiến:</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {formatTime(routeSummary.totalTime)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!routeSummary && start && end && (
            <div className="mt-4 p-4 text-center text-gray-500 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p>Đang tính toán tuyến đường...</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-[50vh] md:h-full">
        <MapComponent start={start} end={end} onRouteFound={setRouteSummary} />
      </div>
    </div>
  );
}
