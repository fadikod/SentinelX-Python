import { useEffect, useRef, useState } from 'react';
import { useApi } from '../hooks/useApi';

const SEV_COLOR = { CRITICAL: '#ff0040', HIGH: '#ff6b00', MEDIUM: '#ffd700', LOW: '#39ff14' };

function getSev(cve) {
  const m = cve.metrics;
  return m?.cvssMetricV31?.[0]?.cvssData?.baseSeverity
    || m?.cvssMetricV30?.[0]?.cvssData?.baseSeverity
    || m?.cvssMetricV2?.[0]?.baseSeverity || 'N/A';
}

function getScore(cve) {
  const m = cve.metrics;
  return m?.cvssMetricV31?.[0]?.cvssData?.baseScore
    ?? m?.cvssMetricV30?.[0]?.cvssData?.baseScore
    ?? m?.cvssMetricV2?.[0]?.cvssData?.baseScore ?? null;
}

export default function Ticker() {
  const { data } = useApi('/api/nvd/recent?resultsPerPage=20', { interval: 300000 });
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const cves = data?.vulnerabilities?.map(v => v.cve) || [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || cves.length === 0) return;
    let pos = 0;
    let raf;
    const speed = 0.5;

    const animate = () => {
      if (!paused) {
        pos -= speed;
        if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
        track.style.transform = `translateX(${pos}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [cves, paused]);

  if (cves.length === 0) return null;

  const items = [...cves, ...cves];

  return (
    <div
      style={{
        background: 'rgba(5,10,15,0.95)',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
        overflow: 'hidden',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 14px', borderRight: '1px solid rgba(0,245,255,0.1)',
        flexShrink: 0, background: 'rgba(5,10,15,0.98)', zIndex: 2,
        height: '100%',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 5px var(--neon-green)' }} />
        <span className="mono" style={{ fontSize: 10, color: 'var(--neon-green)', letterSpacing: 2 }}>CVE FEED</span>
      </div>

      <div style={{ overflow: 'hidden', flex: 1, position: 'relative' }}>
        <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', gap: 0, whiteSpace: 'nowrap', willChange: 'transform' }}>
          {items.map((cve, i) => {
            const sev = getSev(cve);
            const score = getScore(cve);
            const color = SEV_COLOR[sev] || 'var(--text-muted)';
            return (
              <span key={`${cve.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRight: '1px solid rgba(0,245,255,0.06)' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--neon-cyan)' }}>{cve.id}</span>
                <span style={{ fontSize: 10, color, background: `${color}20`, padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>{sev}</span>
                {score != null && <span className="mono" style={{ fontSize: 11, color }}>{score}</span>}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cve.descriptions?.find(d => d.lang === 'en')?.value?.substring(0, 80) || ''}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, rgba(5,10,15,1), transparent)', pointerEvents: 'none', zIndex: 2 }} />
    </div>
  );
}
