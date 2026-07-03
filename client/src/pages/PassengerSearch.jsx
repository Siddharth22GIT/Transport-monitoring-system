import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Navigation, Star, User as UserIcon, Clock, Calendar, Bus } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

function ResultCard({ result, pinnedIds, onTogglePin, onOpenMap }) {
  const { route, vehicle, schedule } = result;
  if (!route || !vehicle) return null;
  const isPinned = pinnedIds.has(vehicle._id);

  return (
    <div
      className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm hover:shadow-lg transition cursor-pointer"
      style={{ borderLeftColor: route.color, borderLeftWidth: 6 }}
      onClick={() => onOpenMap(vehicle)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="grid place-items-center h-8 w-8 rounded-lg text-white" style={{ backgroundColor: route.color }}>
              <Bus size={16} />
            </span>
            <span className="font-mono font-extrabold text-lg">{vehicle.vehicleNumber}</span>
          </div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{route.name}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(vehicle._id); }}
          className="shrink-0 grid place-items-center h-9 w-9 rounded-full hover:bg-[var(--color-surface-alt)] transition"
          title={isPinned ? 'Unpin' : 'Pin this bus'}
        >
          <Star size={20} fill={isPinned ? 'var(--color-accent)' : 'none'} color={isPinned ? 'var(--color-accent)' : 'var(--color-ink-dim)'} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
        <div className="flex items-center gap-1.5 text-[var(--color-ink-dim)]">
          <UserIcon size={14} /> {vehicle.driverName || 'Driver TBD'}
        </div>
        <div className="flex items-center gap-1.5 text-[var(--color-ink-dim)]">
          <Clock size={14} /> {schedule ? `${schedule.departureTime} - ${schedule.arrivalTime}` : 'No schedule set'}
        </div>
        <div className="flex items-center gap-1.5 text-[var(--color-ink-dim)]">
          <Calendar size={14} /> {schedule?.date || 'Any day'}
        </div>
        <div className="flex items-center">
          <StatusBadge status={vehicle.status} />
        </div>
      </div>
    </div>
  );
}

export default function PassengerSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || '',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [pinnedBuses, setPinnedBuses] = useState([]);

  const loadPins = async () => {
    try {
      const { data } = await api.get('/users/pins');
      setPinnedBuses(data);
      setPinnedIds(new Set(data.map((v) => v._id)));
    } catch {
      // not logged in or no pins yet - fine
    }
  };

  useEffect(() => { loadPins(); }, []);

  const runSearch = async (from, to, date) => {
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const params = { from, to };
      if (date) params.date = date;
      const { data } = await api.get('/routes/search', { params });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // If the person arrived here from the Home page's quick-search (which
  // passes ?from=&to=&date=), run the search immediately instead of making
  // them retype it.
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) runSearch(from, to, searchParams.get('date') || '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(form.from, form.to, form.date);
  };

  const togglePin = async (vehicleId) => {
    await api.post(`/users/pins/${vehicleId}`);
    loadPins();
  };

  const openMap = (vehicle) => navigate(`/map?vehicle=${vehicle.vehicleNumber}`);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-extrabold mb-1">Find your bus</h1>
      <p className="text-[var(--color-ink-dim)] mb-8">Search a route to see if a bus is running right now.</p>

      <form onSubmit={handleSearch} className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm mb-10">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" />
            <input
              required
              placeholder="From"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] pl-9 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="relative">
            <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-accent)]" />
            <input
              required
              placeholder="To"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] pl-9 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] text-white py-3 font-bold hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
        >
          <Search size={18} /> {loading ? 'Searching…' : 'Search for a bus'}
        </button>
        {error && <p className="text-[var(--color-stop)] text-sm mt-2">{error}</p>}
      </form>

      {results && (
        <div className="space-y-4 mb-10">
          <h2 className="font-[var(--font-display)] font-extrabold text-lg">
            {results.length} bus{results.length !== 1 ? 'es' : ''} found
          </h2>
          {results.length === 0 && (
            <p className="text-[var(--color-ink-dim)] text-sm">No buses on that route yet. Try different locations.</p>
          )}
          {results.map((r) => (
            <ResultCard key={r.vehicle._id} result={r} pinnedIds={pinnedIds} onTogglePin={togglePin} onOpenMap={openMap} />
          ))}
        </div>
      )}

      {pinnedBuses.length > 0 && (
        <div>
          <h2 className="flex items-center gap-1.5 font-[var(--font-display)] font-extrabold text-lg mb-4">
            <Star size={18} fill="var(--color-accent)" color="var(--color-accent)" /> Pinned buses
          </h2>
          <div className="space-y-4">
            {pinnedBuses.map((vehicle) => (
              vehicle.routeId && (
                <ResultCard
                  key={vehicle._id}
                  result={{ route: vehicle.routeId, vehicle, schedule: null }}
                  pinnedIds={pinnedIds}
                  onTogglePin={togglePin}
                  onOpenMap={openMap}
                />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}