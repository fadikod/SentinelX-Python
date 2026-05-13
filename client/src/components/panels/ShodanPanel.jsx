import { useState } from 'react';
import { Search, Server, Globe, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL ?? '';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const PORT_RISK = {
  21: { label: 'FTP', risk: 'high' },
  22: { label: 'SSH', risk: 'medium' },
  23: { label: 'Telnet', risk: 'critical' },
  25: { label: 'SMTP', risk: 'medium' },
  80: { label: 'HTTP', risk: 'low' },
  443: { label: 'HTTPS', risk: 'low' },
  445: { label: 'SMB', risk: 'critical' },
  3306: { label: 'MySQL', risk: 'critical' },
  3389: { label: 'RDP', risk: 'critical' },
  5432: { label: 'PostgreSQL', risk: 'critical' },
  6379: { label: 'Redis', risk: 'critical' },
  8080: { label: 'HTTP-Alt', risk: 'medium' },
  8443: { label: 'HTTPS-Alt', risk: 'low' },
  27017: { label: 'MongoDB', risk: 'critical' },
  9200: { label: 'Elasticsearch', risk: 'critical' },
};

const RISK_COLOR = { critical: '#ff0040', high: '#ff6b00', medium: '#ffd700', low: '#39ff14' };

const DEMO_QUERIES = [
  { label: 'Exposed Redis', query: 'port:6379 redis' },
  { label: 'Open MongoDB', query: 'port:27017 mongodb' },
  { label: 'Default RDP', query: 'port:3389 country:US' },
  { label: 'Exposed Elasticsearch', query: 'port:9200 elastic' },
  { label: 'Open MySQL', query: 'port:3306 mysql' },
  { label: 'Exposed Webcams', query: 'has_screenshot:true port:554' },
];

function PortBadge({ port }) {
  const info = PORT_RISK[port];
  const color = info ? RISK_COLOR[info.risk] : 'var(--text-muted)';
  return (
    <span style={{
      fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
      color, background: `${color}18`,
      border: `1px solid ${color}30`,
      padding: '2px 7px', borderRadius: 3,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {port}{info ? ` · ${info.label}` : ''}
    </span>
  );
}

function ServiceRow({ service }) {
  const [open, setOpen] = useState(false);
  const port = service.port;
  const info = PORT_RISK[port];
  const risk = info?.risk || 'low';

  return (
    <div style={{ borderBottom: '1px solid rgba(0,245,255,0.06)' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <PortBadge port={port} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>
          {service.transport?.toUpperCase() || 'TCP'} · {service.product || service._shodan?.module || 'Unknown service'}
          {service.version ? ` ${service.version}` : ''}
        </span>
        {service.banner && (open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />)}
      </div>
      <AnimatePresence>
        {open && service.banner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <pre style={{
              margin: 0, padding: '10px 16px',
              fontSize: 11, color: 'var(--neon-cyan)',
              background: 'rgba(0,245,255,0.03)',
              borderTop: '1px solid rgba(0,245,255,0.06)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              maxHeight: 140, overflowY: 'auto',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {service.banner.substring(0, 500)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HostResult({ data }) {
  const criticalPorts = (data.ports || []).filter(p => PORT_RISK[p]?.risk === 'critical');

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 4 }}>
              {data.ip_str}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              {data.org || 'Unknown Org'} · {data.country_name || data.country_code || 'Unknown'}
              {data.city ? ` · ${data.city}` : ''}
            </div>
            {data.hostnames?.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Hostnames: <span style={{ color: 'var(--text-primary)' }}>{data.hostnames.join(', ')}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--neon-cyan)' }}>
                {(data.ports || []).length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>OPEN PORTS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: criticalPorts.length > 0 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                {criticalPorts.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CRITICAL</div>
            </div>
            {data.vulns && (
              <div style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--neon-red)' }}>
                  {Object.keys(data.vulns).length}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>VULNS</div>
              </div>
            )}
          </div>
        </div>

        {data.ports?.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.ports.map(p => <PortBadge key={p} port={p} />)}
          </div>
        )}

        {data.vulns && Object.keys(data.vulns).length > 0 && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,0,64,0.05)', border: '1px solid rgba(255,0,64,0.15)', borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--neon-red)', marginBottom: 8, fontWeight: 600 }}>⚠ KNOWN VULNERABILITIES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.keys(data.vulns).map(cve => (
                <a key={cve} href={`https://nvd.nist.gov/vuln/detail/${cve}`} target="_blank" rel="noreferrer"
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--neon-red)', background: 'rgba(255,0,64,0.08)', border: '1px solid rgba(255,0,64,0.2)', padding: '2px 8px', borderRadius: 3 }}>
                  {cve}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {data.data?.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,245,255,0.08)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
            EXPOSED SERVICES
          </div>
          {data.data.map((s, i) => <ServiceRow key={i} service={s} />)}
        </div>
      )}
    </motion.div>
  );
}

export default function ShodanPanel() {
  const [mode, setMode] = useState('host');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const lookup = async (val) => {
    const target = val || input;
    if (!target.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const endpoint = mode === 'host'
        ? `/api/shodan/host/${encodeURIComponent(target.trim())}`
        : `/api/shodan/search?query=${encodeURIComponent(target.trim())}`;
      const res = await fetch(`${API}${endpoint}`, { headers: authHeaders() });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); lookup(); };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--neon-cyan)', letterSpacing: 3, marginBottom: 6 }}>▸ SHODAN RECON</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Attack Surface Reconnaissance</h2>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: '1px solid rgba(0,245,255,0.15)', borderRadius: 4, overflow: 'hidden', width: 'fit-content' }}>
        {[{ id: 'host', label: 'Host Lookup', icon: Server }, { id: 'search', label: 'Search', icon: Search }].map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setResult(null); setError(''); }}
              style={{
                padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 8,
                background: mode === m.id ? 'rgba(0,245,255,0.1)' : 'transparent',
                border: 'none', borderRight: m.id === 'host' ? '1px solid rgba(0,245,255,0.15)' : 'none',
                color: mode === m.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 13,
              }}
            >
              <Icon size={14} /> {m.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'host' ? 'Enter IP address (e.g. 8.8.8.8)' : 'Shodan query (e.g. port:6379 redis)'}
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
              <Search size={15} />
              {loading ? 'Scanning...' : 'Recon'}
            </button>
          </form>

          {error && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--neon-orange)', fontSize: 13, marginBottom: 6 }}>
                <AlertTriangle size={16} /> Shodan API Key Required
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Add <span className="mono" style={{ color: 'var(--neon-cyan)' }}>SHODAN_API_KEY</span> to <span className="mono" style={{ color: 'var(--neon-cyan)' }}>backend/.env</span>
                <br />Free API key at <span style={{ color: 'var(--neon-cyan)' }}>shodan.io</span> · 100 query credits/month
              </div>
              {error && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{error}</div>}
            </div>
          )}

          {result && mode === 'host' && <HostResult data={result} />}

          {result && mode === 'search' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                Found <span className="mono" style={{ color: 'var(--neon-cyan)' }}>{result.total?.toLocaleString()}</span> results
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(result.matches || []).slice(0, 20).map((match, i) => (
                  <div key={i} className="card" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontSize: 14, color: 'var(--neon-cyan)', fontWeight: 600 }}>{match.ip_str}</span>
                      <PortBadge port={match.port} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{match.org || 'Unknown'}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{match.location?.country_name || ''}</span>
                    </div>
                    {match.data && (
                      <pre style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>
                        {match.data.substring(0, 200)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 14 }}>QUICK SCANS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO_QUERIES.map(q => (
                <button
                  key={q.label}
                  onClick={() => { setMode('search'); setInput(q.query); lookup(q.query); }}
                  style={{
                    background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)',
                    color: 'var(--text-primary)', padding: '9px 12px', borderRadius: 4,
                    cursor: 'pointer', fontSize: 12, textAlign: 'left', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,245,255,0.04)'}
                >
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{q.label}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--neon-cyan)', opacity: 0.7 }}>{q.query}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 14 }}>PORT RISK LEVELS</div>
            {Object.entries(RISK_COLOR).map(([risk, color]) => (
              <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', flex: 1 }}>{risk}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {Object.entries(PORT_RISK).filter(([, v]) => v.risk === risk).map(([p]) => p).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
