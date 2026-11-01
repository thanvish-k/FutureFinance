import React, { useState } from 'react';
import { apiCall } from '../api.js';
import { User } from '../types.js';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AuthProps {
  onSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: 'Demo User',
    email: 'demo@futurefinance.in',
    password: 'FutureFinance@123'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const res = await apiCall<{ access_token: string; user: User }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      localStorage.setItem('futurefinance_token', res.access_token);
      localStorage.setItem('futurefinance_user', JSON.stringify(res.user));
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-stage">
      <div className="auth-panel-glow">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 16, background: 'var(--cyan-gradient)', color: '#fff', boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)', marginBottom: 16 }}>
            <Sparkles size={28} />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
            FutureFinance
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            {isRegister ? 'Establish your local 3NF financial records' : 'Next-Gen Financial Intelligence Terminal'}
          </p>

          <div style={{ marginTop: 12 }}>
            <span className="db-live-beacon">
              <span className="beacon-dot" />
              <span>Local PostgreSQL &bull; PERN Stack</span>
            </span>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185', padding: '10px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <div>
              <label className="form-label">Full Name</label>
              <input
                className="form-ctrl"
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="form-label">Email Address</label>
            <input
              className="form-ctrl"
              type="email"
              required
              placeholder="demo@futurefinance.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              className="form-ctrl"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-gradient" style={{ justifyContent: 'center', marginTop: 10, padding: 12 }} disabled={loading}>
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Enter Intelligence Deck'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            style={{ background: 'transparent', border: 0, color: '#38bdf8', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
          >
            {isRegister ? 'Already registered? Sign in' : 'Need an account? Register new user'}
          </button>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Demo User: demo@futurefinance.in &bull; FutureFinance@123
          </span>
        </div>
      </div>
    </div>
  );
};
