import { motion } from 'framer-motion';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.8, repeat: Infinity, ease: 'linear' },
  },
};

export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return (
    <motion.div
      {...shimmer}
      style={{
        width,
        height,
        borderRadius: 4,
        background: 'linear-gradient(90deg, rgba(0,245,255,0.04) 25%, rgba(0,245,255,0.10) 50%, rgba(0,245,255,0.04) 75%)',
        backgroundSize: '400% 100%',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonLine width="40%" height={12} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} width={`${70 + Math.random() * 30}%`} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(0,245,255,0.06)' }}>
      <SkeletonLine width={160} height={13} />
      <SkeletonLine width={70} height={22} style={{ borderRadius: 3 }} />
      <SkeletonLine width={40} height={13} />
      <SkeletonLine width="40%" height={13} />
    </div>
  );
}

export function SkeletonTable({ rows = 8 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}
