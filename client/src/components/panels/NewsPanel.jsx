import { useApi } from '../../hooks/useApi';
import { Radio, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SkeletonCard } from '../Skeleton';

const TAGS = ['ransomware', 'malware', 'breach', 'zero-day', 'APT', 'phishing', 'exploit', 'vulnerability'];

function tag(title = '') {
  const lower = title.toLowerCase();
  return TAGS.find(t => lower.includes(t)) || null;
}

const TAG_COLOR = {
  ransomware: 'var(--neon-red)',
  malware: 'var(--neon-red)',
  breach: 'var(--neon-orange)',
  'zero-day': 'var(--neon-red)',
  APT: 'var(--neon-orange)',
  phishing: 'var(--neon-orange)',
  exploit: 'var(--neon-orange)',
  vulnerability: 'var(--neon-orange)',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ArticleCard({ article, index }) {
  const t = tag(article.title);
  const color = t ? TAG_COLOR[t] : 'var(--neon-cyan)';

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        display: 'block',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,245,255,0.06)',
        textDecoration: 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            {t && (
              <span style={{
                fontSize: 10,
                color,
                background: `${color}18`,
                border: `1px solid ${color}40`,
                padding: '1px 7px',
                borderRadius: 3,
                letterSpacing: 0.5,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>{t}</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{article.source?.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(article.publishedAt)}</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500, marginBottom: 4 }}>
            {article.title}
          </div>
          {article.description && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {article.description}
            </div>
          )}
        </div>
        <ExternalLink size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>
    </motion.a>
  );
}

export default function NewsPanel() {
  const { data, loading, error, refetch } = useApi('/api/news/cybersecurity?pageSize=30', { interval: 600000 });
  const articles = data?.articles?.filter(a => a.title && a.title !== '[Removed]') || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--neon-green)', letterSpacing: 3, marginBottom: 6 }}>▸ NEWSAPI LIVE</div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Threat Intelligence News</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {data && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{articles.length} articles</span>}
          <button onClick={refetch} className="btn-ghost" style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
          </div>
        )}

        {error && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <AlertTriangle size={20} color="var(--neon-orange)" style={{ marginBottom: 10 }} />
            <div style={{ color: 'var(--neon-orange)', fontSize: 13, marginBottom: 6 }}>NewsAPI key not configured</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Add NEWS_API_KEY to backend/.env — free tier at newsapi.org</div>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No articles found.</div>
        )}

        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {articles.map((a, i) => <ArticleCard key={a.url || i} article={a} index={i} />)}
        </div>
      </div>
    </div>
  );
}
