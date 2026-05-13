import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonTable } from '../components/Skeleton';
import {
  Shield, Activity, Globe, LogOut, Menu, X,
  AlertTriangle, TrendingUp, Radio, Map, Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import Ticker from '../components/Ticker';
import CvePanel from '../components/panels/CvePanel';
import ThreatMap from '../components/panels/ThreatMap';
import IpPanel from '../components/panels/IpPanel';
import NewsPanel from '../components/panels/NewsPanel';
import ShodanPanel from '../components/panels/ShodanPanel';
import SettingsPanel from '../components/panels/SettingsPanel';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'map', label: 'Threat Map', icon: Map },
  { id: 'cve', label: 'CVE Feed', icon: AlertTriangle },
  { id: 'ipcheck', label: 'IP Lookup', icon: Globe },
  { id: 'news', label: 'Threat News', icon: Radio },
  { id: 'shodan', label: 'Recon', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];


function Sidebar({ active, onNav, collapsed, onToggle, onSignOut }) {
  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid rgba(0,245,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0,
    }}>
      <div style={{
        padding: collapsed ? '20px 18px' : '20px 20px',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <Shield size={20} color="var(--neon-cyan)" style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span className="mono" style={{ fontSize: 15, color: 'var(--neon-cyan)', letterSpacing: 2, fontWeight: 600 }}>
            SENTINEL<span style={{ color: 'var(--text-primary)' }}>X</span>
          </span>
        )}
        <button
          onClick={onToggle}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                width: '100%',
                padding: collapsed ? '12px 20px' : '11px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isActive ? 'rgba(0,245,255,0.07)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--neon-cyan)' : 'var(--text-muted)',
                fontSize: 13,
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 0', borderTop: '1px solid rgba(0,245,255,0.08)' }}>
        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            padding: collapsed ? '12px 20px' : '11px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}


function LiveStatCard({ label, color, value, delta, loading }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="mono" style={{ fontSize: 32, fontWeight: 700, color }}>
          {loading ? '—' : value}
        </span>
        {delta != null && (
          <span className="mono" style={{ fontSize: 12, color: 'var(--neon-green)' }}>{delta}</span>
        )}
      </div>
    </motion.div>
  );
}

function Overview() {
  const { toast } = useToast();
  const { data: critData, loading: critLoading } = useApi('/api/nvd/search?severity=CRITICAL&resultsPerPage=1');
  const { data: highData, loading: highLoading } = useApi('/api/nvd/search?severity=HIGH&resultsPerPage=1');
  const { data: recentData, loading: recentLoading } = useApi('/api/nvd/recent?resultsPerPage=10');
  const toastedRef = useRef(new Set());

  useEffect(() => {
    if (!recentData?.vulnerabilities) return;
    recentData.vulnerabilities.slice(0, 3).forEach(({ cve }) => {
      if (toastedRef.current.has(cve.id)) return;
      const sev = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity
        || cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity || '';
      if (sev === 'CRITICAL') {
        toastedRef.current.add(cve.id);
        toast(`Critical CVE detected: ${cve.id}`, 'error', 6000);
      }
    });
  }, [recentData, toast]);

  const recentCves = recentData?.vulnerabilities?.map(v => v.cve) || [];

  const stats = [
    { label: 'Total Critical CVEs', color: 'var(--neon-red)', value: critData?.totalResults?.toLocaleString(), loading: critLoading },
    { label: 'Total High CVEs', color: 'var(--neon-orange)', value: highData?.totalResults?.toLocaleString(), loading: highLoading },
    { label: 'NVD Total CVEs', color: 'var(--neon-cyan)', value: recentData?.totalResults?.toLocaleString(), loading: recentLoading },
    { label: 'Feed Status', color: 'var(--neon-green)', value: 'LIVE', delta: '● active' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--neon-cyan)', letterSpacing: 3, marginBottom: 8 }}>▸ THREAT OVERVIEW</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Intelligence Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Real-time threat data across all integrated feeds.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} transition={{ delay: i * 0.06 }}>
            <LiveStatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 16 }}>▸ LATEST CVEs FROM NVD</div>
        {recentLoading && <SkeletonTable rows={6} />}
        {recentCves.map((cve, i) => {
          const severity = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity
            || cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity
            || cve.metrics?.cvssMetricV2?.[0]?.baseSeverity || 'N/A';
          const score = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore
            ?? cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore
            ?? cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore;
          const desc = cve.descriptions?.find(d => d.lang === 'en')?.value || '';
          const sevColor = { CRITICAL: '#ff0040', HIGH: '#ff6b00', MEDIUM: '#ffd700', LOW: '#39ff14' }[severity] || 'var(--text-muted)';
          return (
            <div key={cve.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentCves.length - 1 ? '1px solid rgba(0,245,255,0.06)' : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor, flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 13, color: 'var(--neon-cyan)', flexShrink: 0, width: 160 }}>{cve.id}</span>
              <span style={{ fontSize: 11, color: sevColor, background: `${sevColor}18`, border: `1px solid ${sevColor}30`, padding: '1px 7px', borderRadius: 3, flexShrink: 0 }}>{severity}</span>
              {score != null && <span className="mono" style={{ fontSize: 12, color: sevColor, flexShrink: 0, width: 36 }}>{score}</span>}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


const PANEL_MAP = {
  overview: <Overview />,
  map: <ThreatMap />,
  cve: <CvePanel />,
  ipcheck: <IpPanel />,
  news: <NewsPanel />,
  shodan: <ShodanPanel />,
  settings: <SettingsPanel />,
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar
        active={active}
        onNav={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        onSignOut={handleSignOut}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Ticker />
        <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
            paddingBottom: 16,
            borderBottom: '1px solid rgba(0,245,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 6px var(--neon-green)' }} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--neon-green)', letterSpacing: 2 }}>LIVE</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {user?.email}
            </div>
          </div>

          <motion.div
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {PANEL_MAP[active]}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
