/* ds.jsx — AI Trade Analyst design system primitives.
   Tokens live as CSS vars in the host HTML. Exports primitives to window. */

const { useState, useEffect, useRef, useMemo } = React;

/* ───────────────────────── ICONS ─────────────────────────
   Curated stroke icon set. 24×24, currentColor, 1.8 stroke. */
const ICON_PATHS = {
  home:       'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5',
  upload:     'M12 16V4M7 9l5-5 5 5M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3',
  camera:     'M4 8a2 2 0 0 1 2-2h1.5l1-2h5l1 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z|M12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  image:      'M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5z|M4 16l4-4 4 4 4-5 4 4|M8.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  candles:    'M6 4v3M6 17v3M6 7h0a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM13 2v4M13 16v6M13 6h0a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM20 7v3M20 18v2M20 10h0a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z',
  bell:       'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  bookmark:   'M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16l-6-4-6 4V4z',
  book:       'M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v15H7a2 2 0 0 0-2 2V4z|M5 19a2 2 0 0 0 2 2h12',
  list:       'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  user:       'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0',
  settings:   'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19 12a7 7 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2.2-1.3L14 2h-4l-.3 2.1a7 7 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2.2 1.3L10 22h4l.3-2.1a7 7 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z',
  chevR:      'M9 6l6 6-6 6',
  chevL:      'M15 6l-6 6 6 6',
  chevD:      'M6 9l6 6 6-6',
  chevU:      'M18 15l-6-6-6 6',
  arrowUp:    'M12 19V5M5 12l7-7 7 7',
  arrowDown:  'M12 5v14M19 12l-7 7-7-7',
  trendUp:    'M3 17l6-6 4 4 8-8M21 7h-5M21 7v5',
  trendDown:  'M3 7l6 6 4-4 8 8M21 17h-5M21 17v-5',
  check:      'M4 12l5 5L20 6',
  checkCircle:'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14.01l-3-3',
  x:          'M6 6l12 12M18 6L6 18',
  xCircle:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6',
  lock:       'M6 11a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8z|M8 10V7a4 4 0 0 1 8 0v3',
  crown:      'M3 7l4.5 4L12 5l4.5 6L21 7l-1.6 11H4.6L3 7z',
  zap:        'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  search:     'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
  share:      'M16 6l-4-4-4 4M12 2v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  sparkles:   'M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3zM5 14l.9 2.3L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.7L5 14zM18 13l.7 1.8L20.5 15l-1.8.6L18 17l-.6-1.4L16 15l1.4-.6L18 13z',
  shield:     'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z',
  target:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  flag:       'M5 21V4M5 4h11l-2 4 2 4H5',
  layers:     'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  clock:      'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
  eye:        'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  plus:       'M12 5v14M5 12h14',
  plusCircle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v8M8 12h8',
  apple:      'M16 13c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .6 1 1.4 2.1 2.4 2 .9 0 1.3-.6 2.4-.6s1.4.6 2.4.6 1.7-1 2.3-2c.7-1.1 1-2.1 1-2.2-.1 0-2-.8-2-3.2zM14 6.3c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.3-1.1z',
  google:     'M21 12.2c0-.6 0-1.2-.1-1.8H12v3.4h5c-.2 1.2-.9 2.2-1.9 2.9v2.4h3C20 17.4 21 15 21 12.2z|M12 21c2.6 0 4.8-.9 6.3-2.3l-3-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H3.5v2.5C5 19.6 8.2 21 12 21z|M6.6 13.2c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V6.9H3.5C2.9 8.2 2.5 9.6 2.5 11.3s.4 3.1 1 4.4l3.1-2.5z|M12 5.4c1.4 0 2.7.5 3.7 1.4l2.7-2.7C16.8 2.7 14.6 1.8 12 1.8 8.2 1.8 5 4 3.5 7l3.1 2.4c.8-2.3 2.9-4 5.4-4z',
  filter:     'M3 5h18l-7 8v6l-4-2v-4L3 5z',
  copy:       'M9 9a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9z|M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  refresh:    'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  dollar:     'M12 2v20M17 6.5C17 4.6 14.8 4 12 4S7 4.9 7 7s2.2 3 5 3 5 1 5 3-2.2 3-5 3-5-.6-5-2.5',
  activity:   'M22 12h-4l-3 8-6-16-3 8H2',
  star:       'M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9-4.3-4.1 5.9-.8L12 3z',
  grid:       'M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z',
  brain:      'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8V15a3 3 0 0 0 4 2.8M9 4a2.5 2.5 0 0 1 3 0M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8V15a3 3 0 0 1-4 2.8M12 4v15M9 17.8a3 3 0 0 0 6 0',
  info:       'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  logout:     'M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9',
  chart:      'M4 20V10M10 20V4M16 20v-7M22 20H2',
  bolt:       'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  gauge:      'M12 13l4-4M5.6 18.4a9 9 0 1 1 12.8 0',
  ai:         'M12 3l1.5 4 4 1.5-4 1.5L12 13l-1.5-4-4-1.5 4-1.5L12 3z|M6 16l.8 2 2 .8-2 .8L6 22l-.8-2.4L3 18.8l2.2-.8L6 16z',
  key:        'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  trash:      'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  scan:       'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7.5 12h9',
  alert:      'M12 9v4M12 17h.01M10.3 4l-7.7 13a1 1 0 0 0 .9 1.5h15.4a1 1 0 0 0 .9-1.5L14 4a1 1 0 0 0-1.7 0z',
  save:       'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
};

