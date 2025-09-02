// src/pages/OnDutyPage.js
import React, { useState, useEffect, useCallback, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle } from 'react-leaflet';
import { ArrowLeft, Siren, Shield, ShieldCheck, ShieldX, MapPin, Map as MapIcon, X } from 'lucide-react';
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
  { id: 1, name: 'จุดตรวจ 1', position: { lat: 13.815525, lng: 100.574563 } },
  { id: 2, name: 'จุดตรวจ 2', position: { lat: 13.813326, lng: 100.574470 } },
  { id: 3, name: 'จุดตรวจ 3', position: { lat: 13.812038, lng: 100.574420 } },
  { id: 4, name: 'จุดตรวจ 4', position: { lat: 13.811887, lng: 100.574177 } },
  { id: 5, name: 'จุดตรวจ 5', position: { lat: 13.810476, lng: 100.574670 } },
  { id: 6, name: 'จุดตรวจ 6', position: { lat: 13.812550, lng: 100.574837 } },
  { id: 7, name: 'จุดตรวจ 7', position: { lat: 13.815087, lng: 100.575076 } },
  { id: 8, name: 'จุดตรวจ 8', position: { lat: 13.816996, lng: 100.574602 } },
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

const areaStyle = { 
  fillColor: "#3b82f6",    // A nice, modern blue
  fillOpacity: 0.15,       // Slightly more visible
  color: "#2563eb",        // A matching, slightly darker border
  weight: 2,               // Thicker border
  dashArray: '5, 10'       // Dashed line style for a modern look
};

const CHECK_IN_RADIUS = 50; // meters

// --- Sub-components ---

const CheckpointItem = memo(({ point, onCheckIn }) => {
  const statusInfo = {
    checked: { icon: ShieldCheck, color: 'text-green-500', text: 'ตรวจแล้ว' },
    unchecked: { icon: Shield, color: 'text-blue-500', text: 'ยังไม่ตรวจ (อยู่ในระยะ)' },
    too_far: { icon: ShieldX, color: 'text-slate-400', text: 'อยู่ไกลเกินไป' },
  }[point.status];

  const Icon = statusInfo.icon;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Icon className={`w-8 h-8 flex-shrink-0 ${statusInfo.color}`} />
        <div>
          <h3 className="font-bold text-slate-800">{point.name}</h3>
          <p className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</p>
          {point.distance !== null && (
            <p className="text-xs text-slate-500">
              ระยะห่าง: {point.distance < 1000 ? `${point.distance} ม.` : `${(point.distance / 1000).toFixed(1)} กม.`}
            </p>
          )}
        </div>
      </div>
      {point.status === 'unchecked' && (
        <button
          onClick={() => onCheckIn(point.id)}
          className="w-full sm:w-auto bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          ยืนยันการตรวจ
        </button>
      )}
    </div>
  );
});

const MapView = memo(({ userLocation, checkpoints, area, areaStyle, radius, onClose }) => (
  <div className="fixed inset-0 bg-black/50 z-[1001] flex items-center justify-center animate-fade-in">
    <div className="relative w-full h-full bg-white">
      <MapContainer center={userLocation || { lat: 13.813, lng: 100.5745 }} zoom={17} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <GeoJSON data={area} style={areaStyle} />

        {userLocation && (
          <>
            <Marker position={userLocation} icon={icons.user} />
            <Circle
              center={userLocation}
              radius={radius}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1, weight: 1 }}
            />
          </>
        )}

        {checkpoints.map(point => (
          <Marker key={point.id} position={point.position} icon={icons[point.status]}>
            <Popup>
              <div className="text-center font-sans">
                <h3 className="font-bold">{point.name}</h3>
                <p>สถานะ: {{ checked: 'ตรวจแล้ว', unchecked: 'ยังไม่ตรวจ', too_far: 'อยู่ไกลเกินไป' }[point.status]}</p>
                {point.distance !== undefined && <p>ระยะห่าง: {point.distance} เมตร</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-slate-100 z-[1002]"
      >
        <X className="w-6 h-6 text-slate-700" />
      </button>
    </div>
  </div>
));

// --- Main Component ---

const OnDutyPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [checkpoints, setCheckpoints] = useState(() => 
    initialCheckpoints.map(p => ({ ...p, status: 'too_far', distance: null }))
  );
  const [isMapVisible, setMapVisible] = useState(false);
  const [error, setError] = useState(null);

  // Update checkpoint statuses based on user location
  useEffect(() => {
    if (!userLocation) return;

    setCheckpoints(prevCheckpoints =>
      prevCheckpoints.map(point => {
        if (point.status === 'checked') return point; // Don't change already checked points
        
        const distance = getDistance(userLocation, point.position);
        const newStatus = distance <= CHECK_IN_RADIUS ? 'unchecked' : 'too_far';
        
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
        setError("ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์");
        // alert("ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์");
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
    <div className="fixed inset-0 bg-slate-50 z-[1000] flex flex-col">
      <header className="bg-white/80 backdrop-blur-md shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">หน้าสำหรับเจ้าหน้าที่เข้าเวร</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <p className="font-bold">ข้อควรระวัง</p>
            <p>{error}</p>
          </div>
        )}
        <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold">รายการจุดตรวจ</h2>
          <p className="text-sm text-slate-500">กรุณาตรวจตามจุดที่กำหนดให้ครบถ้วน</p>
        </div>
        {checkpoints.map(point => (
          <CheckpointItem key={point.id} point={point} onCheckIn={handleCheckIn} />
        ))}
      </main>

      {isMapVisible && (
        <MapView
          userLocation={userLocation}
          checkpoints={checkpoints}
          area={areaOfResponsibility}
          areaStyle={areaStyle}
          radius={CHECK_IN_RADIUS}
          onClose={() => setMapVisible(false)}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 right-4 z-20 flex flex-col gap-4">
        <button 
          onClick={handleSOS}
          className="flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl transform active:scale-90 transition-transform duration-200 animate-pulse"
        >
          <Siren className="w-8 h-8" />
        </button>
        <button 
          onClick={() => setMapVisible(true)}
          className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl transform active:scale-90 transition-transform duration-200"
        >
          <MapIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default OnDutyPage;