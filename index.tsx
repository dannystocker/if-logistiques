
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Truck, MessageCircle, Clock, Smartphone } from 'lucide-react';

/**
 * GEDIMAT LUNEL NEGOCE - SIMULATEUR STRATÉGIQUE V2.0 (CINEMA MODE)
 * Version Pure JS pour compatibilité maximale
 */

// --- CONSTANTES & STYLES ---
const COLORS = {
  bg: "#0f172a",       // Slate 900
  card: "#1e293b",     // Slate 800
  success: "#10b981",  // Emerald 500
  danger: "#ef4444",   // Red 500
  warning: "#f59e0b",  // Amber 500
  primary: "#3b82f6",  // Blue 500
  text: "#f8fafc",
  textMuted: "#94a3b8"
};

const STYLES = {
  container: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  } as React.CSSProperties,
  header: {
    padding: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottom: `1px solid ${COLORS.card}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    height: '80px'
  } as React.CSSProperties,
  metricBox: {
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '120px',
    border: '1px solid rgba(255,255,255,0.05)'
  } as React.CSSProperties,
  mainStage: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: '20px'
  } as React.CSSProperties,
  card: {
    backgroundColor: COLORS.card,
    borderRadius: '16px',
    padding: '40px',
    width: '650px',
    maxWidth: '100%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    position: 'relative',
    border: `1px solid ${COLORS.textMuted}20`
  } as React.CSSProperties,
  button: (variant: string, isActive = false): React.CSSProperties => ({
    padding: '16px 24px',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    transition: 'all 0.2s',
    backgroundColor: isActive ? (variant === 'success' ? `${COLORS.success}30` : `${COLORS.danger}30`) : 'rgba(255,255,255,0.03)',
    color: isActive ? (variant === 'success' ? COLORS.success : COLORS.danger) : COLORS.textMuted,
    border: `1px solid ${isActive ? (variant === 'success' ? COLORS.success : COLORS.danger) : 'rgba(255,255,255,0.1)'}`,
    transform: isActive ? 'scale(1.02)' : 'scale(1)'
  })
};

// --- COMPOSANTS UI ---

const StatCounter = ({ label, value, type }: { label: string; value: number; type: string }) => (
  <div style={{ ...STYLES.metricBox, backgroundColor: type === 'cost' ? `${COLORS.danger}10` : `${COLORS.success}10` }}>
    <span style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {type === 'cost' ? <TrendingDown size={16} color={COLORS.danger} /> : <TrendingUp size={16} color={COLORS.success} />}
      <span style={{ fontSize: '20px', fontWeight: 'bold', color: type === 'cost' ? COLORS.danger : COLORS.success }}>
        {value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
      </span>
    </div>
  </div>
);

const VirtualCursor = ({ x, y, clicking }: { x: number; y: number; clicking: boolean }) => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0,
    transform: `translate(${x}px, ${y}px)`,
    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
    pointerEvents: 'none',
    zIndex: 9999
  }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))' }}>
      <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="white" stroke="black" strokeWidth="2"/>
    </svg>
    {clicking && (
      <div style={{
        position: 'absolute', top: -10, left: -10, width: 40, height: 40,
        borderRadius: '50%', border: `2px solid ${COLORS.primary}`,
        animation: 'ping 0.4s cubic-bezier(0, 0, 0.2, 1)'
      }} />
    )}
  </div>
);

const FlashCard = ({ title, message, type }: { title: string; message: string; type: string }) => (
  <div style={{
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: type === 'bad' ? '#7f1d1d' : '#064e3b',
    color: 'white',
    padding: '30px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
    zIndex: 100,
    animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    minWidth: '350px',
    border: `1px solid ${type === 'bad' ? COLORS.danger : COLORS.success}`
  }}>
    {type === 'bad' ? <AlertTriangle size={48} style={{ marginBottom: 15 }} /> : <CheckCircle size={48} style={{ marginBottom: 15 }} />}
    <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>{title}</h2>
    <p style={{ margin: 0, fontSize: '16px', opacity: 0.9, lineHeight: '1.5' }}>{message}</p>
  </div>
);

const PhoneMockup = ({ show, type }: { show: boolean; type: string }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute',
      right: -220, top: '50%',
      transform: 'translateY(-50%)',
      width: 260, height: 480,
      backgroundColor: '#fff',
      borderRadius: 30,
      border: '8px solid #1e293b',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
      animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      {/* Notch */}
      <div style={{ height: 25, backgroundColor: '#1e293b', width: '50%', alignSelf: 'center', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}></div>
      
      {/* Header */}
      <div style={{ backgroundColor: type === 'whatsapp' ? '#075e54' : '#f5f5f5', padding: '10px 15px', color: type === 'whatsapp' ? '#fff' : '#333', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontSize: 10, opacity: 0.8 }}>16:02</div>
        <div style={{ fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}>
          {type === 'whatsapp' && <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: '#25D366'}}></div>}
          {type === 'whatsapp' ? 'Chantier DUPONT' : 'Messagerie'}
        </div>
      </div>
      
      {/* Body */}
      <div style={{ flex: 1, padding: 15, backgroundColor: type === 'whatsapp' ? '#ece5dd' : '#fff', display: 'flex', flexDirection: 'column', gap: 10, backgroundImage: type === 'whatsapp' ? 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' : 'none', backgroundSize: 'cover' }}>
        
        {type === 'whatsapp' ? (
          <>
             <div style={{ alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10, marginBottom: 10 }}>Aujourd'hui</div>
             
             {/* Message Commercial */}
             <div style={{ alignSelf: 'flex-end', backgroundColor: '#dcf8c6', padding: 10, borderRadius: '8px 0 8px 8px', fontSize: 12, maxWidth: '90%', color: '#000', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
              <div style={{fontSize: 10, fontWeight: 'bold', color: '#e542a3', marginBottom: 2}}>Sophie (Logistique)</div>
              ✅ Commande #402 chargée.<br/>Arrivée demain 10h00.
              <div style={{ fontSize: 9, opacity: 0.5, textAlign: 'right', marginTop: 2 }}>16:00</div>
            </div>

            {/* Photo */}
            <div style={{ alignSelf: 'flex-end', backgroundColor: '#dcf8c6', padding: 4, borderRadius: '8px 0 8px 8px', maxWidth: '90%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
               <div style={{ width: 160, height: 100, backgroundColor: '#86efac', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontSize: 10, flexDirection: 'column' }}>
                 <Truck size={24} />
                 [PHOTO PALETTES]
               </div>
               <div style={{ fontSize: 9, opacity: 0.5, textAlign: 'right', paddingRight: 4, paddingBottom: 2, color: '#000' }}>16:00</div>
            </div>
          </>
        ) : (
          <>
             <div style={{ alignSelf: 'center', color: '#999', fontSize: 10, marginBottom: 10 }}>Hier 17:12</div>
             <div style={{ alignSelf: 'flex-start', backgroundColor: '#e5e5ea', padding: 10, borderRadius: '15px 15px 15px 0', fontSize: 12, maxWidth: '80%', color: '#000' }}>
               GEDIMAT: Votre livraison est prévue pour demain dans la journée.
             </div>
          </>
        )}
      </div>
      
      {/* Footer Input */}
      <div style={{ height: 50, backgroundColor: '#f0f0f0', borderTop: '1px solid #ddd' }}></div>
    </div>
  );
};

function GedimatSimulator() {
  const [metrics, setMetrics] = useState({ waste: 0, savings: 0 });
  const [cursor, setCursor] = useState({ x: -100, y: -100, clicking: false });
  const [activeModule, setActiveModule] = useState(0); // 0: Intro, 1: Transport, 2: 15:30, 3: WhatsApp, 4: Summary
  const [flashcard, setFlashcard] = useState<{ title: string; msg: string; type: string } | null>(null);
  const [simStep, setSimStep] = useState(0);
  const [phoneType, setPhoneType] = useState<string | null>(null);

  const btnBadRef = useRef<HTMLButtonElement>(null);
  const btnGoodRef = useRef<HTMLButtonElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);

  // Initialiser cursor au centre
  useEffect(() => {
    setCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2, clicking: false });
  }, []);

  const moveCursorTo = (ref: React.RefObject<HTMLElement>, callback?: () => void) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2; 
      const targetY = rect.top + rect.height / 2;
      
      setCursor(prev => ({ ...prev, x: targetX, y: targetY }));
      
      setTimeout(() => {
        setCursor(prev => ({ ...prev, clicking: true })); // Click down
        setTimeout(() => {
          setCursor(prev => ({ ...prev, clicking: false })); // Click up
          if (callback) callback();
        }, 300);
      }, 800); // Temps de trajet
    }
  };

  // --- SCÉNARIO AUTOMATIQUE ---
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const runScenario = async () => {
      // AUTO START
      if (activeModule === 0) {
         timeout = setTimeout(() => {
            if (startBtnRef.current) {
               moveCursorTo(startBtnRef, () => setActiveModule(1));
            }
         }, 2000);
      }

      // ---------------- MODULE 1: TRANSPORT ----------------
      if (activeModule === 1) {
        if (simStep === 0) {
          // Expliquer le problème
          setFlashcard({ title: "LE PROBLÈME", msg: "Gisors et Méru commandent séparément au même fournisseur.", type: 'bad' });
          timeout = setTimeout(() => {
            setFlashcard(null);
            // Action "Mauvaise"
            moveCursorTo(btnBadRef, () => {
              setMetrics(prev => ({ ...prev, waste: prev.waste + 180 }));
              setFlashcard({ title: "DOUBLE FACTURATION", msg: "2 camions payés pour rien. Gaspillage : 180€.", type: 'bad' });
              setTimeout(() => { setFlashcard(null); setSimStep(1); }, 3000);
            });
          }, 3000);
        } else if (simStep === 1) {
          // Expliquer la solution
          timeout = setTimeout(() => {
            // Action "Bonne"
            moveCursorTo(btnGoodRef, () => {
              setMetrics(prev => ({ ...prev, savings: prev.savings + 90 }));
              setFlashcard({ title: "SOLUTION XCEL", msg: "Consolidation J-1. Livraison unique à Méru + Navette interne.", type: 'good' });
              setTimeout(() => { setFlashcard(null); setActiveModule(2); setSimStep(0); }, 3500);
            });
          }, 1000);
        }
      }
      
      // ---------------- MODULE 2: PROTOCOLE 15:30 ----------------
      if (activeModule === 2) {
        if (simStep === 0) {
           setFlashcard({ title: "LE PROBLÈME", msg: "Le camion n'est pas là à 15h30. On ne sait rien.", type: 'bad' });
           timeout = setTimeout(() => {
            setFlashcard(null);
            moveCursorTo(btnBadRef, () => {
              setMetrics(prev => ({ ...prev, waste: prev.waste + 2000 }));
              setFlashcard({ title: "CLIENT PERDU", msg: "Le client découvre le retard demain matin. Chantier arrêté.", type: 'bad' });
              setTimeout(() => { setFlashcard(null); setSimStep(1); }, 3000);
            });
          }, 3000);
        } else if (simStep === 1) {
          timeout = setTimeout(() => {
            moveCursorTo(btnGoodRef, () => {
              setMetrics(prev => ({ ...prev, savings: prev.savings + 500 }));
              setFlashcard({ title: "PROTOCOLE 15:30", msg: "Alerte immédiate. Taxi-colis activé. Client prévenu à 16h.", type: 'good' });
              setTimeout(() => { setFlashcard(null); setActiveModule(3); setSimStep(0); }, 3500);
            });
          }, 1000);
        }
      }

      // ---------------- MODULE 3: WHATSAPP CONCIERGE ----------------
      if (activeModule === 3) {
        if (simStep === 0) {
           setFlashcard({ title: "LE PROBLÈME", msg: "SMS impersonnel envoyé à 17h. Aucune réponse.", type: 'bad' });
           timeout = setTimeout(() => {
            setFlashcard(null);
            moveCursorTo(btnBadRef, () => {
              setPhoneType('sms'); // Show SMS phone
              setFlashcard({ title: "COMMUNICATION FROIDE", msg: "Le client n'est pas rassuré. Il rappelle le commercial.", type: 'bad' });
              setTimeout(() => { setPhoneType(null); setFlashcard(null); setSimStep(1); }, 4000);
            });
          }, 3000);
        } else if (simStep === 1) {
          timeout = setTimeout(() => {
            moveCursorTo(btnGoodRef, () => {
              setMetrics(prev => ({ ...prev, savings: prev.savings + 1200 }));
              setPhoneType('whatsapp'); // Show WhatsApp phone
              setFlashcard({ title: "EFFET 'CONCIERGE'", msg: "Groupe WhatsApp Chantier. Photo envoyée. Confiance totale.", type: 'good' });
              setTimeout(() => { setPhoneType(null); setFlashcard(null); setActiveModule(4); }, 5000);
            });
          }, 1000);
        }
      }
    };

    runScenario();
    return () => clearTimeout(timeout);
  }, [activeModule, simStep]);

  // --- RENDU DES MODULES ---

  return (
    <div style={STYLES.container}>
      {/* HEADER P&L */}
      <div style={STYLES.header}>
        <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'white', paddingLeft: 20 }}>GEDIMAT <span style={{color: COLORS.primary}}>XCEL</span></div>
        <div style={{ display: 'flex', gap: '20px', paddingRight: 20 }}>
          <StatCounter label="Pertes potentielles" value={metrics.waste} type="cost" />
          <StatCounter label="Gains projetés" value={metrics.savings} type="profit" />
        </div>
      </div>

      {/* MAIN STAGE */}
      <div style={STYLES.mainStage}>
        <div style={STYLES.card}>
          {activeModule === 0 && (
            <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '42px', marginBottom: '20px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gedimat XCEL v3.55</h1>
              <p style={{ color: COLORS.textMuted, marginBottom: '40px', fontSize: '18px' }}>Simulation d'Impact Stratégique & Financier</p>
              <button 
                ref={startBtnRef}
                onClick={() => setActiveModule(1)}
                style={{ ...STYLES.button('primary', true), margin: '0 auto', width: 'auto', fontSize: '18px', padding: '15px 40px' }}
              >
                LANCER LA DÉMONSTRATION
              </button>
            </div>
          )}

          {activeModule === 1 && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0, fontSize: '24px' }}>
                  <Truck color={COLORS.primary} size={32} /> Consolidation Gisors-Méru
                </h3>
                <span style={{ backgroundColor: '#334155', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>MODULE 1/3</span>
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <p style={{ color: COLORS.textMuted, fontSize: '18px', textAlign: 'center', maxWidth: '80%' }}>
                  Gisors commande des tuiles à Beauvais. Méru commande du ciment à Beauvais.<br/>
                  Que fait-on ?
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <button ref={btnBadRef} style={STYLES.button('danger', simStep === 0 && flashcard?.type === 'bad')} disabled={simStep !== 0}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>MODE CLASSIQUE</div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>2 commandes séparées</div>
                  </div>
                  <AlertTriangle size={24} />
                </button>
                <button ref={btnGoodRef} style={STYLES.button('success', simStep === 1 && flashcard?.type === 'good')} disabled={simStep !== 1}>
                  <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>MODE XCEL (HUB)</div>
                      <div style={{ fontSize: '14px', opacity: 0.7 }}>Check J-1 & Groupage</div>
                  </div>
                  <CheckCircle size={24} />
                </button>
              </div>
            </div>
          )}

          {activeModule === 2 && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0, fontSize: '24px' }}>
                  <Clock color={COLORS.warning} size={32} /> Protocole 15:30
                </h3>
                <span style={{ backgroundColor: '#334155', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>MODULE 2/3</span>
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', flexDirection: 'column' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: COLORS.warning, marginBottom: '20px', fontFamily: 'monospace' }}>15:30</div>
                <p style={{ color: COLORS.textMuted, fontSize: '18px', textAlign: 'center', maxWidth: '80%' }}>
                  Pas de nouvelles de Médiafret pour la livraison de demain.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <button ref={btnBadRef} style={STYLES.button('danger', simStep === 0 && flashcard?.type === 'bad')} disabled={simStep !== 0}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>ATTENDRE</div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>Espérer qu'il arrive...</div>
                  </div>
                  <AlertTriangle size={24} />
                </button>
                <button ref={btnGoodRef} style={STYLES.button('success', simStep === 1 && flashcard?.type === 'good')} disabled={simStep !== 1}>
                  <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>ACTIVER PLAN B</div>
                      <div style={{ fontSize: '14px', opacity: 0.7 }}>Taxi-Colis & Alerte</div>
                  </div>
                  <CheckCircle size={24} />
                </button>
              </div>
            </div>
          )}

          {activeModule === 3 && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0, fontSize: '24px' }}>
                  <Smartphone color={COLORS.success} size={32} /> Interface Client
                </h3>
                <span style={{ backgroundColor: '#334155', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>MODULE 3/3</span>
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <p style={{ color: COLORS.textMuted, fontSize: '18px', textAlign: 'center', maxWidth: '80%' }}>
                  Le client s'inquiète pour sa livraison de demain.<br/>Comment communiquer ?
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <button ref={btnBadRef} style={STYLES.button('danger', simStep === 0 && flashcard?.type === 'bad')} disabled={simStep !== 0}>
                   <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>SMS STANDARD</div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>Texte froid, 17h00</div>
                  </div>
                  <MessageCircle size={24} />
                </button>
                <button ref={btnGoodRef} style={STYLES.button('success', simStep === 1 && flashcard?.type === 'good')} disabled={simStep !== 1}>
                   <div>
                     <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>WHATSAPP VIP</div>
                     <div style={{ fontSize: '14px', opacity: 0.7 }}>Photo + Humain</div>
                  </div>
                  <Smartphone size={24} />
                </button>
              </div>

              <PhoneMockup show={phoneType !== null} type={phoneType || 'whatsapp'} />
            </div>
          )}

          {activeModule === 4 && (
            <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '36px', marginBottom: '40px', color: COLORS.success }}>DÉMONSTRATION TERMINÉE</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '60px' }}>
                <div style={{ padding: 30, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, border: `1px solid ${COLORS.danger}` }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: COLORS.danger, marginBottom: 10 }}>
                    {metrics.waste.toLocaleString()} €
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: '16px' }}>Pertes Identifiées</div>
                </div>
                <div style={{ padding: 30, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 16, border: `1px solid ${COLORS.success}` }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: COLORS.success, marginBottom: 10 }}>
                    {metrics.savings.toLocaleString()} €
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: '16px' }}>Gains Stratégiques</div>
                </div>
              </div>
              <button 
                onClick={() => { setMetrics({ waste: 0, savings: 0 }); setActiveModule(1); setSimStep(0); }}
                style={{ ...STYLES.button('ghost'), margin: '0 auto', width: 'auto', fontSize: '16px' }}
              >
                REJOUER LA SÉQUENCE
              </button>
            </div>
          )}

          {/* Overlay Flashcard */}
          {flashcard && <FlashCard title={flashcard.title} message={flashcard.msg} type={flashcard.type} />}
        </div>
      </div>

      {/* CURSOR LAYER */}
      <VirtualCursor x={cursor.x} y={cursor.y} clicking={cursor.clicking} />
      
      {/* FOOTER LABEL */}
      <div style={{ 
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', 
        color: COLORS.textMuted, fontSize: '12px', opacity: 0.5 
      }}>
        Démonstration Automatique — Algorithme v3.55
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<GedimatSimulator />);