function Icon({ name, size = 22, color = 'currentColor', sw = 1.8, fill = false, style = {} }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  const parts = d.split('|');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0, ...style }}>
      {parts.map((p, i) => (
        <path key={i} d={p} stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeLinejoin="round"
          fill={fill ? color : 'none'} />
      ))}
    </svg>
  );
}

/* ───────────────────────── BUTTON ───────────────────────── */
function Button({ children, variant = 'primary', size = 'md', icon, iconRight, full, onClick, style = {}, disabled }) {
  const [press, setPress] = useState(false);
  const sz = {
    sm: { h: 38, px: 14, fs: 13.5, gap: 7, r: 11 },
    md: { h: 50, px: 20, fs: 15.5, gap: 9, r: 14 },
    lg: { h: 58, px: 24, fs: 16.5, gap: 10, r: 16 },
  }[size];
  const vr = {
    primary: { background: 'var(--brand-grad)', color: '#fff', border: 'none', boxShadow: press ? 'none' : '0 6px 20px -6px var(--brand-glow)' },
    gold:    { background: 'linear-gradient(135deg,#F6D58A,#E9B84E)', color: '#2A2008', border: 'none', boxShadow: press ? 'none' : '0 6px 22px -6px rgba(233,184,78,0.5)' },
    solid:   { background: 'var(--bg-3)', color: 'var(--text)', border: '1px solid var(--border-strong)' },
    ghost:   { background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' },
    bull:    { background: 'var(--bull-dim)', color: 'var(--bull)', border: '1px solid var(--bull-line)' },
    bear:    { background: 'var(--bear-dim)', color: 'var(--bear)', border: '1px solid var(--bear-line)' },
  }[variant];
  return (
    <button onClick={disabled ? undefined : onClick}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      style={{
        height: sz.h, padding: `0 ${sz.px}px`, borderRadius: sz.r,
        fontFamily: 'var(--ui)', fontSize: sz.fs, fontWeight: 650, letterSpacing: 0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: sz.gap,
        width: full ? '100%' : undefined, cursor: disabled ? 'not-allowed' : 'pointer',
        transform: press ? 'scale(0.97)' : 'scale(1)', transition: 'transform .12s, box-shadow .2s',
        opacity: disabled ? 0.4 : 1, WebkitTapHighlightColor: 'transparent',
        ...vr, ...style,
      }}>
      {icon && <Icon name={icon} size={sz.fs + 3} sw={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sz.fs + 2} sw={2} />}
    </button>
  );
}

/* ───────────────────────── CARD ───────────────────────── */
function Card({ children, style = {}, pad = 16, onClick, glow }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', borderRadius: 20, padding: pad,
      border: '1px solid var(--border)', position: 'relative',
      boxShadow: glow
        ? '0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 30px -16px rgba(0,0,0,0.6)'
        : '0 1px 0 rgba(255,255,255,0.025) inset',
      cursor: onClick ? 'pointer' : undefined, ...style,
    }}>{children}</div>
  );
}

