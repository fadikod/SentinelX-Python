import { useEffect, useRef, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { motion } from 'framer-motion';

const THREATS = [
  { name: 'RU-APT28',    coords: [37.6,  55.75], severity: 'critical', count: 847  },
  { name: 'CN-APT41',    coords: [116.4, 39.9],  severity: 'critical', count: 1203 },
  { name: 'KP-Lazarus',  coords: [125.7, 39.0],  severity: 'high',     count: 392  },
  { name: 'IR-APT33',    coords: [51.4,  35.7],  severity: 'high',     count: 274  },
  { name: 'US-C2',       coords: [-95.7, 37.1],  severity: 'medium',   count: 156  },
  { name: 'NL-Botnet',   coords: [4.9,   52.4],  severity: 'medium',   count: 89   },
  { name: 'BR-Spam',     coords: [-47.9,-15.7],  severity: 'low',      count: 412  },
  { name: 'NG-Fraud',    coords: [3.4,   6.5],   severity: 'low',      count: 203  },
  { name: 'UA-Ransomware',coords:[30.5,  50.4],  severity: 'high',     count: 178  },
  { name: 'RO-Skimmer',  coords: [26.1,  44.4],  severity: 'medium',   count: 67   },
  { name: 'IN-Phishing', coords: [77.2,  28.6],  severity: 'low',      count: 334  },
  { name: 'DE-C2',       coords: [13.4,  52.5],  severity: 'medium',   count: 122  },
];

const SEV_COLOR = { critical:'#ff0040', high:'#ff6b00', medium:'#ffd700', low:'#39ff14' };
const SEV_RADIUS = { critical: 9, high: 7, medium: 5, low: 4 };

export default function ThreatMap() {
  const canvasRef = useRef(null);
  const [world, setWorld] = useState(null);
  const [selected, setSelected] = useState(null);
  const [threats, setThreats] = useState(THREATS);
  const [size, setSize] = useState({ w: 800, h: 420 });
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const pulseRef = useRef(0);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(topo => setWorld(feature(topo, topo.objects.countries)));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setSize({ w: width, h: Math.round(width * 0.46) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setThreats(prev => prev.map(t => ({ ...t, count: t.count + Math.floor(Math.random() * 3) })));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !world) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = size;
    canvas.width = w;
    canvas.height = h;

    const projection = geoNaturalEarth1().fitSize([w, h], world);
    const path = geoPath(projection, ctx);

    const draw = (ts) => {
      pulseRef.current = ts;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#050a0f';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(0,245,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let lon = -180; lon <= 180; lon += 30) {
        const start = projection([lon, -90]);
        const end = projection([lon, 90]);
        if (!start || !end) continue;
        ctx.beginPath(); ctx.moveTo(...start); ctx.lineTo(...end); ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 2) {
          const pt = projection([lon, lat]);
          if (!pt) continue;
          lon === -180 ? ctx.moveTo(...pt) : ctx.lineTo(...pt);
        }
        ctx.stroke();
      }

      world.features.forEach(f => {
        ctx.beginPath();
        path(f);
        ctx.fillStyle = '#0a1628';
        ctx.strokeStyle = '#0d2a45';
        ctx.lineWidth = 0.5;
        ctx.fill();
        ctx.stroke();
      });

      const pulse = (Math.sin(ts * 0.003) + 1) / 2;
      threats.forEach(t => {
        const pt = projection(t.coords);
        if (!pt) return;
        const [x, y] = pt;
        const r = SEV_RADIUS[t.severity];
        const color = SEV_COLOR[t.severity];
        const isSel = selected?.name === t.name;

        const pr = r + 6 + pulse * (t.severity === 'critical' ? 10 : 6);
        const grad = ctx.createRadialGradient(x, y, r, x, y, pr);
        grad.addColorStop(0, color + '40');
        grad.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(x, y, pr, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = isSel ? 1 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        if (isSel) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [world, threats, selected, size]);

  const handleClick = (e) => {
    if (!world) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const { w, h } = size;
    const projection = geoNaturalEarth1().fitSize([w, h], world);

    for (const t of threats) {
      const pt = projection(t.coords);
      if (!pt) continue;
      const dist = Math.hypot(pt[0] - mx, pt[1] - my);
      if (dist < SEV_RADIUS[t.severity] + 8) {
        setSelected(prev => prev?.name === t.name ? null : t);
        return;
      }
    }
    setSelected(null);
  };

  const counts = Object.fromEntries(
    Object.keys(SEV_COLOR).map(s => [s, threats.filter(t => t.severity === s).reduce((a, t) => a + t.count, 0)])
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div className="mono" style={{ fontSize:11, color:'var(--neon-cyan)', letterSpacing:3, marginBottom:6 }}>▸ GLOBAL THREAT MAP</div>
          <h2 style={{ fontSize:22, fontWeight:700 }}>Live Threat Intelligence</h2>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {Object.entries(counts).map(([sev, n]) => (
            <div key={sev} style={{ textAlign:'center' }}>
              <div className="mono" style={{ fontSize:20, fontWeight:700, color:SEV_COLOR[sev] }}>{n.toLocaleString()}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:1 }}>{sev.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div ref={containerRef} style={{ position:'relative', background:'#050a0f' }}>
          {!world && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="mono" style={{ color:'var(--neon-cyan)', fontSize:13, letterSpacing:2 }}>LOADING MAP...</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            style={{ display:'block', width:'100%', cursor:'crosshair' }}
          />
          <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--neon-green)', boxShadow:'0 0 6px var(--neon-green)' }} />
            <span className="mono" style={{ fontSize:10, color:'var(--neon-green)', letterSpacing:2 }}>LIVE</span>
          </div>
        </div>

        {selected && (
          <motion.div
            initial={{ opacity:0, y:6 }}
            animate={{ opacity:1, y:0 }}
            style={{ padding:'14px 20px', borderTop:'1px solid rgba(0,245,255,0.08)', display:'flex', alignItems:'center', gap:24, background:'rgba(10,22,40,0.6)', flexWrap:'wrap' }}
          >
            <div style={{ width:8, height:8, borderRadius:'50%', background:SEV_COLOR[selected.severity], flexShrink:0 }} />
            <div>
              <div className="mono" style={{ fontSize:14, color:SEV_COLOR[selected.severity], fontWeight:600 }}>{selected.name}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{selected.coords[1].toFixed(2)}°N {selected.coords[0].toFixed(2)}°E</div>
            </div>
            <div><div className="mono" style={{ fontSize:14, color:'var(--text-primary)' }}>{selected.count.toLocaleString()}</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>events</div></div>
            <div><div className="mono" style={{ fontSize:12, color:SEV_COLOR[selected.severity], textTransform:'uppercase' }}>{selected.severity}</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>threat level</div></div>
            <button onClick={() => setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:20 }}>×</button>
          </motion.div>
        )}

        <div style={{ padding:'10px 20px', borderTop:'1px solid rgba(0,245,255,0.06)', display:'flex', gap:20, fontSize:11, color:'var(--text-muted)', flexWrap:'wrap' }}>
          {Object.entries(SEV_COLOR).map(([sev, color]) => (
            <div key={sev} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:color }} />
              <span style={{ textTransform:'capitalize' }}>{sev}</span>
            </div>
          ))}
          <span style={{ marginLeft:'auto' }}>Click a marker for details</span>
        </div>
      </div>
    </div>
  );
}
