import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import { Plus, Trash2, Play, Square, MapPin, CheckCircle2, LayoutDashboard, Bus, Route as RouteIcon, CalendarClock } from 'lucide-react';
import '../components/leafletIconFix';
import api from '../api/client';
import { geocodePlace } from '../api/geocode';
import { getRoadRoute } from '../api/routing';
import StatusBadge from '../components/StatusBadge';

const TABS = [
  { id: 'stats', label: 'Stats', Icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicles', Icon: Bus },
  { id: 'routes', label: 'Routes', Icon: RouteIcon },
  { id: 'schedules', label: 'Schedules', Icon: CalendarClock },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-[var(--font-display)] text-3xl font-extrabold mb-6">Admin Dashboard</h1>

      <div className="flex gap-1 mb-6 border-b-2 border-[var(--color-border)] overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-[3px] -mb-0.5 transition whitespace-nowrap ${
              tab === id ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'stats' && <StatsPanel />}
      {tab === 'vehicles' && <VehiclesPanel />}
      {tab === 'routes' && <RoutesPanel />}
      {tab === 'schedules' && <SchedulesPanel />}
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setStats(res.data)).catch(() => setStats(null));
  }, []);

  if (!stats) return <p className="text-[var(--color-ink-dim)] text-sm">Loading stats…</p>;

  const cards = [
    { label: 'Total vehicles', value: stats.totalVehicles },
    { label: 'Running now', value: stats.activeVehicles },
    { label: 'Total routes', value: stats.totalRoutes },
    { label: 'Scheduled trips', value: stats.totalSchedules },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="font-[var(--font-display)] text-4xl font-extrabold text-[var(--color-primary)]">{c.value}</div>
          <div className="text-sm text-[var(--color-ink-dim)] mt-1 font-medium">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function VehiclesPanel() {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ vehicleNumber: '', type: 'bus', capacity: '', driverName: '', routeId: '' });
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    api.get('/vehicles').then((res) => setVehicles(res.data));
    api.get('/routes').then((res) => setRoutes(res.data));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/vehicles', { ...form, routeId: form.routeId || null });
      setForm({ vehicleNumber: '', type: 'bus', capacity: '', driverName: '', routeId: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create vehicle');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/vehicles/${id}`);
    load();
  };

  const setStatus = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      await api.put(`/vehicles/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 bg-[var(--color-surface)] p-5 rounded-2xl border-2 border-[var(--color-border)] shadow-sm">
        <input required placeholder="Vehicle number" value={form.vehicleNumber}
          onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium">
          <option value="bus">Bus</option>
          <option value="train">Train</option>
        </select>
        <input placeholder="Capacity" type="number" value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium" />
        <input placeholder="Driver name" value={form.driverName}
          onChange={(e) => setForm({ ...form, driverName: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium" />
        <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium">
          <option value="">No route yet</option>
          {routes.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
        <button type="submit" className="col-span-2 md:col-span-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] text-white py-2.5 text-sm font-bold hover:bg-[var(--color-primary-dark)] transition">
          <Plus size={16} /> Add vehicle
        </button>
        {error && <p className="col-span-full text-[var(--color-stop)] text-sm">{error}</p>}
      </form>

      <div className="space-y-3">
        {vehicles.map((v) => (
          <div key={v._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-10 w-10 rounded-xl text-white font-bold" style={{ backgroundColor: v.routeId?.color || '#94a3b8' }}>
                <Bus size={18} />
              </span>
              <div>
                <div className="font-mono font-bold text-sm">{v.vehicleNumber}</div>
                <div className="text-xs text-[var(--color-ink-dim)]">{v.routeId?.name || 'No route assigned'} · {v.type}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={v.status} />
              {v.status === 'running' ? (
                <button
                  disabled={busyId === v._id}
                  onClick={() => setStatus(v._id, 'idle')}
                  className="flex items-center gap-1 rounded-lg bg-[var(--color-stop)] text-white px-3 py-1.5 text-xs font-bold hover:brightness-105 transition disabled:opacity-50"
                >
                  <Square size={13} /> Stop
                </button>
              ) : (
                <button
                  disabled={busyId === v._id || !v.routeId}
                  title={!v.routeId ? 'Assign a route first' : ''}
                  onClick={() => setStatus(v._id, 'running')}
                  className="flex items-center gap-1 rounded-lg bg-[var(--color-go)] text-white px-3 py-1.5 text-xs font-bold hover:brightness-105 transition disabled:opacity-40"
                >
                  <Play size={13} /> Start
                </button>
              )}
              <button onClick={() => handleDelete(v._id)} className="grid place-items-center h-8 w-8 rounded-lg text-[var(--color-stop)] hover:bg-[var(--color-stop)]/10 transition">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutesPanel() {
  const [routes, setRoutes] = useState([]);
  const [name, setName] = useState('');
  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [geocoding, setGeocoding] = useState('');
  const [roadPath, setRoadPath] = useState(null); // {points, distanceKm, durationMin} | null
  const [routing, setRouting] = useState(false);
  const [routingWarning, setRoutingWarning] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/routes').then((res) => setRoutes(res.data)).catch(() => setRoutes([]));
  };
  useEffect(load, []);

  const locate = async (which) => {
    setError('');
    setGeocoding(which);
    try {
      const text = which === 'start' ? startText : endText;
      const point = await geocodePlace(text);
      if (!point) {
        setError(`Couldn't find "${text}". Try being more specific (add city name).`);
      } else if (which === 'start') {
        setStartPoint(point);
      } else {
        setEndPoint(point);
      }
    } catch {
      setError('Location lookup failed. Check your connection and try again.');
    } finally {
      setGeocoding('');
    }
  };

  // As soon as both ends are located, fetch the actual road-following path
  // and preview it live - this is what stops routes from cutting through
  // rivers, parks, and buildings.
  useEffect(() => {
    if (!startPoint || !endPoint) {
      setRoadPath(null);
      return;
    }
    let cancelled = false;
    setRouting(true);
    setRoutingWarning('');
    getRoadRoute(startPoint, endPoint)
      .then((result) => {
        if (!cancelled) setRoadPath(result);
      })
      .catch(() => {
        if (cancelled) return;
        setRoutingWarning("Couldn't reach the road-routing service, so this will be saved as a straight line instead. You can try again by re-locating the endpoints.");
        setRoadPath(null);
      })
      .finally(() => {
        if (!cancelled) setRouting(false);
      });
    return () => { cancelled = true; };
  }, [startPoint, endPoint]);

  const previewColor = colorForRouteIndex(routes.length);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!startPoint || !endPoint) {
      setError('Locate both the start and end location before creating the route.');
      return;
    }
    const stops = roadPath?.points?.length
      ? roadPath.points.map((p, i) => ({
          name: i === 0 ? startText : i === roadPath.points.length - 1 ? endText : '',
          lat: p.lat,
          lng: p.lng,
        }))
      : [
          { name: startText, lat: startPoint.lat, lng: startPoint.lng },
          { name: endText, lat: endPoint.lat, lng: endPoint.lng },
        ];

    try {
      await api.post('/routes', {
        name,
        startLocation: startText,
        endLocation: endText,
        stops,
        distance: roadPath?.distanceKm || 0,
        durationMin: roadPath?.durationMin || 0,
      });
      setName(''); setStartText(''); setEndText(''); setStartPoint(null); setEndPoint(null); setRoadPath(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create route');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/routes/${id}`);
    load();
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="space-y-3 mb-6 bg-[var(--color-surface)] p-5 rounded-2xl border-2 border-[var(--color-border)] shadow-sm">
        <input required placeholder="Route name (e.g. Route 12 - CP to Dwarka)" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]" />

        <div className="grid md:grid-cols-[1fr_auto] gap-2">
          <input required placeholder="Start location (e.g. Connaught Place, Delhi)" value={startText}
            onChange={(e) => { setStartText(e.target.value); setStartPoint(null); }}
            className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]" />
          <button type="button" onClick={() => locate('start')} disabled={geocoding === 'start' || !startText}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm font-bold hover:border-[var(--color-primary)] transition disabled:opacity-50 whitespace-nowrap">
            {startPoint ? <CheckCircle2 size={16} className="text-[var(--color-go)]" /> : <MapPin size={16} />}
            {geocoding === 'start' ? 'Locating…' : startPoint ? 'Located' : 'Locate'}
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-2">
          <input required placeholder="End location (e.g. Dwarka Sector 21, Delhi)" value={endText}
            onChange={(e) => { setEndText(e.target.value); setEndPoint(null); }}
            className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]" />
          <button type="button" onClick={() => locate('end')} disabled={geocoding === 'end' || !endText}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm font-bold hover:border-[var(--color-primary)] transition disabled:opacity-50 whitespace-nowrap">
            {endPoint ? <CheckCircle2 size={16} className="text-[var(--color-go)]" /> : <MapPin size={16} />}
            {geocoding === 'end' ? 'Locating…' : endPoint ? 'Located' : 'Locate'}
          </button>
        </div>

        {(startPoint && endPoint) && (
          <RoutePreviewMap startPoint={startPoint} endPoint={endPoint} roadPath={roadPath} routing={routing} color={previewColor} />
        )}

        {routing && <p className="text-[var(--color-ink-dim)] text-sm">Fetching the road-following path…</p>}
        {roadPath && !routing && (
          <p className="text-[var(--color-go)] text-sm font-semibold">
            Road route found - {roadPath.distanceKm} km, ~{roadPath.durationMin} min drive.
          </p>
        )}
        {routingWarning && <p className="text-[var(--color-accent)] text-sm">{routingWarning}</p>}

        <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] text-white py-2.5 text-sm font-bold hover:bg-[var(--color-primary-dark)] transition">
          <Plus size={16} /> Add route
        </button>
        {error && <p className="text-[var(--color-stop)] text-sm">{error}</p>}
      </form>

      <div className="space-y-3">
        {routes.map((r) => (
          <div key={r._id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg" style={{ backgroundColor: r.color }} />
              <div>
                <div className="font-bold text-sm">{r.name}</div>
                <div className="text-xs text-[var(--color-ink-dim)]">{r.startLocation} → {r.endLocation}{r.distance ? ` · ${r.distance} km` : ''}{r.durationMin ? ` · ~${Math.round(r.durationMin)} min` : ''}</div>
              </div>
            </div>
            <button onClick={() => handleDelete(r._id)} className="grid place-items-center h-8 w-8 rounded-lg text-[var(--color-stop)] hover:bg-[var(--color-stop)]/10 transition">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mirrors the backend's color-cycling logic (server/models/Route.js) purely
// for the live preview - the real color is assigned by the server on save.
const PREVIEW_COLORS = ['#2563eb', '#e11d48', '#059669', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];
function colorForRouteIndex(i) {
  return PREVIEW_COLORS[i % PREVIEW_COLORS.length];
}

function RoutePreviewMap({ startPoint, endPoint, roadPath, routing, color }) {
  const positions = roadPath?.points?.length
    ? roadPath.points.map((p) => [p.lat, p.lng])
    : [[startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]];

  const center = [(startPoint.lat + endPoint.lat) / 2, (startPoint.lng + endPoint.lng) / 2];

  return (
    <div className="rounded-xl overflow-hidden border-2 border-[var(--color-border)] h-56 relative">
      <MapContainer center={center} zoom={12} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={positions} pathOptions={{ color, weight: 5, opacity: 0.85 }} />
        <CircleMarker center={[startPoint.lat, startPoint.lng]} radius={7} pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1 }} />
        <CircleMarker center={[endPoint.lat, endPoint.lng]} radius={7} pathOptions={{ color: '#e11d48', fillColor: '#e11d48', fillOpacity: 1 }} />
      </MapContainer>
      {routing && (
        <div className="absolute inset-0 bg-white/70 grid place-items-center text-sm font-bold text-[var(--color-ink-dim)] pointer-events-none">
          Fetching road path…
        </div>
      )}
    </div>
  );
}

function SchedulesPanel() {
  const [schedules, setSchedules] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ vehicleId: '', routeId: '', departureTime: '', arrivalTime: '', date: '' });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/schedules').then((res) => setSchedules(res.data));
    api.get('/vehicles').then((res) => setVehicles(res.data));
    api.get('/routes').then((res) => setRoutes(res.data));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/schedules', { ...form, daysOfWeek: [] });
      setForm({ vehicleId: '', routeId: '', departureTime: '', arrivalTime: '', date: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create schedule');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/schedules/${id}`);
    load();
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 bg-[var(--color-surface)] p-5 rounded-2xl border-2 border-[var(--color-border)] shadow-sm">
        <select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium">
          <option value="">Vehicle</option>
          {vehicles.map((v) => <option key={v._id} value={v._id}>{v.vehicleNumber}</option>)}
        </select>
        <select required value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium">
          <option value="">Route</option>
          {routes.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
        <input required type="time" value={form.departureTime}
          onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium" />
        <input required type="time" value={form.arrivalTime}
          onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium" />
        <input type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium" />
        <button type="submit" className="col-span-2 md:col-span-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] text-white py-2.5 text-sm font-bold hover:bg-[var(--color-primary-dark)] transition">
          <Plus size={16} /> Add schedule
        </button>
        {error && <p className="col-span-full text-[var(--color-stop)] text-sm">{error}</p>}
      </form>

      <div className="space-y-3">
        {schedules.map((s) => (
          <div key={s._id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <div>
              <div className="font-mono font-bold text-sm">{s.vehicleId?.vehicleNumber || '—'} · {s.routeId?.name || '—'}</div>
              <div className="text-xs text-[var(--color-ink-dim)]">{s.departureTime} - {s.arrivalTime} {s.date && `· ${s.date}`}</div>
            </div>
            <button onClick={() => handleDelete(s._id)} className="grid place-items-center h-8 w-8 rounded-lg text-[var(--color-stop)] hover:bg-[var(--color-stop)]/10 transition">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}