/* ───────────────────────── BADGE ───────────────────────── */
function Badge({ children, tone = 'neutral', icon, size = 'md', style = {} }) {
  const tones = {
    neutral: { bg: 'var(--bg-3)',              fg: 'var(--text-2)',    bd: 'var(--border)' },
    bull:    { bg: 'var(--bull-dim)',           fg: 'var(--bull)',      bd: 'var(--bull-line)' },
    bear:    { bg: 'var(--bear-dim)',           fg: 'var(--bear)',      bd: 'var(--bear-line)' },
    brand:   { bg: 'rgba(124,108,255,0.14)',   fg: 'var(--brand-2)',   bd: 'rgba(124,108,255,0.28)' },
    gold:    { bg: 'rgba(233,184,78,0.13)',    fg: 'var(--gold)',      bd: 'rgba(233,184,78,0.28)' },
    warn:    { bg: 'rgba(245,180,80,0.12)',    fg: '#F0B860',          bd: 'rgba(245,180,80,0.24)' },
  }[tone];
  const s = size === 'sm' ? { fs: 11, px: 7, h: 21, gap: 4 } : { fs: 12.5, px: 9, h: 25, gap: 5 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap, height: s.h,
      padding: `0 ${s.px}px`, borderRadius: 8, background: tones.bg, color: tones.fg,
      border: `1px solid ${tones.bd}`, fontFamily: 'var(--ui)', fontWeight: 650,
      fontSize: s.fs, letterSpacing: 0.2, whiteSpace: 'nowrap', ...style,
    }}>
      {icon && <Icon name={icon} size={s.fs + 1} sw={2.2} />}
      {children}
    </span>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px' }}>
      <h3 style={{ fontFamily: 'var(--ui)', fontSize: 16.5, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.2, margin: 0 }}>{title}</h3>
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', color: 'var(--brand-2)', fontFamily: 'var(--ui)', fontSize: 13.5, fontWeight: 650, cursor: 'pointer', padding: 0 }}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── GAUGE (semicircular) ───────────────────────── */
function Gauge({ value, label, tone = 'brand', size = 150 }) {
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  const circ = Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const colors = { brand: 'var(--brand-2)', bull: 'var(--bull)', bear: 'var(--bear)', gold: 'var(--gold)' };
  const stroke = colors[tone] || colors.brand;
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ position: 'relative', width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path d={`M12 ${cy} A ${r} ${r} 0 0 1 ${size - 12} ${cy}`} fill="none" stroke="var(--bg-3)" strokeWidth="11" strokeLinecap="round" />
        <path d={`M12 ${cy} A ${r} ${r} 0 0 1 ${size - 12} ${cy}`} fill="none" stroke={stroke} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - anim)}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)', filter: `drop-shadow(0 0 8px ${stroke})`, opacity: 0.95 }} />
      </svg>
      <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 34, fontWeight: 700, color: 'var(--text)', lineHeight: 1, letterSpacing: -1 }}>{Math.round(value)}</div>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 5 }}>{label}</div>
      </div>
    </div>
  );
}

/* ───────────────────────── RING (small circular progress) ───────────────────────── */
function Ring({ value, size = 46, sw = 5, color = 'var(--brand-2)', children }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  const [a, setA] = useState(0);
  useEffect(() => { const t = setTimeout(() => setA(value / 100), 100); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - a)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── SPARKLINE ───────────────────────── */
function Sparkline({ data, width = 64, height = 26, color = 'var(--bull)', fill = true }) {
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / rng) * (height - 4) - 2]);
  const dLine = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const dFill = `${dLine} L${width} ${height} L0 ${height} Z`;
  const id = useMemo(() => 'sp' + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.28" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={dFill} fill={`url(#${id})`} />
        </>
      )}
      <path d={dLine} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────────────────── CANDLESTICK CHART ─────────────────────────
   Generates a deterministic-looking candle chart from a numeric seed. */
