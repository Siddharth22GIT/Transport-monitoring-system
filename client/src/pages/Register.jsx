import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-5">
          <span className="grid place-items-center h-12 w-12 rounded-2xl bg-[var(--color-primary)] text-white">
            <Bus size={24} />
          </span>
        </div>
        <h1 className="font-[var(--font-display)] text-2xl font-extrabold mb-1 text-center">Create account</h1>
        <p className="text-[var(--color-ink-dim)] text-sm mb-6 text-center">Join to start tracking your bus.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'phone'].map((field) => (
            <div key={field}>
              <label className="block text-xs font-bold text-[var(--color-ink-dim)] mb-1.5 uppercase tracking-wide">{field}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                required={field !== 'phone'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-[var(--color-ink-dim)] mb-1.5 uppercase tracking-wide">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl bg-[var(--color-surface-alt)] border-2 border-[var(--color-border)] px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {error && <p className="text-[var(--color-stop)] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--color-primary)] text-white py-2.5 font-bold hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-[var(--color-ink-dim)] mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
