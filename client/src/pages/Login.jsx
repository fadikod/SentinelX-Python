import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 24,
    }}>
      <div style={{
        position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
        style={{ width: '100%', maxWidth: 420, padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={24} color="var(--neon-cyan)" />
            <span className="mono" style={{ fontSize: 20, fontWeight: 600, color: 'var(--neon-cyan)', letterSpacing: 3 }}>
              SENTINEL<span style={{ color: 'var(--text-primary)' }}>X</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Authenticate to access threat intelligence</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="analyst@sentinel.io"
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'rgba(255, 0, 64, 0.08)',
              border: '1px solid rgba(255, 0, 64, 0.25)',
              borderRadius: 4,
              fontSize: 13,
              color: 'var(--neon-red)',
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 8, width: '100%', textAlign: 'center', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Authenticating...' : '[ AUTHENTICATE ]'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          No access yet?{' '}
          <Link to="/signup" style={{ color: 'var(--neon-cyan)' }}>
            Request clearance
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
