import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, MapPinned, ShieldCheck, Bus } from 'lucide-react';

function HeroIllustration() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-hero-1)" />
          <stop offset="45%" stopColor="var(--color-hero-2)" />
          <stop offset="75%" stopColor="var(--color-hero-3)" />
          <stop offset="100%" stopColor="var(--color-hero-4)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky)" />
      {/* distant buildings */}
      <g opacity="0.25" fill="#ffffff">
        <rect x="60" y="230" width="34" height="120" />
        <rect x="104" y="200" width="26" height="150" />
        <rect x="140" y="250" width="30" height="100" />
        <rect x="980" y="210" width="30" height="140" />
        <rect x="1020" y="240" width="24" height="110" />
        <rect x="1054" y="190" width="34" height="160" />
      </g>
      {/* rolling hills */}
      <path d="M0,320 Q200,260 420,310 T900,300 Q1080,280 1200,320 L1200,420 L0,420 Z" fill="var(--color-hero-4)" opacity="0.55" />
      <path d="M0,350 Q250,300 500,345 T1000,335 Q1120,320 1200,350 L1200,420 L0,420 Z" fill="var(--color-hero-4)" />
      {/* road */}
      <rect x="0" y="378" width="1200" height="42" fill="#2b2733" />
      <g stroke="#f5f7fb" strokeWidth="5" strokeDasharray="26 22" opacity="0.85">
        <line x1="0" y1="399" x2="1200" y2="399" />
      </g>
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: '', to: '', date: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.from) params.set('from', form.from);
    if (form.to) params.set('to', form.to);
    if (form.date) params.set('date', form.date);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <div className="relative overflow-hidden">
        <HeroIllustration />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 pt-16 pb-28 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white tracking-widest mb-4 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
            <Bus size={14} className="hero-bus" /> LIVE · GPS · REAL-TIME
          </p>
          <h1 className="font-[var(--font-display)] text-4xl md:text-6xl font-extrabold max-w-2xl mx-auto leading-tight text-white drop-shadow-sm">
            Know exactly when your bus arrives.
          </h1>
          <p className="text-white/85 mt-5 max-w-lg mx-auto text-lg">
            Search a route, see the live bus on the map, pin your favorites. No more guessing at the stop.
          </p>
        </div>
      </div>

      {/* Search card overlapping the hero, RedBus-style */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-16 relative z-10">
        <form onSubmit={handleSearch} className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-5 shadow-xl">
          <div className="grid md:grid-cols-[1fr_1fr_auto_auto] gap-3">
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" />
              <input
                placeholder="From"
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] pl-9 pr-3 py-3 text-sm font-semibold focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="relative">
              <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-accent)]" />
              <input
                placeholder="To"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] pl-9 pr-3 py-3 text-sm font-semibold focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-3 text-sm font-semibold focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] text-white px-6 py-3 font-bold hover:bg-[var(--color-primary-dark)] transition shadow-md whitespace-nowrap"
            >
              <Search size={18} /> Search buses
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-5 py-16">
          {[
            { Icon: Search, title: 'Search any route', desc: 'Type your start and destination to see which buses are running there.' },
            { Icon: MapPinned, title: 'Track it live', desc: 'Watch the bus move on the map in real time once it starts its route.' },
            { Icon: ShieldCheck, title: 'Pin your regulars', desc: 'Save the buses you take often so you can check them in one tap.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/40 transition">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-primary)] mb-4">
                <Icon size={22} />
              </span>
              <h3 className="font-[var(--font-display)] font-extrabold text-lg mb-1.5">{title}</h3>
              <p className="text-sm text-[var(--color-ink-dim)]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}