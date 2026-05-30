/* screens-onboarding.jsx — shared chrome, onboarding, auth (with API key setup) */

/* ══════════════════════════════════════════════════════════════
   SHARED CHROME — exported for all screens
══════════════════════════════════════════════════════════════ */

function TopBar({ title, nav, right, large, sub }) {
  return (
    <div style={{ paddingTop: 60, paddingBottom: 8, position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(to bottom, var(--bg) 78%, transparent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', minHeight: 40 }}>
        {nav && nav.depth > 1
          ? <button onClick={nav.back} style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="chevL" size={20} color="var(--text)" sw={2.2} />
            </button>
          : <div style={{ width: 38 }} />
        }
        {!large && <h1 style={{ fontFamily: 'var(--ui)', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h1>}
        <div style={{ minWidth: 38, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
      </div>
      {large && (
        <div style={{ padding: '8px 20px 4px' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: -0.5 }}>{title}</h1>
          {sub && <p style={{ fontFamily: 'var(--ui)', fontSize: 14, color: 'var(--text-2)', margin: '5px 0 0' }}>{sub}</p>}
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 50, height: 30, borderRadius: 16, border: 'none', cursor: 'pointer', padding: 3, background: on ? 'var(--bull)' : 'var(--bg-4)', transition: 'background .2s', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', transition: 'all .2s' }} />
    </button>
  );
}

function Segmented({ options, value, onChange, style = {} }) {
  return (
    <div style={{ display: 'flex', background: 'var(--bg-3)', borderRadius: 12, padding: 3, gap: 2, border: '1px solid var(--border)', ...style }}>
      {options.map(o => {
        const on = o === value || o.v === value;
        const label = o.v ? o.label : o;
        const val   = o.v  ? o.v    : o;
        return (
          <button key={val} onClick={() => onChange(val)} style={{ flex: 1, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer', background: on ? 'var(--bg-4)' : 'transparent', color: on ? 'var(--text)' : 'var(--text-3)', fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 13, boxShadow: on ? '0 1px 3px rgba(0,0,0,0.3)' : 'none', transition: 'all .15s', whiteSpace: 'nowrap' }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Sheet({ children, onClose, title }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--bg-1)', borderRadius: '28px 28px 0 0', border: '1px solid var(--border)', borderBottom: 'none', padding: '12px 20px 40px', animation: 'slideUp .3s cubic-bezier(.2,.8,.2,1)', maxHeight: '82%', overflowY: 'auto' }}>
        <div style={{ width: 38, height: 5, borderRadius: 3, background: 'var(--bg-4)', margin: '0 auto 18px' }} />
        {title && <h2 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px', letterSpacing: -0.3 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

function Logo({ size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px -6px var(--brand-glow), inset 0 1px 0 rgba(255,255,255,0.3)', flexShrink: 0 }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path d="M3 17l5-5 3.5 3.5L21 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 6h5v5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="12" r="1.6" fill="#fff" />
        <circle cx="11.5" cy="15.5" r="1.6" fill="#fff" />
      </svg>
    </div>
  );
}

Object.assign(window, { TopBar, Toggle, Segmented, Sheet, Logo });

/* ══════════════════════════════════════════════════════════════
   ONBOARDING SLIDES
══════════════════════════════════════════════════════════════ */

const SLIDES = [
  {
    kicker: 'AI-POWERED ANALYSIS',
    title: 'Drop a chart.\nGet a verdict.',
    body: 'Upload any TradingView screenshot and our AI reads the structure, levels and momentum in seconds.',
    visual: 'scan',
  },
  {
    kicker: '103 STRATEGIES',
    title: 'A full trading desk\nin your pocket',
    body: 'Smart Money, ICT, price action, breakouts, Fibonacci and more — weighted into one clear consensus for your timeframe.',
    visual: 'consensus',
  },
  {
    kicker: 'TRADE WITH A PLAN',
    title: 'Entries, stops\n& targets',
    body: 'High-confidence setups come with a full plan and risk score, so you always know your edge before you click.',
    visual: 'plan',
  },
];

function OnboardVisual({ kind }) {
  if (kind === 'scan') {
    return (
      <div style={{ position: 'relative', width: '100%', height: 270 }}>
        <Card pad={0} style={{ position: 'absolute', inset: '10px 24px', overflow: 'hidden', background: 'var(--bg-1)' }}>
          <div style={{ padding: '12px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AssetGlyph symbol="BTC" size={26} />
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>BTC/USDT</span>
            </div>
            <Badge tone="neutral" size="sm">4H</Badge>
          </div>
          <CandleChart seed={11} candles={30} height={150} />
        </Card>
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderRadius: 14, background: 'rgba(124,108,255,0.16)', border: '1px solid rgba(124,108,255,0.34)', backdropFilter: 'blur(8px)', boxShadow: '0 12px 30px -8px var(--brand-glow)', whiteSpace: 'nowrap' }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="sparkles" size={15} color="#fff" fill />
          </div>
          <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Analyzing 103 strategies…</span>
        </div>
      </div>
    );
  }
  if (kind === 'consensus') {
    const rows = [['Smart Money', 92, 'bull'], ['Trend', 84, 'bull'], ['Price Action', 78, 'bull'], ['Momentum', 55, 'neutral'], ['Mean Reversion', 32, 'bear']];
    return (
      <div style={{ width: '100%', height: 270, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11 }}>
        {rows.map(([n, w, t], i) => (
          <div key={i} style={{ animation: `fadeUp .5s ease ${i * 0.08}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: 'var(--ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{n}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: t === 'bull' ? 'var(--bull)' : t === 'bear' ? 'var(--bear)' : 'var(--text-3)' }}>{w}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{ width: w + '%', height: '100%', borderRadius: 4, background: t === 'bull' ? 'var(--bull)' : t === 'bear' ? 'var(--bear)' : 'var(--text-3)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 252, background: 'var(--bg-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Badge tone="bull" icon="trendUp">BUY · 87%</Badge>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)' }}>R:R 3.1</span>
        </div>
        {[['Entry', '67,100–67,500', 'var(--text)'], ['Stop', '65,900', 'var(--bear)'], ['Target 1', '68,400', 'var(--bull)'], ['Target 2', '70,250', 'var(--bull)']].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-2)' }}>{r[0]}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: r[2] }}>{r[1]}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Onboarding({ onDone, nav }) {
  const [i, setI] = uS(0);
  const s    = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '64px 24px 40px', background: 'radial-gradient(700px 500px at 50% -5%, rgba(124,108,255,0.16), transparent 60%), var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={32} />
          <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Trade Analyst</span>
        </div>
        <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Skip</button>
      </div>

      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'fadeUp .4s ease' }}>
        <OnboardVisual kind={s.visual} />
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--brand-2)', marginBottom: 12 }}>{s.kicker}</div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.1, letterSpacing: -0.8, whiteSpace: 'pre-line' }}>{s.title}</h1>
          <p style={{ fontFamily: 'var(--ui)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--text-2)', margin: '14px 0 0', maxWidth: 320 }}>{s.body}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7, marginBottom: 22 }}>
        {SLIDES.map((_, k) => <div key={k} style={{ height: 4, borderRadius: 2, flex: k === i ? 2.4 : 1, background: k === i ? 'var(--brand)' : 'var(--bg-4)', transition: 'all .3s' }} />)}
      </div>

      <Button size="lg" full iconRight={last ? undefined : 'chevR'} onClick={() => last ? nav.go('auth') : setI(i + 1)}>
        {last ? 'Get started' : 'Continue'}
      </Button>
      {last && (
        <button onClick={() => nav.go('auth')} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 16 }}>
          I already have an account
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   AUTH — includes API key setup
══════════════════════════════════════════════════════════════ */

function AuthScreen({ onDone, nav }) {
  const [mode, setMode] = uS('choices'); // choices | email | apikey
  const [email, setEmail] = uS('');
  const [apiKey, setApiKey] = uS(window.DATA.ApiKey.get());
  const [keyVisible, setKeyVisible] = uS(false);
  const [saved, setSaved] = uS(false);

  const saveKey = () => {
    if (apiKey.trim().startsWith('sk-ant-')) {
      window.DATA.ApiKey.set(apiKey.trim());
      setSaved(true);
      setTimeout(() => onDone(), 800);
    }
  };

  if (mode === 'apikey') {
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '64px 24px 44px', background: 'radial-gradient(600px 460px at 50% 0%, rgba(124,108,255,0.14), transparent 60%), var(--bg)' }}>
        <button onClick={() => setMode('choices')} style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={20} color="var(--text)" sw={2.2} />
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px -8px var(--brand-glow)' }}>
            <Icon name="key" size={28} color="#fff" sw={2} />
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: '22px 0 8px', letterSpacing: -0.5 }}>Anthropic API key</h1>
          <p style={{ fontFamily: 'var(--ui)', fontSize: 14.5, color: 'var(--text-2)', margin: 0, lineHeight: 1.55 }}>
            The app uses Claude Vision to analyze your chart images. Paste your Anthropic API key below — stored only on this device.
          </p>

          <div style={{ marginTop: 28, position: 'relative' }}>
            <input
              type={keyVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              style={{ width: '100%', height: 56, borderRadius: 14, background: 'var(--bg-2)', border: `1px solid ${apiKey && !apiKey.startsWith('sk-ant-') ? 'var(--bear-line)' : 'var(--border-strong)'}`, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '0 52px 0 18px', outline: 'none' }}
            />
            <button onClick={() => setKeyVisible(!keyVisible)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Icon name="eye" size={18} color="var(--text-3)" />
            </button>
          </div>

          {apiKey && !apiKey.startsWith('sk-ant-') && (
            <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--bear)', marginTop: 8 }}>Keys start with sk-ant-</div>
          )}

          <Button size="lg" full onClick={saveKey} disabled={!apiKey.startsWith('sk-ant-')} style={{ marginTop: 18 }}>
            {saved ? '✓ Saved — entering app…' : 'Save & continue'}
          </Button>

          <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 14, width: '100%', textAlign: 'center' }}>
            Skip for now — explore without AI
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '14px 0 0' }}>
            <Icon name="info" size={14} color="var(--text-3)" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
              Your key is stored locally in this browser only and never sent anywhere except to Anthropic's API for chart analysis.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '64px 24px 44px', background: 'radial-gradient(600px 460px at 50% 0%, rgba(124,108,255,0.14), transparent 60%), var(--bg)' }}>
      <button onClick={nav.back} style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="chevL" size={20} color="var(--text)" sw={2.2} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Logo size={56} />
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 700, color: 'var(--text)', margin: '24px 0 8px', letterSpacing: -0.5 }}>
          {mode === 'email' ? 'Your email' : 'Welcome'}
        </h1>
        <p style={{ fontFamily: 'var(--ui)', fontSize: 15, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
          {mode === 'email' ? "We'll send a magic link to sign you in." : 'Sign in and set up your Anthropic API key to start analyzing charts.'}
        </p>

        {mode === 'choices' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 32 }}>
            <Button size="lg" variant="solid" full icon="apple" onClick={() => setMode('apikey')} style={{ background: '#fff', color: '#000', border: 'none' }}>
              Continue with Apple
            </Button>
            <button onClick={() => setMode('apikey')} style={{ height: 58, borderRadius: 16, border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 16.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
              <Icon name="google" size={19} sw={0} fill /> Continue with Google
            </button>
            <button onClick={() => setMode('email')} style={{ height: 58, borderRadius: 16, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 16.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
              Continue with email
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button onClick={() => setMode('apikey')} style={{ height: 58, borderRadius: 16, border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 15.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
              <Icon name="key" size={20} color="var(--brand-2)" /> Set up API key
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 30 }}>
            <input autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
              style={{ width: '100%', height: 56, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', fontFamily: 'var(--ui)', fontSize: 16, padding: '0 18px', outline: 'none' }} />
            <Button size="lg" full onClick={() => setMode('apikey')} style={{ marginTop: 14 }} disabled={!email.includes('@')}>
              Continue
            </Button>
          </div>
        )}
      </div>

      <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 14, width: '100%', textAlign: 'center' }}>
        Skip — explore without signing in
      </button>

      <p style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
        By continuing you agree to our <span style={{ color: 'var(--text-2)' }}>Terms</span> & <span style={{ color: 'var(--text-2)' }}>Privacy Policy</span>.<br />Analysis is informational, not financial advice.
      </p>
    </div>
  );
}

Object.assign(window, { Onboarding, AuthScreen });
