import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '../Toast';

const KEYS = [
  {
    id: 'ABUSEIPDB_API_KEY',
    label: 'AbuseIPDB API Key',
    hint: 'Required for IP reputation lookups',
    url: 'https://www.abuseipdb.com/api',
    placeholder: 'Enter your AbuseIPDB key...',
  },
  {
    id: 'NEWS_API_KEY',
    label: 'NewsAPI Key',
    hint: 'Required for threat intelligence news feed',
    url: 'https://newsapi.org',
    placeholder: 'Enter your NewsAPI key...',
  },
  {
    id: 'SHODAN_API_KEY',
    label: 'Shodan API Key',
    hint: 'Required for host recon and search',
    url: 'https://account.shodan.io',
    placeholder: 'Enter your Shodan key...',
  },
  {
    id: 'NVD_API_KEY',
    label: 'NVD API Key',
    hint: 'Optional — increases rate limit from 5/30s to 50/30s',
    url: 'https://nvd.nist.gov/developers/request-an-api-key',
    placeholder: 'Enter your NVD key (optional)...',
  },
];

const STORAGE_PREFIX = 'sentinelx_key_';

function KeyField({ config }) {
  const { toast } = useToast();
  const [value, setValue] = useState(() => localStorage.getItem(STORAGE_PREFIX + config.id) || '');
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (value.trim()) {
      localStorage.setItem(STORAGE_PREFIX + config.id, value.trim());
    } else {
      localStorage.removeItem(STORAGE_PREFIX + config.id);
    }

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/settings/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ key: config.id, value: value.trim() }),
      });
    } catch {
      // server-side update is best-effort; localStorage is the source of truth for now
    }

    setSaved(true);
    toast(`${config.label} saved`, 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const isSet = !!localStorage.getItem(STORAGE_PREFIX + config.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={14} color="var(--neon-cyan)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{config.label}</span>
          {isSet && <span style={{ fontSize: 10, color: 'var(--neon-green)', background: 'rgba(57,255,20,0.1)', padding: '1px 6px', borderRadius: 2 }}>ACTIVE</span>}
        </div>
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          Get key <ExternalLink size={11} />
        </a>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{config.hint}</p>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={config.placeholder}
            style={{
              width: '100%',
              background: 'rgba(0,245,255,0.04)',
              border: '1px solid rgba(0,245,255,0.15)',
              borderRadius: 4,
              padding: '9px 36px 9px 12px',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={() => setVisible(v => !v)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
            }}
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: saved ? 'rgba(57,255,20,0.12)' : 'rgba(0,245,255,0.1)',
            border: `1px solid ${saved ? 'var(--neon-green)' : 'rgba(0,245,255,0.3)'}`,
            borderRadius: 4, padding: '9px 16px', cursor: 'pointer',
            color: saved ? 'var(--neon-green)' : 'var(--neon-cyan)', fontSize: 12, fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {saved ? <CheckCircle size={13} /> : <Save size={13} />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </motion.div>
  );
}

export default function SettingsPanel() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--neon-cyan)', letterSpacing: 3, marginBottom: 8 }}>▸ CONFIGURATION</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
          Configure API keys to unlock all intelligence feeds. Keys are stored locally in your browser and pushed to the Django backend.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
        {KEYS.map(k => <KeyField key={k.id} config={k} />)}
      </div>

      <div className="card" style={{ padding: 20, marginTop: 32, maxWidth: 680, borderColor: 'rgba(255,107,0,0.2)' }}>
        <div style={{ fontSize: 12, color: 'var(--neon-orange)', fontWeight: 600, marginBottom: 8 }}>Security Note</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          API keys are stored in browser localStorage and sent to the local Django server only.
          They are never transmitted to third parties or stored in the cloud.
          Do not share your browser profile or localStorage with untrusted parties.
        </p>
      </div>
    </div>
  );
}
