import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <span className="grid place-items-center h-14 w-14 rounded-2xl bg-[var(--color-stop)]/10 text-[var(--color-stop)] mb-4">
            <AlertTriangle size={28} />
          </span>
          <h2 className="font-[var(--font-display)] text-xl font-extrabold mb-2">Something broke on this page</h2>
          <p className="text-[var(--color-ink-dim)] text-sm max-w-md mb-1">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p className="text-[var(--color-ink-dim)] text-xs max-w-md mb-6">
            Open your browser console (F12) for the full error if you're reporting this.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] text-white px-5 py-2.5 font-bold hover:bg-[var(--color-primary-dark)] transition"
          >
            <RotateCcw size={16} /> Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
