import { ShieldCheck, Eye, Users, MapPin, Phone, Moon, Backpack, MessageCircleWarning } from 'lucide-react';
import { Link } from 'react-router-dom';

const GUIDELINES = [
  {
    Icon: MapPin,
    title: 'Confirm before you board',
    desc: "Match the bus number and route shown on the app with the one in front of you before getting on. Don't rely on memory alone.",
  },
  {
    Icon: Eye,
    title: 'Track your journey live',
    desc: 'Keep the live map open during your ride so you (or someone you trust) always knows where the bus is.',
  },
  {
    Icon: Users,
    title: 'Be cautious with strangers',
    desc: "Avoid sharing personal details - your address, daily schedule, or that you're travelling alone - with co-passengers you don't know.",
  },
  {
    Icon: Moon,
    title: 'Extra care at night',
    desc: 'Prefer seats near the driver or in well-lit parts of the bus after dark. Stay alert at stops with few people around.',
  },
  {
    Icon: Backpack,
    title: 'Keep belongings close',
    desc: 'Keep bags and valuables within sight and reach, especially in crowded buses or during stops.',
  },
  {
    Icon: Phone,
    title: 'Share your travel plan',
    desc: 'Let a friend or family member know your route and expected arrival time - the pin feature makes it easy for them to check too.',
  },
  {
    Icon: MessageCircleWarning,
    title: 'Report anything unusual',
    desc: 'If you notice suspicious behavior, a safety issue with the vehicle, or feel unsafe, tell the driver or contact emergency services immediately.',
  },
];

export default function TravelGuidelines() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <span className="grid place-items-center h-12 w-12 rounded-2xl bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
          <ShieldCheck size={24} />
        </span>
        <h1 className="font-[var(--font-display)] text-3xl font-extrabold">Travel Guidelines</h1>
      </div>
      <p className="text-[var(--color-ink-dim)] mb-10">
        A few simple habits that make your commute safer, whether you ride this route every day or just once.
      </p>

      <div className="space-y-4">
        {GUIDELINES.map(({ Icon, title, desc }) => (
          <div key={title} className="flex gap-4 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <span className="shrink-0 grid place-items-center h-10 w-10 rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-primary)]">
              <Icon size={20} />
            </span>
            <div>
              <h3 className="font-[var(--font-display)] font-extrabold text-base mb-1">{title}</h3>
              <p className="text-sm text-[var(--color-ink-dim)]">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border-2 border-[var(--color-stop)]/30 bg-[var(--color-stop)]/5 p-5 text-center">
        <p className="text-sm text-[var(--color-ink)] font-semibold mb-2">In an emergency, don't wait - act first.</p>
        <Link
          to="/emergency-contacts"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-stop)] text-white px-5 py-2.5 font-bold hover:brightness-105 transition"
        >
          <Phone size={16} /> View emergency contacts
        </Link>
      </div>
    </div>
  );
}