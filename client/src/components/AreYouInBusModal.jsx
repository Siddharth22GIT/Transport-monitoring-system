import { Bus, MapPin } from 'lucide-react';

export default function AreYouInBusModal({ vehicleNumber, onYes, onNo }) {
  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border-2 border-[var(--color-border)]">
        <span className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-[var(--color-primary-tint)] text-[var(--color-primary)] mb-4">
          <Bus size={28} />
        </span>
        <h2 className="font-[var(--font-display)] text-xl font-extrabold mb-1.5">Are you in this bus?</h2>
        <p className="text-sm text-[var(--color-ink-dim)] mb-6">
          Bus <span className="font-mono font-bold text-[var(--color-ink)]">{vehicleNumber}</span> - if you're riding it,
          we can show its position from your phone's GPS instead of its scheduled route.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onNo}
            className="flex-1 rounded-xl border-2 border-[var(--color-border)] py-2.5 font-bold text-[var(--color-ink-dim)] hover:border-[var(--color-ink-dim)] transition"
          >
            No
          </button>
          <button
            onClick={onYes}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] text-white py-2.5 font-bold hover:bg-[var(--color-primary-dark)] transition"
          >
            <MapPin size={16} /> Yes
          </button>
        </div>
      </div>
    </div>
  );
}