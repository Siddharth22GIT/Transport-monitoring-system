import { Phone, ShieldAlert, Siren, HeartPulse, Flame, UserRound, Baby, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONTACTS = [
  { Icon: ShieldAlert, label: 'National Emergency Number', number: '112', desc: 'All-in-one emergency line - police, fire, ambulance.' },
  { Icon: Siren, label: 'Police', number: '100', desc: 'Report a crime, theft, or immediate safety threat.' },
  { Icon: HeartPulse, label: 'Ambulance', number: '108', desc: 'Medical emergencies and injury on board.' },
  { Icon: Flame, label: 'Fire Brigade', number: '101', desc: 'Fire or smoke on the vehicle or nearby.' },
  { Icon: UserRound, label: "Women's Helpline", number: '1091', desc: 'Harassment or safety concerns for women.' },
  { Icon: Baby, label: 'Child Helpline', number: '1098', desc: 'For a child travelling alone or in distress.' },
  { Icon: Construction, label: 'Road Accident Emergency', number: '1033', desc: 'Highway accidents and breakdown assistance.' },
];

export default function EmergencyContacts() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <span className="grid place-items-center h-12 w-12 rounded-2xl bg-[var(--color-stop)]/10 text-[var(--color-stop)]">
          <Phone size={24} />
        </span>
        <h1 className="font-[var(--font-display)] text-3xl font-extrabold">Emergency Contacts</h1>
      </div>
      <p className="text-[var(--color-ink-dim)] mb-10">
        Tap a number below to call directly. Save the ones you might need before you travel, not during.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {CONTACTS.map(({ Icon, label, number, desc }) => (
          
           <a key={label}
            href={`tel:${number}`}
            className="flex items-center gap-4 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm hover:border-[var(--color-stop)] hover:shadow-md transition"
          >
            <span className="shrink-0 grid place-items-center h-11 w-11 rounded-xl bg-[var(--color-stop)]/10 text-[var(--color-stop)]">
              <Icon size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-[var(--font-display)] font-extrabold text-sm">{label}</h3>
              <p className="text-xs text-[var(--color-ink-dim)] mt-0.5">{desc}</p>
            </div>
            <span className="font-[var(--font-display)] text-xl font-extrabold text-[var(--color-stop)] shrink-0">{number}</span>
          </a>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5 text-center">
        <p className="text-sm text-[var(--color-ink-dim)] mb-2">Want a refresher on staying safe during your ride?</p>
        <Link
          to="/travel-guidelines"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] text-white px-5 py-2.5 font-bold hover:bg-[var(--color-primary-dark)] transition"
        >
          View Travel Guidelines
        </Link>
      </div>
    </div>
  );
}