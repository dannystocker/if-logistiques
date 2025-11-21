import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  FastForward,
  MapPin,
  MessageCircle,
  Package,
  Pause,
  Play,
  ShieldAlert,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Volume2,
  VolumeX
} from 'lucide-react';

/**
 * GEDIMAT LUNEL NEGOCE - SIMULATEUR STRATÉGIQUE V3.55 (CINEMA MODE)
 * Vise à rendre tangible le rapport "Fidélisation par l'Excellence Logistique"
 * - Horloge LED + compte à rebours accéléré
 * - Flashcards plein écran puis retour en colonne
 * - Carte logistique animée (camions/navette, états)
 * - WhatsApp Chantier Direct en plein écran (auteur EXCEL)
 * - Journal MAJ EXCEL, objectifs pédagogiques
 */

// ------------------------- CONSTANTS & STYLES -------------------------
const COLORS = {
  bg: '#0f172a',
  card: '#1e293b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  primary: '#3b82f6',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: 'rgba(255,255,255,0.1)'
};

// Inject keyframes once
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes slideIn { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
  @keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
`;
document.head.appendChild(styleSheet);

const STYLES: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    height: '72px',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 18px',
    zIndex: 30
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr 320px',
    height: 'calc(100vh - 72px)',
    overflow: 'hidden'
  },
  colLeft: {
    borderRight: `1px solid ${COLORS.border}`,
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    background: 'linear-gradient(180deg, rgba(30,41,59,0.5), rgba(15,23,42,0.6))',
    position: 'relative'
  },
  colCenter: {
    position: 'relative',
    background: 'radial-gradient(circle at 30% 20%, #1e293b 0%, #0f172a 65%)',
    overflow: 'hidden'
  },
  colRight: {
    borderLeft: `1px solid ${COLORS.border}`,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, rgba(30,41,59,0.5), rgba(15,23,42,0.6))'
  },
  flashCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: '14px',
    padding: '18px',
    boxShadow: '0 14px 30px -12px rgba(0,0,0,0.5)',
    animation: 'popIn 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  logContainer: {
    flex: 1,
    padding: '14px',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    justifyContent: 'flex-end'
  }
};

// --------------------------- AUDIO ENGINE ---------------------------
class SoundEngine {
  ctx: AudioContext | null = null;
  muted = false;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  click() { this.playTone(850, 'sine', 0.08, 0.05); }
  whoosh() { this.playTone(280, 'sine', 0.25, 0.08); }
  alert() { this.playTone(440, 'square', 0.12, 0.08); setTimeout(() => this.playTone(440, 'square', 0.12, 0.08), 140); }
  type() { this.playTone(620 + Math.random() * 120, 'triangle', 0.05, 0.02); }
  success() {
    this.playTone(440, 'sine', 0.18, 0.08);
    setTimeout(() => this.playTone(554, 'sine', 0.18, 0.08), 90);
    setTimeout(() => this.playTone(659, 'sine', 0.25, 0.08), 180);
  }
}
const sfx = new SoundEngine();

// ------------------------------ UTILS ------------------------------
const fmtTime = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

// ---------------------------- COMPONENTS ----------------------------
const StatCounter = ({ label, value, type }: { label: string; value: number; type: 'cost' | 'profit' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
    <span style={{ fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {type === 'cost' ? <TrendingDown size={18} color={COLORS.danger} /> : <TrendingUp size={18} color={COLORS.success} />}
      <span style={{ fontSize: 20, fontWeight: 'bold', color: type === 'cost' ? COLORS.danger : COLORS.success, fontFamily: 'monospace' }}>
        {value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
      </span>
    </div>
  </div>
);

const LEDClock = ({
  time,
  speed,
  countdownLabel,
  countdownMinutes
}: {
  time: string;
  speed: number;
  countdownLabel: string;
  countdownMinutes: number;
}) => {
  const pct = Math.max(0, Math.min(100, 100 - (countdownMinutes / 60) * 100));
  return (
    <div style={{
      position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
      backgroundColor: '#050505', padding: '10px 26px', borderRadius: 10,
      border: '2px solid #222', boxShadow: '0 0 16px rgba(239,68,68,0.25)', zIndex: 20,
      minWidth: 260
    }}>
      <div style={{ fontSize: 10, color: '#555', letterSpacing: '2px', marginBottom: 4, textAlign: 'center' }}>HEURE RAPIDE</div>
      <div style={{ fontSize: 34, fontFamily: 'monospace', fontWeight: 'bold', color: '#ef4444', textAlign: 'center', textShadow: '0 0 10px rgba(239,68,68,0.8)' }}>
        {time}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        <Clock size={14} color={COLORS.warning} /> {countdownLabel} ({Math.max(countdownMinutes, 0)} min)
      </div>
      <div style={{ marginTop: 6, height: 6, backgroundColor: '#1f2937', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
      </div>
      {speed > 1 && <div style={{ textAlign: 'center', marginTop: 4, fontSize: 10, color: COLORS.primary }}>x{speed} SPEED</div>}
    </div>
  );
};

type OrderState = {
  id: string;
  pos: { x: number; y: number };
  duration: number;
  color: string;
  label?: string;
  type?: 'truck' | 'box';
};

const LogisticsMap = ({ orders }: { orders: OrderState[] }) => {
  const NODES = {
    supplier: { x: 16, y: 22, label: 'Fournisseur', icon: <Package size={18} color={COLORS.warning} /> },
    meru: { x: 48, y: 30, label: 'Dépôt Méru', icon: <Building2 size={18} color={COLORS.primary} /> },
    gisors: { x: 48, y: 72, label: 'Hub Gisors', icon: <Building2 size={18} color={COLORS.primary} /> },
    client: { x: 82, y: 50, label: 'Chantier VIP', icon: <Users size={18} color={COLORS.success} /> }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1="16%" y1="22%" x2="48%" y2="30%" stroke="#334155" strokeWidth="2" strokeDasharray="5,6" />
        <line x1="16%" y1="22%" x2="48%" y2="72%" stroke="#334155" strokeWidth="2" strokeDasharray="5,6" />
        <line x1="48%" y1="30%" x2="48%" y2="72%" stroke={COLORS.primary} strokeWidth="5" opacity="0.25" />
        <line x1="48%" y1="30%" x2="82%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="5,6" />
        <line x1="48%" y1="72%" x2="82%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="5,6" />
      </svg>

      {Object.entries(NODES).map(([key, node]) => (
        <div key={key} style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{
            width: 42, height: 42, backgroundColor: COLORS.card, border: `2px solid ${COLORS.border}`,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.35)'
          }}>
            {node.icon}
          </div>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, backgroundColor: 'rgba(0,0,0,0.45)', padding: '4px 8px', borderRadius: 6, marginTop: 6 }}>
            {node.label}
          </div>
        </div>
      ))}

      {orders.map(order => (
        <div key={order.id} style={{
          position: 'absolute',
          left: `${order.pos.x}%`,
          top: `${order.pos.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: `all ${order.duration}ms linear`,
          zIndex: 15
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            backgroundColor: order.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${order.color}`
          }}>
            {order.type === 'box' ? <Package size={16} color="#fff" /> : <Truck size={16} color="#fff" />}
          </div>
          {order.label && (
            <div style={{
              position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
              fontSize: 11, backgroundColor: 'rgba(0,0,0,0.65)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap'
            }}>
              {order.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const DecisionLog = ({ logs }: { logs: any[] }) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={14} /> DÉCISIONS EN TEMPS RÉEL
      </div>
      <div style={STYLES.logContainer}>
        {logs.map((log, i) => (
          <div key={i} style={{
            fontSize: 12, padding: '10px', borderRadius: 8,
            backgroundColor: 'rgba(0,0,0,0.22)', borderLeft: `3px solid ${log.type === 'good' ? COLORS.success : COLORS.danger}`,
            animation: 'slideIn 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', opacity: 0.7 }}>{log.time}</span>
              <span style={{ fontWeight: 'bold', color: log.type === 'good' ? COLORS.success : COLORS.danger }}>{log.impact}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{log.text}</span>
              {log.excel && <span style={{ fontSize: 10, backgroundColor: 'rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: 6 }}>MAJ EXCEL</span>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

const ObjectiveList = ({ objectives }: { objectives: Record<string, boolean> }) => (
  <div style={{ marginTop: 8 }}>
    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6, letterSpacing: '1px' }}>OBJECTIFS À MAÎTRISER</div>
    {[
      ['sync', 'Synchroniser J-1 (14:00)'],
      ['planB', 'Plan B à 15:30 (Taxi-Colis)'],
      ['whatsapp', 'Informer en direct sur WhatsApp'],
      ['stock', 'Éviter stock mort (double peine)'],
      ['stress', 'Gérer incident chauffeur'],
      ['relation', 'Relationnel/NPS client']
    ].map(([key, label]) => (
      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 4 }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          backgroundColor: objectives[key] ? COLORS.success : '#6b7280',
          boxShadow: objectives[key] ? `0 0 0 6px ${COLORS.success}30` : 'none',
          transition: 'all 0.2s'
        }} />
        <span style={{ color: objectives[key] ? '#fff' : COLORS.textMuted }}>{label}</span>
      </div>
    ))}
  </div>
);

const FlashcardOverlay = ({ flashcard, focus }: { flashcard: any; focus: boolean }) => {
  if (!flashcard || !focus) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40
    }}>
      <div style={{ ...STYLES.flashCard, maxWidth: 480 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: COLORS.primary, marginBottom: 10 }}>
          <ShieldAlert size={22} /> {flashcard.title}
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{flashcard.content}</p>
        <div style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, fontSize: 13 }}>
          <div style={{ color: COLORS.textMuted, textTransform: 'uppercase', fontSize: 11, letterSpacing: '1px', marginBottom: 6 }}>Pourquoi</div>
          <div style={{ marginBottom: 10 }}>{flashcard.why}</div>
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 8, fontWeight: 'bold', color: COLORS.warning, display: 'flex', justifyContent: 'space-between' }}>
            <span>Impact</span>
            <span>{flashcard.impact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FullscreenWhatsApp = ({ show, messages, isTyping, groupName }: any) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 45,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)',
      animation: 'popIn 0.3s ease'
    }}>
      <div style={{
        width: 420, height: 640, backgroundColor: '#fff', borderRadius: 26,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 28px 60px rgba(0,0,0,0.6)', border: '8px solid #1e293b'
      }}>
        <div style={{ backgroundColor: '#075e54', padding: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 'bold' }}>{groupName}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>EXCEL, Client, Commercial, Logistique</div>
          </div>
        </div>
        <div style={{
          flex: 1, backgroundColor: '#ece5dd', padding: 18,
          display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto'
        }}>
          {messages.map((m: any, i: number) => (
            <div key={i} style={{
              alignSelf: m.isMe ? 'flex-end' : 'flex-start',
              backgroundColor: m.isMe ? '#dcf8c6' : '#fff',
              padding: '10px 14px', borderRadius: 10, fontSize: 14, color: '#000',
              maxWidth: '85%', boxShadow: '0 1px 1px rgba(0,0,0,0.15)',
              animation: 'popIn 0.2s ease'
            }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>{m.author || 'EXCEL'}</div>
              {m.text}
              <div style={{ fontSize: 10, textAlign: 'right', opacity: 0.55, marginTop: 4 }}>{m.time}</div>
            </div>
          ))}
          {isTyping && (
            <div style={{ alignSelf: 'flex-end', backgroundColor: '#dcf8c6', padding: '10px 14px', borderRadius: 10, fontSize: 12, color: '#000' }}>
              <span style={{ animation: 'blink 1s infinite' }}>EXCEL écrit...</span>
            </div>
          )}
        </div>
        <div style={{ padding: 14, backgroundColor: '#f0f0f0', borderTop: '1px solid #ddd' }}>
          <div style={{ height: 40, backgroundColor: '#fff', borderRadius: 18, padding: '10px 14px', fontSize: 13, color: '#999', display: 'flex', alignItems: 'center' }}>
            Message...
          </div>
        </div>
      </div>
    </div>
  );
};

const VirtualCursor = ({ x, y, clicking }: { x: number; y: number; clicking: boolean }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, transform: `translate(${x}px, ${y}px)`,
    transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)', pointerEvents: 'none', zIndex: 9999
  }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))' }}>
      <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="white" stroke="black" strokeWidth="2" />
    </svg>
    {clicking && (
      <div style={{
        position: 'absolute', top: -8, left: -8, width: 36, height: 36,
        borderRadius: '50%', border: `2px solid ${COLORS.primary}`, animation: 'popIn 0.25s ease-out'
      }} />
    )}
  </div>
);

// ------------------------------ MAIN APP ------------------------------
export default function GedimatSimulator() {
  const [metrics, setMetrics] = useState({ waste: 0, savings: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [cursor, setCursor] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2, clicking: false });

  const [module, setModule] = useState(0);
  const [flashcard, setFlashcard] = useState<any>(null);
  const [flashFocus, setFlashFocus] = useState(false);
  const [mapOrders, setMapOrders] = useState<OrderState[]>([]);
  const [timeMinutes, setTimeMinutes] = useState(14 * 60);
  const [targetMinutes, setTargetMinutes] = useState(14 * 60 + 5);
  const [countdownLabel, setCountdownLabel] = useState('Vers 15:30');

  const [phone, setPhone] = useState({ show: false, messages: [] as any[], isTyping: false, group: '' });
  const [objectives, setObjectives] = useState<Record<string, boolean>>({
    sync: false, planB: false, whatsapp: false, stock: false, stress: false, relation: false
  });

  const [speed, setSpeed] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const startBtnRef = useRef<HTMLButtonElement>(null);
  const btnActionRef = useRef<HTMLButtonElement>(null);

  const clockStr = useMemo(() => fmtTime(timeMinutes), [timeMinutes]);
  const countdownMinutes = Math.max(targetMinutes - timeMinutes, 0);

  // Helpers
  const addLog = (time: string, text: string, type: 'good' | 'bad', impact: string, excel = false) => {
    setLogs(prev => [...prev, { time, text, type, impact, excel }]);
    if (type === 'good') sfx.success(); else sfx.alert();
  };

  const moveCursor = (ref: React.RefObject<HTMLElement>, delay: number, callback?: () => void) => {
    setTimeout(() => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setCursor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false });
        setTimeout(() => {
          setCursor(prev => ({ ...prev, clicking: true }));
          sfx.click();
          setTimeout(() => {
            setCursor(prev => ({ ...prev, clicking: false }));
            if (callback) callback();
          }, 260 / speed);
        }, 700 / speed);
      }
    }, delay / speed);
  };

  const showFlashcard = (fc: any) => {
    setFlashcard(fc);
    setFlashFocus(true);
    sfx.whoosh();
    setTimeout(() => setFlashFocus(false), 1800 / speed);
  };

  const typeMessage = (text: string, group: string, author = 'EXCEL', timeLabel?: string, callback?: () => void) => {
    setPhone({ show: true, messages: [], isTyping: true, group });
    const typingInterval = setInterval(() => { if (Math.random() > 0.4) sfx.type(); }, 110);
    setTimeout(() => {
      clearInterval(typingInterval);
      setPhone(prev => ({
        ...prev,
        isTyping: false,
        messages: [...prev.messages, { text, isMe: true, author, time: timeLabel || clockStr }]
      }));
      sfx.success();
      setTimeout(() => {
        setPhone(prev => ({ ...prev, show: false }));
        callback && callback();
      }, 2200 / speed);
    }, 2600 / speed);
  };

  const updateMapOrder = (id: string, pos: { x: number; y: number }, duration: number, color: string, label?: string, type: 'truck' | 'box' = 'truck') => {
    setMapOrders(prev => {
      const existing = prev.find(o => o.id === id);
      if (existing) {
        return prev.map(o => o.id === id ? { ...o, pos, duration: duration / speed, color, label, type } : o);
      }
      return [...prev, { id, pos, duration: duration / speed, color, label, type }];
    });
  };

  // Timer ticks forward continually toward target
  useEffect(() => {
    const id = setInterval(() => {
      setTimeMinutes(m => Math.min(m + 1 * speed, targetMinutes));
    }, 600);
    return () => clearInterval(id);
  }, [speed, targetMinutes]);

  // Scenario engine
  useEffect(() => {
    let timeout: any;

    const run = () => {
      // INTRO
      if (module === 0) {
        setTimeMinutes(14 * 60);
        setTargetMinutes(14 * 60 + 1);
        setCountdownLabel('Vers 14:00');
        setMapOrders([]);
        setFlashcard(null);
        timeout = setTimeout(() => {
          if (startBtnRef.current) moveCursor(startBtnRef, 600, () => setModule(1));
        }, 900);
      }

      // MODULE 1: CHECK J-1
      if (module === 1) {
        setTimeMinutes(14 * 60);
        setTargetMinutes(14 * 60 + 5);
        setCountdownLabel('Vers 14:05 (Check J-1)');
        setMapOrders([]);

        updateMapOrder('g1', { x: 16, y: 22 }, 0, COLORS.warning, 'Tuiles (Gisors)');
        updateMapOrder('g2', { x: 18, y: 24 }, 0, COLORS.warning, 'Ciment (Méru)');

        showFlashcard({
          title: 'CHECK J-1 (14:00)',
          content: 'Deux commandes Fournisseur Beauvais détectées pour Gisors et Méru.',
          why: 'Sans consolidation : 2 camions facturés, 0 synergie.',
          impact: 'Risque -360€ (double affrètement)'
        });

        moveCursor(btnActionRef, 3000, () => {
          addLog('14:05', 'Consolidation Gisors+Méru validée', 'good', '+180€', true);
          setObjectives(prev => ({ ...prev, sync: true, relation: true }));
          setMetrics(prev => ({ ...prev, savings: prev.savings + 180 }));
          setFlashcard(null);

          updateMapOrder('g1', { x: 48, y: 30 }, 1800, COLORS.success, 'Groupage');
          updateMapOrder('g2', { x: 48, y: 30 }, 1800, COLORS.success, '');

          setTimeout(() => {
            updateMapOrder('g1', { x: 48, y: 72 }, 2000, COLORS.primary, 'Navette Interne');
            setTimeout(() => setModule(2), 2400 / speed);
          }, 2000 / speed);
        });
      }

      // MODULE 2: PROTOCOLE 15:30
      if (module === 2) {
        setTimeMinutes(15 * 60 + 30);
        setTargetMinutes(15 * 60 + 45);
        setCountdownLabel('Décision Plan B avant 15:45');
        setMapOrders([]);
        updateMapOrder('p1', { x: 16, y: 22 }, 0, COLORS.danger, 'Médiafret silencieux');

        showFlashcard({
          title: 'PROTOCOLE 15:30',
          content: 'Silence radio du transporteur. Le chantier risque la rupture demain.',
          why: 'Attendre 17:00 = client en colère et chantier à l’arrêt.',
          impact: 'Perte client, surcoût chantier'
        });

        moveCursor(btnActionRef, 3400, () => {
          addLog('15:45', 'Plan B Taxi-Colis activé', 'good', 'Client sauvé', true);
          addLog('15:45', 'Surcoût Taxi accepté', 'bad', '-50€', true);
          setObjectives(prev => ({ ...prev, planB: true }));
          setMetrics(prev => ({ ...prev, waste: prev.waste + 50, savings: prev.savings + 2000 }));
          setFlashcard(null);
          updateMapOrder('p1', { x: 82, y: 50 }, 1400, COLORS.warning, 'Taxi-Colis Express');
          setTimeout(() => setModule(3), 1800 / speed);
        });
      }

      // MODULE 3: WHATSAPP DIRECT (EXCEL écrit)
      if (module === 3) {
        setTimeMinutes(16 * 60);
        setTargetMinutes(16 * 60 + 3);
        setCountdownLabel('Informer le client à 16:00');
        setMapOrders([]);

        showFlashcard({
          title: 'WHATSAPP CHANTIER DIRECT',
          content: 'EXCEL doit prévenir le client AVANT qu’il ne s’inquiète.',
          why: 'Transparence immédiate = confiance.',
          impact: 'Fidélisation et temps gagné'
        });

        moveCursor(btnActionRef, 2800, () => {
          setFlashcard(null);
          typeMessage(
            "⚠️ EXCEL : Taxi-colis confirmé. Arrivée chantier 08h00. Vous pouvez maintenir la pose à 10h. On reste connectés.",
            'Chantier DURAND (VIP)',
            'EXCEL',
            '16:00',
            () => {
              addLog('16:02', 'Client rassuré (WhatsApp)', 'good', 'Confiance++', true);
              setObjectives(prev => ({ ...prev, whatsapp: true, relation: true }));
              setMetrics(prev => ({ ...prev, savings: prev.savings + 500 }));
              setModule(4);
            }
          );
        });
      }

      // MODULE 4: STOCK MORT
      if (module === 4) {
        setTimeMinutes(14 * 60 + 15);
        setTargetMinutes(14 * 60 + 30);
        setCountdownLabel('Reroutage avant annulation');
        setMapOrders([]);
        updateMapOrder('s1', { x: 48, y: 72 }, 0, COLORS.danger, 'Commande spéciale en péril', 'box');

        showFlashcard({
          title: 'RISQUE STOCK MORT',
          content: 'Commande spéciale : le client menace d’annuler.',
          why: 'Double peine : marge perdue + stock invendable.',
          impact: '-6 000€ évitables'
        });

        moveCursor(btnActionRef, 3000, () => {
          addLog('14:30', 'Reroutage immédiat validé', 'good', '6 000€ sauvés', true);
          setObjectives(prev => ({ ...prev, stock: true }));
          setMetrics(prev => ({ ...prev, savings: prev.savings + 6000 }));
          setFlashcard(null);
          updateMapOrder('s1', { x: 82, y: 50 }, 1800, COLORS.success, 'Reroutage client', 'truck');
          setTimeout(() => setModule(5), 2200 / speed);
        });
      }

      // MODULE 5: STRESS TEST CHAUFFEUR
      if (module === 5) {
        setTimeMinutes(11 * 60);
        setTargetMinutes(11 * 60 + 6);
        setCountdownLabel('Prévenir avant 11:06');
        setMapOrders([]);
        updateMapOrder('c1', { x: 48, y: 30 }, 0, COLORS.danger, 'Chauffeur bloqué');

        showFlashcard({
          title: 'STRESS TEST INCIDENT',
          content: 'J-0, 11:00. Chauffeur bloqué. VIP attend.',
          why: 'Silence = perte client. Transparence = récupération.',
          impact: 'Satisfaction préservée'
        });

        moveCursor(btnActionRef, 3000, () => {
          setFlashcard(null);
          typeMessage(
            "🚨 EXCEL : Chauffeur bloqué. Nouvelle ETA 13h00. On suit en direct, le chef de dépôt est mobilisé.",
            'Chantier VIP (Incident chauffeur)',
            'EXCEL',
            '11:03',
            () => {
              addLog('11:05', 'Transparence immédiate', 'good', 'Fidélité', true);
              setObjectives(prev => ({ ...prev, stress: true, relation: true }));
              setMetrics(prev => ({ ...prev, savings: prev.savings + 1000 }));
              setModule(6);
            }
          );
        });
      }
    };

    run();
    return () => clearTimeout(timeout);
  }, [module, speed, clockStr, targetMinutes]);

  // ------------------------------ RENDER ------------------------------
  return (
    <div style={STYLES.container}>
      {/* HEADER */}
      <div style={STYLES.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, backgroundColor: COLORS.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package color="#fff" size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 17 }}>GEDIMAT <span style={{ color: COLORS.primary }}>XCEL</span></div>
            <div style={{ fontSize: 10, color: COLORS.textMuted }}>CINEMA MODE v3.55</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: 10 }}>
          <button
            onClick={() => { sfx.init(); setAudioEnabled(!sfx.toggleMute()); }}
            style={{ background: 'none', border: 'none', color: audioEnabled ? COLORS.success : COLORS.textMuted, cursor: 'pointer' }}
            aria-label="Audio"
          >
            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <div style={{ width: 1, height: 20, backgroundColor: COLORS.border }} />
          <button onClick={() => setSpeed(1)} style={{ background: 'none', border: 'none', color: speed === 1 ? COLORS.primary : COLORS.textMuted, cursor: 'pointer' }} aria-label="Vitesse x1">
            <Play size={18} />
          </button>
          <button onClick={() => setSpeed(2)} style={{ background: 'none', border: 'none', color: speed === 2 ? COLORS.primary : COLORS.textMuted, cursor: 'pointer' }} aria-label="Vitesse x2">
            <FastForward size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <StatCounter label="Pertes Évitées" value={metrics.waste} type="cost" />
          <StatCounter label="Gains Stratégiques" value={metrics.savings} type="profit" />
        </div>
      </div>

      {/* GRID */}
      <div style={STYLES.grid}>
        {/* LEFT */}
        <div style={STYLES.colLeft}>
          <h3 style={{ fontSize: 12, color: COLORS.textMuted, letterSpacing: '1px' }}>Contexte & Flashcards</h3>
          {flashcard && (
            <div style={STYLES.flashCard}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: COLORS.primary, marginBottom: 10 }}>
                <ShieldAlert size={18} /> {flashcard.title}
              </h2>
              <p style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>{flashcard.content}</p>
              <div style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, fontSize: 12 }}>
                <div style={{ color: COLORS.textMuted, fontSize: 11, letterSpacing: '1px', marginBottom: 4 }}>Pourquoi</div>
                <div style={{ marginBottom: 8 }}>{flashcard.why}</div>
                <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 6, display: 'flex', justifyContent: 'space-between', color: COLORS.warning, fontWeight: 'bold' }}>
                  <span>Impact</span>
                  <span>{flashcard.impact}</span>
                </div>
              </div>
            </div>
          )}

          <ObjectiveList objectives={objectives} />

          <div style={{ marginTop: 'auto', fontSize: 11, color: COLORS.textMuted }}>
            Tutoriel : suivez le curseur, lisez la flashcard au centre puis observez la carte et le journal des décisions.
          </div>
        </div>

        {/* CENTER */}
        <div style={STYLES.colCenter}>
          <LEDClock time={clockStr} speed={speed} countdownLabel={countdownLabel} countdownMinutes={Math.round(countdownMinutes)} />

          {module === 0 && (
            <div style={{ textAlign: 'center', marginTop: 140 }}>
              <h1 style={{
                fontSize: 46, fontWeight: 'bold', marginBottom: 14,
                background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Excellence Logistique
              </h1>
              <p style={{ color: COLORS.textMuted, fontSize: 18, marginBottom: 30 }}>Démonstration immersive v3.55</p>
              <button
                ref={startBtnRef}
                onClick={() => { sfx.init(); setAudioEnabled(true); setModule(1); }}
                style={{
                  padding: '14px 36px', fontSize: 17, fontWeight: 'bold', backgroundColor: COLORS.primary, color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: `0 0 18px ${COLORS.primary}50`
                }}
              >
                LANCER LA SÉQUENCE
              </button>
              <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textMuted }}>🔊 Audio recommandé</div>
            </div>
          )}

          {module > 0 && module < 6 && <LogisticsMap orders={mapOrders} />}

          {module > 0 && module < 6 && (
            <div style={{ position: 'absolute', bottom: 46, left: '50%', transform: 'translateX(-50%)', zIndex: 15 }}>
              <button
                ref={btnActionRef}
                style={{
                  padding: '14px 28px', minWidth: 240, borderRadius: 12,
                  border: `1px solid ${COLORS.success}`, backgroundColor: 'rgba(16,185,129,0.12)',
                  color: COLORS.success, fontWeight: 'bold', fontSize: 15,
                  animation: 'pulseGreen 2s infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}
              >
                <CheckCircle size={18} /> ACTION XCEL
              </button>
            </div>
          )}

          {module === 6 && (
            <div style={{ textAlign: 'center', marginTop: 140 }}>
              <h2 style={{ fontSize: 30, color: COLORS.success, marginBottom: 14 }}>Séquence terminée</h2>
              <div style={{ display: 'flex', gap: 30, justifyContent: 'center', marginBottom: 30 }}>
                <div style={{ padding: 18, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>Pertes Évitées</div>
                  <div style={{ fontSize: 30, color: COLORS.danger, fontWeight: 'bold' }}>{metrics.waste.toLocaleString()}€</div>
                </div>
                <div style={{ padding: 18, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>Gains Stratégiques</div>
                  <div style={{ fontSize: 30, color: COLORS.success, fontWeight: 'bold' }}>{metrics.savings.toLocaleString()}€</div>
                </div>
              </div>
              <button
                onClick={() => { setModule(1); setMetrics({ waste: 0, savings: 0 }); setLogs([]); setObjectives({ sync: false, planB: false, whatsapp: false, stock: false, stress: false, relation: false }); }}
                style={{ padding: '12px 26px', backgroundColor: 'transparent', border: `1px solid ${COLORS.textMuted}`, color: COLORS.text, borderRadius: 8, cursor: 'pointer' }}
              >
                REJOUER
              </button>
            </div>
          )}

          <FullscreenWhatsApp show={phone.show} messages={phone.messages} isTyping={phone.isTyping} groupName={phone.group} />
          <FlashcardOverlay flashcard={flashcard} focus={flashFocus} />
        </div>

        {/* RIGHT */}
        <div style={STYLES.colRight}>
          <DecisionLog logs={logs} />
        </div>
      </div>

      <VirtualCursor x={cursor.x} y={cursor.y} clicking={cursor.clicking} />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<GedimatSimulator />);
