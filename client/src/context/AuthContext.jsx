import { createContext, useContext, useEffect, useState } from 'react';

const BASE = import.meta.env.VITE_API_URL ?? '';
const AuthContext = createContext(null);

function storeTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${BASE}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.email) setUser(data);
        else clearTokens();
      })
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email, password) => {
    try {
      const res = await fetch(`${BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) return { error: { message: data.error || `Server error (${res.status})` } };
      storeTokens(data.access, data.refresh);
      setUser(data.user);
      return { error: null };
    } catch (err) {
      return { error: { message: `Network error: ${err.message}` } };
    }
  };

  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) return { error: { message: data.error || `Server error (${res.status})` } };
      storeTokens(data.access, data.refresh);
      setUser(data.user);
      return { error: null };
    } catch (err) {
      return { error: { message: `Network error: ${err.message}` } };
    }
  };

  const signOut = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
