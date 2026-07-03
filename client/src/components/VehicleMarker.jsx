import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const makeIcon = (color, isRunning) => {
  const pulse = isRunning
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:${color}33;animation:pulse-ring 1.6s ease-out infinite;"></div>`
    : '';
  return L.divIcon({
    className: 'bus-marker-icon',
    html: `
      <div style="position:relative;width:26px;height:26px;">
        ${pulse}
        <div style="
          width:26px;height:26px;border-radius:50%;
          background:${color};
          border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          display:flex;align-items:center;justify-content:center;
          font-size:13px;
        ">🚌</div>
      </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

export default function VehicleMarker({ vehicle, onClick }) {
  const [lng, lat] = vehicle.currentLocation?.coordinates || [0, 0];
  if (!lat && !lng) return null;

  const color = vehicle.routeId?.color || '#2f5fff';
  const isRunning = vehicle.status === 'running';

  return (
    <Marker
      position={[lat, lng]}
      icon={makeIcon(color, isRunning)}
      eventHandlers={onClick ? { click: () => onClick(vehicle) } : undefined}
    >
      <Popup>
        <div className="text-xs font-sans">
          <div className="font-bold text-sm mb-1">{vehicle.vehicleNumber}</div>
          <div>Route: {vehicle.routeId?.name || 'Unassigned'}</div>
          <div>Speed: {vehicle.speed ?? 0} km/h</div>
          <div className="capitalize">Status: {vehicle.status}</div>
        </div>
      </Popup>
    </Marker>
  );
}
