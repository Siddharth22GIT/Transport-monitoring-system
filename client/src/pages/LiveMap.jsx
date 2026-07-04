import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { Bus, Gauge } from 'lucide-react';
import '../components/leafletIconFix';
import api from '../api/client';
import socket from '../api/socket';
import VehicleMarker from '../components/VehicleMarker';
import StatusBadge from '../components/StatusBadge';
import { notify, areNotificationsEnabled } from '../utils/notifications';

const DEFAULT_CENTER = [28.6139, 77.209]; // fallback: New Delhi

function FlyToVehicle({ vehicle }) {
  const map = useMap();
  useEffect(() => {
    if (!vehicle) return;
    const [lng, lat] = vehicle.currentLocation?.coordinates || [];
    if (lat && lng) map.flyTo([lat, lng], 14, { duration: 1 });
  }, [vehicle?._id]); // eslint-disable-line
  return null;
}

export default function LiveMap() {
  const [searchParams] = useSearchParams();
  const focusVehicleNumber = searchParams.get('vehicle');

  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const trackedVehicleNumberRef = useRef(null);
  const milestoneRef = useRef({}); // vehicleNumber -> { half, arriving }

  useEffect(() => {
    const load = async () => {
      const [vRes, rRes] = await Promise.all([api.get('/vehicles'), api.get('/routes')]);
      setVehicles(vRes.data);
      setRoutes(rRes.data);
      if (focusVehicleNumber) {
        const match = vRes.data.find((v) => v.vehicleNumber === focusVehicleNumber);
        if (match) {
          setSelectedVehicleId(match._id);
          if (match.routeId) setSelectedRouteId(match.routeId._id);
        }
      }
    };
    load();
  }, [focusVehicleNumber]);

  useEffect(() => {
    const byId = vehicles.find((v) => v._id === selectedVehicleId);
    trackedVehicleNumberRef.current = focusVehicleNumber || byId?.vehicleNumber || null;
  }, [focusVehicleNumber, selectedVehicleId, vehicles]);

  useEffect(() => {
    socket.connect();

    const onBroadcast = ({ vehicleId, latitude, longitude, speed, status, routeProgress, rerouted }) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleNumber === vehicleId
            ? {
                ...v,
                currentLocation: { type: 'Point', coordinates: [longitude, latitude] },
                speed,
                status: status || v.status,
              }
            : v
        )
      );

      // Only alert for the bus the passenger is actually watching (the one
      // they searched for, or clicked in the sidebar) - not every bus on
      // the map, which would be spammy.
      if (trackedVehicleNumberRef.current !== vehicleId || !areNotificationsEnabled()) return;
      if (typeof routeProgress !== 'number') return;

      const known = milestoneRef.current[vehicleId];

      if (!known) {
        // First update we've seen for this vehicle this session.
        notify('Journey started', "Your bus is on the move. We'll keep you posted along the way.", 'start');
        milestoneRef.current[vehicleId] = { half: routeProgress >= 0.5, arriving: routeProgress >= 0.85 };
        return;
      }

      if (rerouted) {
        notify('Reached the destination', "The bus has reached its stop and is heading back. Safe travels!", 'reroute');
        milestoneRef.current[vehicleId] = { half: false, arriving: false };
        return;
      }

      if (!known.arriving && routeProgress >= 0.85) {
        notify('Almost there', "You're about to reach your destination.", 'arriving');
        known.arriving = true;
      } else if (!known.half && routeProgress >= 0.5) {
        notify('Halfway there', "We hope you're having a safe journey!", 'milestone');
        known.half = true;
      }
    };

    socket.on('broadcastLocation', onBroadcast);
    return () => {
      socket.off('broadcastLocation', onBroadcast);
      socket.disconnect();
    };
  }, []);

  const filteredVehicles = useMemo(
    () => (selectedRouteId === 'all' ? vehicles : vehicles.filter((v) => v.routeId?._id === selectedRouteId)),
    [vehicles, selectedRouteId]
  );

  const focusedVehicle = vehicles.find((v) => v._id === selectedVehicleId);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-61px)]">
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-y-auto">
        <label className="block text-xs font-bold text-[var(--color-ink-dim)] mb-1.5 uppercase tracking-wide">Filter by route</label>
        <select
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium mb-5 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="all">All routes</option>
          {routes.map((r) => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>

        <h2 className="flex items-center gap-1.5 font-[var(--font-display)] text-sm font-extrabold text-[var(--color-ink)] mb-3">
          <Bus size={16} /> Vehicles ({filteredVehicles.length})
        </h2>
        <div className="space-y-2.5">
          {filteredVehicles.map((v) => (
            <button
              key={v._id}
              onClick={() => setSelectedVehicleId(v._id)}
              className={`w-full text-left rounded-xl border-2 p-3 transition ${
                selectedVehicleId === v._id ? 'border-[var(--color-primary)] shadow-md' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
              }`}
              style={{ backgroundColor: v.routeId?.color ? `${v.routeId.color}0d` : 'var(--color-surface-alt)' }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-sm">{v.vehicleNumber}</span>
                <StatusBadge status={v.status} />
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--color-ink-dim)] font-medium">
                <Gauge size={13} /> {v.speed ?? 0} km/h · {v.routeId?.name || 'No route'}
              </div>
            </button>
          ))}
          {filteredVehicles.length === 0 && (
            <p className="text-sm text-[var(--color-ink-dim)]">No vehicles on this route yet.</p>
          )}
        </div>
      </aside>

      <div className="flex-1 min-h-[400px]">
        <MapContainer center={DEFAULT_CENTER} zoom={12} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {routes
            .filter((r) => selectedRouteId === 'all' || r._id === selectedRouteId)
            .map((r) => (
              r.stops?.length > 1 && (
                <Polyline
                  key={r._id}
                  positions={r.stops.map((s) => [s.lat, s.lng])}
                  pathOptions={{ color: r.color, weight: 5, opacity: 0.75 }}
                />
              )
            ))}
          {filteredVehicles.map((v) => (
            <VehicleMarker key={v._id} vehicle={v} onClick={(veh) => setSelectedVehicleId(veh._id)} />
          ))}
          <FlyToVehicle vehicle={focusedVehicle} />
        </MapContainer>
      </div>
    </div>
  );
}