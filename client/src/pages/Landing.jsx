import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, Globe, Zap, Lock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'CVEs Tracked', value: '240K+', color: 'var(--neon-cyan)' },
  { label: 'Malicious IPs', value: '1.2M+', color: 'var(--neon-red)' },
  { label: 'Threat Feeds', value: 'Live', color: 'var(--neon-green)' },
  { label: 'Uptime', value: '99.9%', color: 'var(--neon-orange)' },
];

const FEATURES = [
  { icon: Activity, title: 'Live CVE Feed', desc: 'Real-time vulnerability data from NVD with CVSS scoring and affected software tracking.', color: 'var(--neon-cyan)' },
  { icon: Globe, title: 'IP Reputation', desc: 'Instant AbuseIPDB lookups — flag malicious actors before they reach your network.', color: 'var(--neon-red)' },
  { icon: Eye, title: 'Shodan Recon', desc: 'Surface exposed services and open ports on any target across the global attack surface.', color: 'var(--neon-orange)' },
  { icon: Zap, title: 'Threat News', desc: 'Curated cybersecurity intelligence delivered in real-time from top security sources.', color: 'var(--neon-green)' },
  { icon: Lock, title: 'JWT Auth', desc: 'Secure, token-based authentication with a Django REST Framework backend and SQLite storage.', color: 'var(--neon-cyan)' },
  { icon: Shield, title: 'Dark Dashboard', desc: 'Operator-grade UI built for low-light SOC environments. Fast. Dense. Actionable.', color: 'var(--neon-orange)' },
];

function GlitchText({ text }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {text}
    </span>
  );
}

function ParticleGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${p.opacity})`;
        ctx.fill();
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 245, 255, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.6,
      }}
    />
  );
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(5, 10, 15, 0.85)',
        borderBottom: '1px solid rgba(0, 245, 255, 0.08)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={22} color="var(--neon-cyan)" />
          <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: 'var(--neon-cyan)', letterSpacing: 2 }}>
            SENTINEL<span style={{ color: 'var(--text-primary)' }}>X</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn-ghost" style={{ padding: '8px 20px', fontSize: 13 }}>
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
            Get Access
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        overflow: 'hidden',
      }}>
        <ParticleGrid />

        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 800 }}
        >
          <div className="mono" style={{
            fontSize: 12,
            color: 'var(--neon-cyan)',
            letterSpacing: 4,
            marginBottom: 24,
            opacity: 0.8,
          }}>
            ▸ THREAT INTELLIGENCE PLATFORM v1.0
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 88px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 24,
          }}>
            <span style={{ color: 'var(--text-primary)' }}>Defend with</span>
            <br />
            <span className="glow-cyan" style={{ color: 'var(--neon-cyan)' }}>
              <GlitchText text="Real Intelligence" />
            </span>
          </h1>

          <p style={{
            fontSize: 18,
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 40px',
          }}>
            Monitor CVEs, track malicious IPs, surface exposed infrastructure, and stay ahead of threats — all from one operator dashboard.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-primary" style={{ fontSize: 15, padding: '13px 36px' }}>
              Launch Dashboard →
            </Link>
            <Link to="/login" className="btn-ghost" style={{ fontSize: 15, padding: '13px 36px' }}>
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            display: 'flex',
            gap: 0,
            marginTop: 80,
            position: 'relative',
            zIndex: 1,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(0,245,255,0.1)',
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '20px 40px',
                background: 'rgba(10, 22, 40, 0.8)',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(0,245,255,0.08)' : 'none',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{
        padding: '100px 48px',
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div className="mono" style={{ color: 'var(--neon-cyan)', fontSize: 12, letterSpacing: 4, marginBottom: 16 }}>
              ▸ CAPABILITIES
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -1 }}>
              Full-Spectrum Threat Visibility
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card"
                  style={{ padding: 28 }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: `rgba(${f.color === 'var(--neon-cyan)' ? '0,245,255' : f.color === 'var(--neon-red)' ? '255,0,64' : f.color === 'var(--neon-green)' ? '57,255,20' : '255,107,0'}, 0.1)`,
                    border: `1px solid ${f.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={20} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 48px',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid rgba(0,245,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mono" style={{ color: 'var(--neon-green)', fontSize: 12, letterSpacing: 4, marginBottom: 20 }}>
            ▸ STATUS: OPERATIONAL
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1, marginBottom: 20 }}>
            Ready to Engage?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, marginBottom: 40 }}>
            Join the analysts who never fly blind.
          </p>
          <Link to="/signup" className="btn-primary" style={{ fontSize: 16, padding: '14px 48px' }}>
            Access SentinelX
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 48px',
        borderTop: '1px solid rgba(0,245,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="var(--neon-cyan)" />
          <span className="mono" style={{ fontSize: 12, color: 'var(--neon-cyan)', letterSpacing: 2 }}>SENTINELX</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          © 2026 — Built for defenders
        </span>
      </footer>
    </div>
  );
}
