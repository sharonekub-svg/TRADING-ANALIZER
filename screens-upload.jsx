/* screens-upload.jsx — Manual chart form + Loading screen (free, no AI) */

function UploadScreen({ nav }) {
  const [tf, setTf] = uS('4H');
  const [asset, setAsset] = uS('');
  const [price, setPrice] = uS('');
  const [support1, setSupport1] = uS('');
  const [support2, setSupport2] = uS('');
  const [resist1, setResist1] = uS('');
  const [resist2, setResist2] = uS('');

  // Trend
  const [trend, setTrend] = uS('bullish');
  const [strength, setStrength] = uS('moderate');

  // EMA
  const [emaAlign, setEmaAlign] = uS('bullish');

  // RSI
  const [rsiZone, setRsiZone] = uS('neutral');
  const [rsiTrend, setRsiTrend] = uS('flat');
  const [rsiValue, setRsiValue] = uS('');

  // MACD
  const [macd, setMacd] = uS('none');

  // Volume
  const [volume, setVolume] = uS('none');

  // Market structure
  const [bos, setBos] = uS('none');
  const [choch, setChoch] = uS('none');
  const [hhhl, setHhhl] = uS(false);
  const [lhll, setLhll] = uS(false);

  // Last candle
  const [lastCandle, setLastCandle] = uS('doji');

  // Premium/Discount
  const [pd, setPd] = uS('equilibrium');

  const TFS = ['1m','5m','15m','30m','1H','4H','1D','1W','1M'];

  function onAnalyze() {
    const msDir = bos === 'bullish' || choch === 'bullish' || hhhl ? 'bullish'
                : bos === 'bearish' || choch === 'bearish' || lhll ? 'bearish'
                : 'neutral';
    const msType = bos !== 'none' ? 'bos' : choch !== 'none' ? 'choch' : 'continuation';

    window.PENDING_ANALYSIS = {
      timeframe: tf,
      formData: {
        asset: asset || 'CHART',
        price: price ? parseFloat(price) : null,
        tf,
        trend,
        strength,
        emaAlignment: emaAlign,
        sma50: emaAlign !== 'none' ? emaAlign === 'bullish' : null,
        rsiZone,
        rsiTrend,
        rsiValue: rsiValue ? parseFloat(rsiValue) : null,
        macd: macd !== 'none' ? macd : null,
        macdCross: 'none',
        bbPosition: null,
        volumeVisible: volume !== 'none',
        volumeAbove: volume === 'above',
        volumeTrend: volume === 'above' ? 'increasing' : volume === 'below' ? 'decreasing' : 'average',
        bos,
        choch,
        hhhl,
        lhll,
        msType,
        msDirection: msDir,
        lastCandle,
        candlePattern: 'none',
        chartPattern: 'none',
        patternCompletion: 0,
        patternBreakout: false,
        chartPatternDir: 'none',
        orderBlock: 'none',
        orderBlockNear: false,
        premiumDiscount: pd,
        liquidityAbove: pd === 'premium',
        liquidityBelow: pd === 'discount',
        support: [support1 ? parseFloat(support1) : null, support2 ? parseFloat(support2) : null].filter(Boolean),
        resistance: [resist1 ? parseFloat(resist1) : null, resist2 ? parseFloat(resist2) : null].filter(Boolean),
      },
    };
    nav.replace('loading', { pendingKey: Date.now() });
  }

  function Section({ title, children }) {
    return (
      <div style={{ background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 11, color: 'var(--text-3)', letterSpacing: 1.2, textTransform: 'uppercase' }}>{title}</div>
        {children}
      </div>
    );
  }

  function Pills({ options, value, onChange }) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(o => {
          const v = o.v !== undefined ? o.v : o;
          const label = o.label !== undefined ? o.label : o;
          const on = v === value;
          return (
            <button key={String(v)} onClick={() => onChange(v)} style={{
              height: 32, padding: '0 12px', borderRadius: 10,
              background: on ? 'var(--brand-grad)' : 'var(--bg-3)',
              border: on ? 'none' : '1px solid var(--border)',
              color: on ? '#fff' : 'var(--text-2)',
              fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 12.5,
              cursor: 'pointer',
              boxShadow: on ? '0 4px 12px -4px var(--brand-glow)' : 'none',
              transition: 'all .15s',
            }}>{label}</button>
          );
        })}
      </div>
    );
  }

  const curMs = bos !== 'none' ? (bos === 'bullish' ? 'bullish_bos' : 'bearish_bos')
              : choch !== 'none' ? (choch === 'bullish' ? 'bullish_choch' : 'bearish_choch')
              : 'range';

  return (
    <div style={{ minHeight: '100%', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '62px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav.back()} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={20} color="var(--text)" />
        </button>
        <div>
          <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>Chart Analysis</div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)' }}>103 strategies · free · no AI needed</div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Asset & Price */}
        <Section title="Asset & Price">
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={asset} onChange={e => setAsset(e.target.value)} placeholder="BTC/USDT, AAPL, EUR/USD…"
              style={{ flex: 2, height: 44, borderRadius: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--ui)', fontSize: 14, padding: '0 14px', outline: 'none' }} />
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" type="number"
              style={{ flex: 1, height: 44, borderRadius: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 14, padding: '0 12px', outline: 'none' }} />
          </div>
        </Section>

        {/* Timeframe */}
        <Section title="Timeframe">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TFS.map(t => (
              <button key={t} onClick={() => setTf(t)} style={{
                height: 32, padding: '0 12px', borderRadius: 10,
                background: tf === t ? 'var(--brand-grad)' : 'var(--bg-3)',
                border: tf === t ? 'none' : '1px solid var(--border)',
                color: tf === t ? '#fff' : 'var(--text-3)',
                fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 12.5,
                cursor: 'pointer',
                boxShadow: tf === t ? '0 4px 12px -4px var(--brand-glow)' : 'none',
                transition: 'all .15s',
              }}>{t}</button>
            ))}
          </div>
        </Section>

        {/* Trend */}
        <Section title="Trend Direction">
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { v: 'bullish',  label: '↑ Bullish',  bg: 'linear-gradient(135deg,#25D07C,#1ba863)' },
              { v: 'sideways', label: '↔ Sideways', bg: 'linear-gradient(135deg,#888,#555)' },
              { v: 'bearish',  label: '↓ Bearish',  bg: 'linear-gradient(135deg,#FF4D5E,#c93040)' },
            ].map(o => (
              <button key={o.v} onClick={() => setTrend(o.v)} style={{
                flex: 1, height: 46, borderRadius: 12,
                background: trend === o.v ? o.bg : 'var(--bg-3)',
                border: trend === o.v ? 'none' : '1px solid var(--border)',
                color: trend === o.v ? '#fff' : 'var(--text-2)',
                fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 13.5,
                cursor: 'pointer', transition: 'all .15s',
                boxShadow: trend === o.v ? '0 6px 18px -6px rgba(0,0,0,0.4)' : 'none',
              }}>{o.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['strong','moderate','weak'].map(s => (
              <button key={s} onClick={() => setStrength(s)} style={{
                flex: 1, height: 32, borderRadius: 10,
                background: strength === s ? 'var(--bg-4)' : 'var(--bg-3)',
                border: `1px solid ${strength === s ? 'var(--border-strong)' : 'var(--border)'}`,
                color: strength === s ? 'var(--text)' : 'var(--text-3)',
                fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 12.5,
                cursor: 'pointer', transition: 'all .15s', textTransform: 'capitalize',
              }}>{s}</button>
            ))}
          </div>
        </Section>

        {/* EMA */}
        <Section title="Moving Averages (EMA/SMA)">
          <Pills
            options={[
              { v: 'bullish', label: 'Price above EMAs (bullish)' },
              { v: 'mixed',   label: 'Mixed' },
              { v: 'bearish', label: 'Price below EMAs (bearish)' },
              { v: 'none',    label: 'Not visible' },
            ]}
            value={emaAlign}
            onChange={setEmaAlign}
          />
        </Section>

        {/* RSI */}
        <Section title="RSI">
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Zone</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {[
              { v: 'oversold',   label: 'Oversold\n<30', bg: 'linear-gradient(135deg,#25D07C,#1ba863)' },
              { v: 'neutral',    label: 'Neutral\n30–70', bg: 'linear-gradient(135deg,#888,#555)' },
              { v: 'overbought', label: 'Overbought\n>70', bg: 'linear-gradient(135deg,#FF4D5E,#c93040)' },
            ].map(o => (
              <button key={o.v} onClick={() => setRsiZone(o.v)} style={{
                flex: 1, height: 44, borderRadius: 10,
                background: rsiZone === o.v ? o.bg : 'var(--bg-3)',
                border: rsiZone === o.v ? 'none' : '1px solid var(--border)',
                color: rsiZone === o.v ? '#fff' : 'var(--text-2)',
                fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 11,
                cursor: 'pointer', transition: 'all .15s',
                whiteSpace: 'pre-line', lineHeight: 1.3,
              }}>{o.label}</button>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', marginTop: 2, marginBottom: 2 }}>Direction</div>
          <Pills
            options={[{ v: 'rising', label: 'Rising' }, { v: 'flat', label: 'Flat' }, { v: 'falling', label: 'Falling' }]}
            value={rsiTrend}
            onChange={setRsiTrend}
          />
          <input value={rsiValue} onChange={e => setRsiValue(e.target.value)} placeholder="RSI value (optional, e.g. 42)"
            type="number" min="0" max="100"
            style={{ width: '100%', height: 40, borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '0 12px', outline: 'none', boxSizing: 'border-box' }} />
        </Section>

        {/* MACD */}
        <Section title="MACD Histogram">
          <Pills
            options={[
              { v: 'positive_rising',  label: 'Positive ↑' },
              { v: 'positive_falling', label: 'Positive ↓' },
              { v: 'negative_rising',  label: 'Negative ↑' },
              { v: 'negative_falling', label: 'Negative ↓' },
              { v: 'none',             label: 'Not visible' },
            ]}
            value={macd}
            onChange={setMacd}
          />
        </Section>

        {/* Volume */}
        <Section title="Volume">
          <Pills
            options={[
              { v: 'above',   label: 'Above average' },
              { v: 'average', label: 'Average' },
              { v: 'below',   label: 'Below average' },
              { v: 'none',    label: 'Not visible' },
            ]}
            value={volume}
            onChange={setVolume}
          />
        </Section>

        {/* Market Structure */}
        <Section title="Market Structure (SMC)">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { v: 'bullish_bos',   label: 'BOS ↑',    isBos: true,   dir: 'bullish', c: 'var(--bull)' },
              { v: 'bullish_choch', label: 'CHoCH ↑',  isChoch: true, dir: 'bullish', c: 'var(--bull)' },
              { v: 'range',         label: 'Range',                                   c: 'var(--text-2)' },
              { v: 'bearish_choch', label: 'CHoCH ↓',  isChoch: true, dir: 'bearish', c: 'var(--bear)' },
              { v: 'bearish_bos',   label: 'BOS ↓',    isBos: true,   dir: 'bearish', c: 'var(--bear)' },
            ].map(o => {
              const on = curMs === o.v;
              return (
                <button key={o.v} onClick={() => {
                  if (o.isBos)   { setBos(o.dir); setChoch('none'); }
                  else if (o.isChoch) { setChoch(o.dir); setBos('none'); }
                  else           { setBos('none'); setChoch('none'); }
                }} style={{
                  height: 34, padding: '0 12px', borderRadius: 10,
                  background: on ? 'var(--brand-grad)' : 'var(--bg-3)',
                  border: on ? 'none' : '1px solid var(--border)',
                  color: on ? '#fff' : o.c,
                  fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 12.5,
                  cursor: 'pointer', transition: 'all .15s',
                  boxShadow: on ? '0 4px 12px -4px var(--brand-glow)' : 'none',
                }}>{o.label}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button onClick={() => { setHhhl(!hhhl); if (!hhhl) setLhll(false); }} style={{
              flex: 1, height: 36, borderRadius: 10,
              background: hhhl ? 'rgba(37,208,124,0.18)' : 'var(--bg-3)',
              border: `1px solid ${hhhl ? 'rgba(37,208,124,0.4)' : 'var(--border)'}`,
              color: hhhl ? 'var(--bull)' : 'var(--text-3)',
              fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
            }}>HH / HL (bullish)</button>
            <button onClick={() => { setLhll(!lhll); if (!lhll) setHhhl(false); }} style={{
              flex: 1, height: 36, borderRadius: 10,
              background: lhll ? 'rgba(255,77,94,0.15)' : 'var(--bg-3)',
              border: `1px solid ${lhll ? 'rgba(255,77,94,0.3)' : 'var(--border)'}`,
              color: lhll ? 'var(--bear)' : 'var(--text-3)',
              fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
            }}>LH / LL (bearish)</button>
          </div>
        </Section>

        {/* Last Candle */}
        <Section title="Last Candle">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { v: 'strong_bullish', label: 'Strong Bull', c: '#25D07C' },
              { v: 'bullish',        label: 'Bullish',     c: '#25D07C' },
              { v: 'hammer',         label: 'Hammer',      c: '#25D07C' },
              { v: 'doji',           label: 'Doji',        c: '#888' },
              { v: 'bearish',        label: 'Bearish',     c: '#FF4D5E' },
              { v: 'shooting_star',  label: 'Shooting ⭐',  c: '#FF4D5E' },
              { v: 'strong_bearish', label: 'Strong Bear', c: '#FF4D5E' },
            ].map(o => {
              const on = lastCandle === o.v;
              return (
                <button key={o.v} onClick={() => setLastCandle(o.v)} style={{
                  height: 32, padding: '0 10px', borderRadius: 10,
                  background: on ? o.c : 'var(--bg-3)',
                  border: on ? 'none' : '1px solid var(--border)',
                  color: on ? '#fff' : 'var(--text-2)',
                  fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 12,
                  cursor: 'pointer', transition: 'all .15s',
                  boxShadow: on ? `0 4px 12px -4px ${o.c}88` : 'none',
                }}>{o.label}</button>
              );
            })}
          </div>
        </Section>

        {/* Price Levels */}
        <Section title="Price Levels (optional)">
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={support1} onChange={e => setSupport1(e.target.value)} placeholder="Support 1" type="number"
              style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--bg-3)', border: '1px solid rgba(37,208,124,0.3)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '0 12px', outline: 'none' }} />
            <input value={support2} onChange={e => setSupport2(e.target.value)} placeholder="Support 2" type="number"
              style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--bg-3)', border: '1px solid rgba(37,208,124,0.3)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '0 12px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={resist1} onChange={e => setResist1(e.target.value)} placeholder="Resistance 1" type="number"
              style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--bg-3)', border: '1px solid rgba(255,77,94,0.3)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '0 12px', outline: 'none' }} />
            <input value={resist2} onChange={e => setResist2(e.target.value)} placeholder="Resistance 2" type="number"
              style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--bg-3)', border: '1px solid rgba(255,77,94,0.3)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '0 12px', outline: 'none' }} />
          </div>

          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Price Zone</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {[
              { v: 'premium',      label: 'Premium\n(overpriced)',  bg: 'rgba(255,77,94,0.15)',    border: 'rgba(255,77,94,0.3)',    c: 'var(--bear)' },
              { v: 'equilibrium',  label: 'Fair\nValue',           bg: 'var(--bg-4)',              border: 'var(--border-strong)',  c: 'var(--text-2)' },
              { v: 'discount',     label: 'Discount\n(cheap)',     bg: 'rgba(37,208,124,0.12)',    border: 'rgba(37,208,124,0.3)',  c: 'var(--bull)' },
            ].map(o => (
              <button key={o.v} onClick={() => setPd(o.v)} style={{
                flex: 1, height: 44, borderRadius: 10,
                background: pd === o.v ? o.bg : 'var(--bg-3)',
                border: `1px solid ${pd === o.v ? o.border : 'var(--border)'}`,
                color: pd === o.v ? o.c : 'var(--text-3)',
                fontFamily: 'var(--ui)', fontWeight: 650, fontSize: 11,
                cursor: 'pointer', transition: 'all .15s',
                whiteSpace: 'pre-line', lineHeight: 1.3,
              }}>{o.label}</button>
            ))}
          </div>
        </Section>

        <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5, padding: '4px 4px' }}>
          Educational purposes only — not financial advice
        </div>

      </div>

      {/* Sticky Analyze button */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 402, padding: '12px 20px 32px', background: 'linear-gradient(to top, var(--bg) 60%, transparent)', zIndex: 30 }}>
        <button onClick={onAnalyze} style={{
          width: '100%', height: 52, borderRadius: 16,
          background: 'var(--brand-grad)', border: 'none', color: '#fff',
          fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 16,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 10px 28px -8px var(--brand-glow)', transition: 'all .2s',
        }}>
          <Icon name="sparkles" size={19} color="#fff" />
          Run 103 Strategies — Free
        </button>
      </div>
    </div>
  );
}

