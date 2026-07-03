import { Link } from 'react-router-dom';
import { Search, MapPinned, Bus, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">
      <div className="flex flex-col items-center text-center pt-16 pb-14">
        <p className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-primary)] tracking-widest mb-4 bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full">
          <Bus size={14} /> LIVE · GPS · REAL-TIME
        </p>
        <h1 className="font-[var(--font-display)] text-4xl md:text-6xl font-extrabold max-w-2xl leading-tight text-[var(--color-ink)]">
          Know exactly when your bus arrives.
        </h1>
        <p className="text-[var(--color-ink-dim)] mt-5 max-w-lg text-lg">
          Search a route, see the live bus on the map, pin your favorites. No more guessing at the stop.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to="/search" className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] text-white px-6 py-3 font-bold hover:bg-[var(--color-primary-dark)] transition shadow-md">
            <Search size={18} /> Find a bus
          </Link>
          <Link to="/map" className="flex items-center gap-2 rounded-xl border-2 border-[var(--color-border)] px-6 py-3 font-bold text-[var(--color-ink)] hover:border-[var(--color-primary)] transition">
            <MapPinned size={18} /> View live map
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 pb-16">
        {[
          { Icon: Search, title: 'Search any route', desc: 'Type your start and destination to see which buses are running there.' },
          { Icon: MapPinned, title: 'Track it live', desc: 'Watch the bus move on the map in real time once it starts its route.' },
          { Icon: ShieldCheck, title: 'Pin your regulars', desc: 'Save the buses you take often so you can check them in one tap.' },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <span className="grid place-items-center h-11 w-11 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
              <Icon size={22} />
            </span>
            <h3 className="font-[var(--font-display)] font-extrabold text-lg mb-1.5">{title}</h3>
            <p className="text-sm text-[var(--color-ink-dim)]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
