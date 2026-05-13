import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { error: AlertTriangle, success: CheckCircle, info: Info, warning: AlertTriangle };
const COLORS = { error: '#ff0040', success: '#39ff14', info: '#00f5ff', warning: '#ff6b00' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9998, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = ICONS[t.type] || Info;
            const color = COLORS[t.type] || COLORS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'rgba(10,22,40,0.97)',
                  border: `1px solid ${color}40`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 6,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  maxWidth: 360,
                  pointerEvents: 'all',
                  backdropFilter: 'blur(12px)',
                  boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${color}15`,
                }}
              >
                <Icon size={16} color={color} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{t.message}</span>
                <button
                  onClick={() => dismiss(t.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
