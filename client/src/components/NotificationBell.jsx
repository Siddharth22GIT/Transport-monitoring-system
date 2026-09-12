import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { areNotificationsEnabled, enableNotifications, disableNotifications, notify } from '../utils/notifications';

export default function NotificationBell() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(areNotificationsEnabled());
  }, []);

  const toggle = async () => {
    if (enabled) {
      disableNotifications();
      setEnabled(false);
      return;
    }
    const granted = await enableNotifications();
    setEnabled(granted);
    if (granted) {
      notify("You're all set", "We'll alert you when your bus starts, mid-journey, and when it's about to arrive.", 'start');
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      alert('Notifications are blocked for this site in your browser settings. Enable them there to get alerts.');
    }
  };

  return (
    <button
      onClick={toggle}
      title={enabled ? 'Disable journey alerts' : 'Enable journey alerts'}
      className={`grid place-items-center h-9 w-9 rounded-lg border-2 transition ${
        enabled
          ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-tint)]'
          : 'border-[var(--color-border)] text-[var(--color-ink-dim)] hover:border-[var(--color-primary)]'
      }`}
    >
      {enabled ? <Bell size={16} /> : <BellOff size={16} />}
    </button>
  );
}