import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);

  if (isAuthenticated) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setEmail(role === 'admin' ? 'admin@cafe.com' : 'user@cafe.com');
    setPassword(role === 'admin' ? 'admin123' : 'password123');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      {[
        { top: '-10%', left: '-8%', color: 'rgba(245,158,11,0.12)', size: 500 },
        { bottom: '-15%', right: '-10%', color: 'rgba(139,92,246,0.1)', size: 450 },
        { top: '40%', left: '40%', color: 'rgba(59,130,246,0.07)', size: 350 },
      ].map((blob, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: blob.size, height: blob.size,
          borderRadius: '50%',
          background: blob.color,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          ...blob,
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'scaleIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: 68, height: 68, borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(245,158,11,0.35)',
            animation: 'glow 3s ease infinite',
          }}>
            🍴
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Welcome to <span style={{ color: 'var(--accent)' }}>Catateria</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            Sign in to your cafeteria account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <form id="login-form" onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email */}
              <div className="input-group">
                <label htmlFor="email-input" className="input-label">Email address</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">✉</span>
                  <input
                    id="email-input"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label htmlFor="password-input" className="input-label">Password</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <span className="input-icon">🔒</span>
                  <input
                    id="password-input"
                    type={showPw ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '12px 14px', borderRadius: '10px',
                  background: 'var(--danger-muted)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: 'var(--danger)', fontSize: '0.85rem',
                  animation: 'fadeDown 0.2s ease',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%', marginTop: '4px', justifyContent: 'center' }}
              >
                {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
              </button>
            </div>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: '20px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Demo credentials
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              id="demo-customer-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => fillDemo('customer')}
              style={{ flex: 1 }}
            >
              👤 Customer
            </button>
            <button
              id="demo-admin-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => fillDemo('admin')}
              style={{ flex: 1 }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
