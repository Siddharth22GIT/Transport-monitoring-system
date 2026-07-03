import { Circle, Play, CheckCircle2, Wrench } from 'lucide-react';

const STYLES = {
  running: { color: 'var(--color-go)', bg: '#eafaf0', label: 'Running', Icon: Play },
  idle: { color: 'var(--color-idle)', bg: '#f1f2f5', label: 'Not started', Icon: Circle },
  completed: { color: 'var(--color-primary)', bg: '#eef1ff', label: 'Completed', Icon: CheckCircle2 },
  maintenance: { color: 'var(--color-stop)', bg: '#fdecef', label: 'Maintenance', Icon: Wrench },
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.idle;
  const { Icon } = style;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      <Icon size={12} className={status === 'running' ? 'pulse-live rounded-full' : ''} />
      {style.label}
    </span>
  );
}
