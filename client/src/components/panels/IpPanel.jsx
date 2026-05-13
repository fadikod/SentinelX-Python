import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Globe, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL ?? '';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const CONFIDENCE_COLOR = (score) => {
  if (score >= 80) return 'var(--neon-red)';
  if (score >= 40) return 'var(--neon-orange)';
  if (score >= 10) return 'var(--neon-orange)';
  return 'var(--neon-green)';
};

function ConfidenceBar({ score }) {
  const color = CONFIDENCE_COLOR(score);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>Abuse Confidence</span>
        <span className="mono" style={{ color, fontWeight: 700 }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 3, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

const KNOWN_BAD = [
  '185.220.101.47', '45.33.32.156', '198.20.69.74', '89.248.167.131',
  '91.92.109.195', '193.32.162.157',
];

export default function IpPanel() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (ipAddr) => {
    const target = ipAddr || ip;
    if (!target.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/abuseipdb/check?ipAddress=${encodeURIComponent(target.trim())}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult(json.data);
      setIp(target.trim());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    lookup();
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--neon-orange)', letterSpacing: 3, marginBottom: 6 }}>▸ ABUSEIPDB</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>IP Reputation Lookup</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              value={ip}
              onChange={e => setIp(e.target.value)}
              placeholder="Enter IP address (e.g. 185.220.101.47)"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}
            >
              <Search size={15} />
              {loading ? 'Checking...' : 'Lookup'}
            </button>
          </form>

          {error && (
            <div className="card" style={{ padding: 20, color: 'var(--neon-red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} />
              {error.includes('API key') || error.includes('401') || error.includes('not configured')
                ? 'AbuseIPDB API key not configured. Add ABUSEIPDB_API_KEY to backend/.env'
                : error}
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: 24 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 8,
                    background: result.abuseConfidenceScore >= 50 ? 'rgba(255,0,64,0.1)' : 'rgba(57,255,20,0.1)',
                    border: `1px solid ${result.abuseConfidenceScore >= 50 ? 'rgba(255,0,64,0.3)' : 'rgba(57,255,20,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {result.abuseConfidenceScore >= 50
                      ? <AlertTriangle size={22} color="var(--neon-red)" />
                      : <CheckCircle size={22} color="var(--neon-green)" />
                    }
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{result.ipAddress}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {result.isp || 'Unknown ISP'} · {result.countryCode || '??'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: CONFIDENCE_COLOR(result.abuseConfidenceScore) }}>
                      {result.abuseConfidenceScore}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ABUSE SCORE</div>
                  </div>
                </div>

                <ConfidenceBar score={result.abuseConfidenceScore} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                  {[
                    { label: 'Total Reports', value: result.totalReports?.toLocaleString() ?? '0', icon: AlertTriangle },
                    { label: 'Distinct Users', value: result.numDistinctUsers?.toLocaleString() ?? '0', icon: Shield },
                    { label: 'Country', value: result.countryName || result.countryCode || 'Unknown', icon: Globe },
                    { label: 'Last Reported', value: result.lastReportedAt ? new Date(result.lastReportedAt).toLocaleDateString() : 'Never', icon: Clock },
                    { label: 'Domain', value: result.domain || 'N/A', icon: Globe },
                    { label: 'Usage Type', value: result.usageType || 'Unknown', icon: Shield },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} style={{ padding: '10px 14px', background: 'rgba(0,245,255,0.03)', borderRadius: 6, border: '1px solid rgba(0,245,255,0.07)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: 0.5 }}>{label}</div>
                      <div className="mono" style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <div className="card" style={{ padding: 20 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 14 }}>KNOWN BAD IPs</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {KNOWN_BAD.map(addr => (
                <button
                  key={addr}
                  onClick={() => { setIp(addr); lookup(addr); }}
                  className="mono"
                  style={{
                    background: 'rgba(255,0,64,0.05)',
                    border: '1px solid rgba(255,0,64,0.15)',
                    color: 'var(--neon-red)',
                    padding: '8px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,64,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,0,64,0.05)'}
                >
                  {addr}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Click any IP for instant reputation check via AbuseIPDB.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
