import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { AlertTriangle, RefreshCw, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonTable } from '../Skeleton';

const SEVERITY_COLOR = {
  CRITICAL: '#ff0040',
  HIGH: '#ff6b00',
  MEDIUM: '#ffd700',
  LOW: '#39ff14',
  NONE: '#7a9bb5',
};

function getSeverity(cve) {
  const metrics = cve.metrics;
  if (!metrics) return 'NONE';
  const v31 = metrics.cvssMetricV31?.[0]?.cvssData?.baseSeverity;
  const v30 = metrics.cvssMetricV30?.[0]?.cvssData?.baseSeverity;
  const v2 = metrics.cvssMetricV2?.[0]?.baseSeverity;
  return v31 || v30 || v2 || 'NONE';
}

function getScore(cve) {
  const metrics = cve.metrics;
  if (!metrics) return null;
  return (
    metrics.cvssMetricV31?.[0]?.cvssData?.baseScore ??
    metrics.cvssMetricV30?.[0]?.cvssData?.baseScore ??
    metrics.cvssMetricV2?.[0]?.cvssData?.baseScore ??
    null
  );
}

function CveRow({ cve, index }) {
  const [expanded, setExpanded] = useState(false);
  const id = cve.id;
  const severity = getSeverity(cve);
  const score = getScore(cve);
  const desc = cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description.';
  const published = new Date(cve.published).toLocaleDateString();
  const color = SEVERITY_COLOR[severity] || SEVERITY_COLOR.NONE;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ borderBottom: '1px solid rgba(0,245,255,0.06)' }}
    >
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 80px 70px 1fr',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span className="mono" style={{ fontSize: 13, color: 'var(--neon-cyan)' }}>{id}</span>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color,
          background: `${color}18`,
          border: `1px solid ${color}40`,
          padding: '2px 8px',
          borderRadius: 3,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}>{severity}</span>
        <span className="mono" style={{ fontSize: 14, color, fontWeight: 700 }}>
          {score != null ? score.toFixed(1) : '—'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {desc}
        </span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '12px 16px 16px',
              background: 'rgba(0,245,255,0.02)',
              borderTop: '1px solid rgba(0,245,255,0.06)',
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 12 }}>{desc}</p>
              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Published: <span style={{ color: 'var(--text-primary)' }}>{published}</span></span>
                <a
                  href={`https://nvd.nist.gov/vuln/detail/${id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={e => e.stopPropagation()}
                >
                  NVD <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CvePanel() {
  const [severity, setSeverity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [inputVal, setInputVal] = useState('');

  const queryStr = keyword
    ? `/api/nvd/search?keyword=${encodeURIComponent(keyword)}&resultsPerPage=25${severity ? `&severity=${severity}` : ''}`
    : `/api/nvd/recent?resultsPerPage=25`;

  const { data, loading, error, refetch } = useApi(queryStr, { interval: 300000 });

  const cves = data?.vulnerabilities?.map(v => v.cve) || [];

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(inputVal);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--neon-red)', letterSpacing: 3, marginBottom: 6 }}>▸ NVD LIVE FEED</div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>CVE Vulnerability Feed</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Search CVEs..."
              style={{ width: 180, padding: '7px 12px', fontSize: 13 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={14} />
            </button>
          </form>
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value)}
            style={{ width: 130, padding: '7px 12px', fontSize: 13 }}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button onClick={refetch} className="btn-ghost" style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 80px 70px 1fr',
          gap: 12,
          padding: '10px 16px',
          borderBottom: '1px solid rgba(0,245,255,0.1)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: 1,
        }}>
          <span>CVE ID</span>
          <span>SEVERITY</span>
          <span>SCORE</span>
          <span>DESCRIPTION</span>
        </div>

        {loading && <SkeletonTable rows={10} />}

        {error && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--neon-red)', fontSize: 13 }}>
            <AlertTriangle size={16} style={{ marginBottom: 8 }} />
            <div>Error: {error}</div>
            <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 12 }}>Make sure the Django server is running on port 8000</div>
          </div>
        )}

        {!loading && !error && cves.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No results found.</div>
        )}

        {!loading && cves.map((cve, i) => <CveRow key={cve.id} cve={cve} index={i} />)}
      </div>

      {data && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          Showing {cves.length} of {data.totalResults?.toLocaleString()} results · Auto-refreshes every 5 min
        </div>
      )}
    </div>
  );
}