/* ─── Loading Screen ─── */
function LoadingScreen({ nav, pendingKey }) {
  const [phase, setPhase]       = uS(0);
  const [progress, setProgress] = uS(0);
  const [stepsDone, setStepsDone] = uS([]);
  const [errorMsg, setErrorMsg] = uS('');
  const [count, setCount]       = uS(0);
  const startedRef = uR(false);

  const isForm = !!(window.PENDING_ANALYSIS && window.PENDING_ANALYSIS.formData);

  const STEPS = isForm ? [
    { key: 'evaluate',  label: 'Evaluating 103 strategies'    },
    { key: 'consensus', label: 'Computing weighted consensus' },
    { key: 'plan',      label: 'Generating trade plan'        },
  ] : [
    { key: 'vision',    label: 'Reading chart with AI vision' },
    { key: 'extract',   label: 'Extracting indicator values'  },
    { key: 'evaluate',  label: 'Evaluating 103 strategies'    },
    { key: 'consensus', label: 'Computing weighted consensus' },
    { key: 'plan',      label: 'Generating trade plan'        },
  ];

  function markStep(key) {
    setStepsDone(prev => prev.includes(key) ? prev : [...prev, key]);
  }

  uE(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    run();
  }, []);

  async function run() {
    const pending = window.PENDING_ANALYSIS;
    if (!pending) { setPhase(4); setErrorMsg('No data found. Please go back and try again.'); return; }

    try {
      setPhase(1);
      setProgress(8);
      markStep('evaluate');

      const progTimer = setInterval(() => {
        setProgress(p => p < 88 ? p + (isForm ? 5 : 1.2) : p);
      }, isForm ? 40 : 200);

      const countTimer = setInterval(() => {
        setCount(c => c < 103 ? c + (isForm ? 8 : 3) : 103);
      }, isForm ? 20 : 60);

      if (isForm) {
        setTimeout(() => markStep('consensus'), 400);
        setTimeout(() => { setPhase(2); markStep('plan'); }, 700);
        await new Promise(r => setTimeout(r, 1100));
      } else {
        setTimeout(() => markStep('extract'),   1800);
        setTimeout(() => { setPhase(2); markStep('evaluate'); }, 3200);
        setTimeout(() => markStep('consensus'), 5000);
        setTimeout(() => markStep('plan'),      6200);
      }

      let analysis;
      if (isForm) {
        analysis = window.ENGINE.analyzeFromForm(pending.formData, pending.timeframe);
      } else {
        const apiKey = window.DATA.ApiKey.get();
        if (!apiKey) {
          clearInterval(progTimer);
          clearInterval(countTimer);
          setPhase(4);
          setErrorMsg('No API key set. Go to Profile → API Key to add your Anthropic key.');
          return;
        }
        analysis = await window.ENGINE.analyzeChart(pending.imageBase64, pending.mimeType, apiKey, pending.timeframe);
      }

      clearInterval(progTimer);
      clearInterval(countTimer);
      setCount(103);
      setProgress(100);
      setPhase(3);

      window.DATA.History.prepend(analysis);
      window.PENDING_ANALYSIS = null;

      setTimeout(() => nav.replace('results', { id: analysis.id }), 700);

    } catch (err) {
      setPhase(4);
      const msg = err?.message || String(err);
      if (msg.includes('401') || msg.includes('authentication')) {
        setErrorMsg('Invalid API key. Check your Anthropic key in Profile settings.');
      } else if (msg.includes('429')) {
        setErrorMsg('Rate limit reached. Wait a moment and try again.');
      } else {
        setErrorMsg('Analysis failed: ' + msg.slice(0, 120));
      }
    }
  }

  const isError = phase === 4;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      {isError ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(255,77,94,0.15)', border: '1px solid rgba(255,77,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="alert" size={32} color="var(--bear)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 10 }}>Analysis Failed</div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 300 }}>{errorMsg}</div>
          </div>
          <button onClick={() => nav.back()} style={{ width: '100%', height: 48, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Animated orb */}
          <div style={{ position: 'relative', width: 130, height: 130, marginBottom: 32 }}>
            <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,255,0.18) 0%, transparent 70%)', animation: 'pulse 2.4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(124,108,255,0.2)', animation: 'spin 8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(139,124,255,0.35)', animation: 'spin 5s linear infinite reverse' }} />
            <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #8B7CFF, #6E8BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(124,108,255,0.5)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{count}</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 9.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>strategies</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.4 }}>
              {phase === 3 ? 'Analysis Complete' : 'Analyzing…'}
            </div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
              {phase === 3 ? 'Verdict ready' : isForm ? 'Running algorithm — free & instant' : 'Powered by Claude Vision AI'}
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 320, height: 5, borderRadius: 10, background: 'var(--bg-3)', marginBottom: 26, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'var(--brand-grad)', width: `${progress}%`, transition: 'width .3s ease', boxShadow: '0 0 10px var(--brand-glow)' }} />
          </div>

          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((s, i) => {
              const done = stepsDone.includes(s.key);
              const active = !done && stepsDone.length === i;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: done || active ? 1 : 0.35, transition: 'opacity .3s' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: done ? 'rgba(37,208,124,0.15)' : active ? 'rgba(124,108,255,0.15)' : 'var(--bg-3)', border: `1px solid ${done ? 'rgba(37,208,124,0.35)' : active ? 'rgba(124,108,255,0.35)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .3s' }}>
                    {done
                      ? <Icon name="check" size={13} color="var(--bull)" />
                      : active
                        ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-2)', animation: 'pulse 1s ease-in-out infinite' }} />
                        : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)' }} />
                    }
                  </div>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 13, fontWeight: done ? 600 : active ? 700 : 400, color: done ? 'var(--text-2)' : active ? 'var(--text)' : 'var(--text-3)', transition: 'all .3s' }}>{s.label}</div>
                  {active && <div style={{ marginLeft: 'auto', fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--brand-2)', animation: 'pulse 1.5s ease-in-out infinite' }}>running…</div>}
                  {done && <div style={{ marginLeft: 'auto', fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--bull)' }}>done</div>}
                </div>
              );
            })}
          </div>

          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5, marginTop: 32, padding: '0 8px' }}>
            Educational analysis only — not financial advice
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { UploadScreen, LoadingScreen });
