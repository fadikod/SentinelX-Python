import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div className="mono" style={{ color: 'var(--neon-cyan)', fontSize: 14, letterSpacing: 3 }}>
          INITIALIZING...
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