function CandleChart({ seed = 7, candles = 34, height = 200, levels = [], showAxis = true }) {
  const data = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    let price = 100;
    const out = [];
    for (let i = 0; i < candles; i++) {
      const drift = Math.sin(i / 5) * 1.4 + (rnd() - 0.45) * 3.2;
      const open = price;
      const close = price + drift;
      const high = Math.max(open, close) + rnd() * 2.4;
      const low  = Math.min(open, close) - rnd() * 2.4;
      out.push({ open, close, high, low });
      price = close;
    }
    return out;
  }, [seed, candles]);

  const all = data.flatMap(d => [d.high, d.low]);
  const min = Math.min(...all), max = Math.max(...all), rng = max - min || 1;
  const w = 100 / candles;
  const y = v => 6 + (1 - (v - min) / rng) * (height - 12);

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {levels.map((lv, i) => {
        const yy = y(min + lv.p * rng);
        return <line key={i} x1="0" y1={yy} x2="100" y2={yy} stroke={lv.color} strokeWidth="0.4" strokeDasharray="1.5 1.5" opacity="0.65" />;
      })}
      {data.map((d, i) => {
        const cx = i * w + w / 2;
        const up = d.close >= d.open;
        const col = up ? 'var(--bull)' : 'var(--bear)';
        const bw = w * 0.58;
        return (
          <g key={i}>
            <line x1={cx} y1={y(d.high)} x2={cx} y2={y(d.low)} stroke={col} strokeWidth="0.4" />
            <rect x={cx - bw / 2} y={y(Math.max(d.open, d.close))} width={bw}
              height={Math.max(0.6, Math.abs(y(d.open) - y(d.close)))} fill={col} rx="0.3" />
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────────────────── ASSET GLYPH ───────────────────────── */
function AssetGlyph({ symbol, size = 40 }) {
  const map = {
    BTC:    { bg: 'linear-gradient(135deg,#F7931A,#E8820E)', t: '#fff' },
    ETH:    { bg: 'linear-gradient(135deg,#627EEA,#4860c4)', t: '#fff' },
    SOL:    { bg: 'linear-gradient(135deg,#14F195,#9945FF)', t: '#fff' },
    NVDA:   { bg: 'linear-gradient(135deg,#76B900,#5a8c00)', t: '#fff' },
    EURUSD: { bg: 'linear-gradient(135deg,#3b6cf6,#2b50c0)', t: '#fff' },
    AAPL:   { bg: 'linear-gradient(135deg,#555,#222)',        t: '#fff' },
    SPX:    { bg: 'linear-gradient(135deg,#888,#555)',        t: '#fff' },
    XAU:    { bg: 'linear-gradient(135deg,#F6D58A,#E0A93A)', t: '#3a2c08' },
    TSLA:   { bg: 'linear-gradient(135deg,#E82127,#b81015)', t: '#fff' },
    GOLD:   { bg: 'linear-gradient(135deg,#F6D58A,#E0A93A)', t: '#3a2c08' },
  };
  const m = map[symbol] || map[symbol && symbol.toUpperCase()] || { bg: 'var(--bg-3)', t: 'var(--text-2)' };
  const sym = symbol ? symbol.toUpperCase() : '?';
  const label = sym === 'EURUSD' ? '€$' : sym.slice(0, sym.length > 3 ? 2 : 3);
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>
      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: size * 0.34, color: m.t, letterSpacing: -0.5 }}>{label}</span>
    </div>
  );
}

Object.assign(window, {
  Icon, Button, Card, Badge, SectionHead, Gauge, Ring, Sparkline, CandleChart, AssetGlyph,
  useState, useEffect, useRef, useMemo,
  uS: useState, uE: useEffect, uR: useRef, uM: useMemo,
});
