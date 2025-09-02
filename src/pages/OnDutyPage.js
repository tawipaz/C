// src/pages/OnDutyPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { ArrowLeft, Siren, Shield, ShieldCheck, ShieldX, MapPin } from 'lucide-react';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';

// --- Helper Functions ---

// Haversine distance formula to calculate distance between two lat/lon points in meters
const getDistance = (pos1, pos2) => {
  const R = 6371e3; // metres
  const φ1 = pos1.lat * Math.PI / 180; // φ, λ in radians
  const φ2 = pos2.lat * Math.PI / 180;
  const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
  const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

// --- Custom Icon Components ---

const createIcon = (IconComponent, colorClass) => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className={`p-2 rounded-full shadow-lg ${colorClass}`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
    ),
    className: 'bg-transparent border-0',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const icons = {
  checked: createIcon(ShieldCheck, 'bg-green-500'),
  unchecked: createIcon(Shield, 'bg-blue-500'),
  too_far: createIcon(ShieldX, 'bg-slate-400'),
  user: L.divIcon({
    html: ReactDOMServer.renderToString(
        <MapPin className="w-8 h-8 text-red-600" fill="#dc2626" />
    ),
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
};

// --- Mock Data ---

const initialCheckpoints = [
  { id: 1, name: 'จุดตรวจ ประตู 1', position: { lat: 13.8150, lng: 100.5746 } },
  { id: 2, name: 'จุดตรวจ อาคาร A', position: { lat: 13.8133, lng: 100.5745 } },
  { id: 3, name: 'จุดตรวจ ลานจอดรถ', position: { lat: 13.8120, lng: 100.5742 } },
  { id: 4, name: 'จุดตรวจ คลังพัสดุ', position: { lat: 13.8125, lng: 100.5748 } },
];

const areaOfResponsibility = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [[
      [100.57456389344763, 13.815525173156669],
      [100.57447044838288, 13.813326697354299],
      [100.57442015030517, 13.812038032093449],
      [100.5741773844628, 13.81188700722482],
      [100.57467050258525, 13.810476209195874],
      [100.57483740410827, 13.812550042505428],
      [100.5750763767396, 13.81508797684313],
      [100.5746022247016, 13.816996013762614],
      [100.57456389344763, 13.815525173156669] // Close the polygon
    ]]
  }
};

const areaStyle = { fillColor: "#3b82f6", fillOpacity: 0.1, color: "#1e40af", weight: 1 };

// --- Main Component ---

const OnDutyPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [checkpoints, setCheckpoints] = useState(() => 
    initialCheckpoints.map(p => ({ ...p, status: 'too_far' }))
  );

  // Update checkpoint statuses based on user location
  useEffect(() => {
    if (!userLocation) return;

    setCheckpoints(prevCheckpoints =>
      prevCheckpoints.map(point => {
        if (point.status === 'checked') return point; // Don't change already checked points
        
        const distance = getDistance(userLocation, point.position);
        const newStatus = distance <= 50 ? 'unchecked' : 'too_far';
        
        return { ...point, status: newStatus, distance: Math.round(distance) };
      })
    );
  }, [userLocation]);

  // Get user's real-time location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleCheckIn = (pointId) => {
    setCheckpoints(prev =>
      prev.map(p => (p.id === pointId ? { ...p, status: 'checked' } : p))
    );
  };

  const handleGoBack = () => window.history.back();
  const handleSOS = () => alert("ส่งคำขอความช่วยเหลือฉุกเฉินแล้ว! เจ้าหน้าที่กำลังไปที่ตำแหน่งของคุณ");

  return (
    <div className="fixed inset-0 bg-white z-[1000]">
      <header className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-[1001]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">หน้าสำหรับเจ้าหน้าที่เข้าเวร</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="pt-[70px] h-full">
        <MapContainer center={{ lat: 13.813, lng: 100.5745 }} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <GeoJSON data={areaOfResponsibility} style={areaStyle} />

          {userLocation && <Marker position={userLocation} icon={icons.user} />}

          {checkpoints.map(point => (
            <Marker key={point.id} position={point.position} icon={icons[point.status]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">{point.name}</h3>
                  <p>สถานะ: {
                    { checked: 'ตรวจแล้ว', unchecked: 'ยังไม่ตรวจ', too_far: 'อยู่ไกลเกินไป' }[point.status]
                  }</p>
                  {point.distance !== undefined && <p>ระยะห่าง: {point.distance} เมตร</p>}
                  {point.status === 'unchecked' && (
                    <button 
                      onClick={() => handleCheckIn(point.id)}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    >
                      ยืนยันการตรวจ
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001]">
        <button 
          onClick={handleSOS}
          className="flex flex-col items-center justify-center w-20 h-20 bg-red-600 text-white rounded-full shadow-2xl transform active:scale-90 transition-transform duration-200 animate-pulse"
        >
          <Siren className="w-8 h-8" />
          <span className="text-sm font-bold mt-1">SOS</span>
        </button>
      </div>
    </div>
  );
};

export default OnDutyPage;