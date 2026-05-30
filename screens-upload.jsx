/* screens-upload.jsx — Upload screen + Loading screen */

function UploadScreen({ nav }) {
  const [image, setImage] = uS(null); // { base64, mime, url }
  const [tf, setTf] = uS('4H');
  const [dragging, setDragging] = uS(false);
  const fileRef = uR(null);

  const TFS = ['1m','5m','15m','30m','1H','4H','1D','1W','1M'];

  function readFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target.result;
      const base64 = url.split(',')[1];
      const mime = file.type;
      setImage({ base64, mime, url });
    };
    reader.readAsDataURL(file);
  }

  function onFileChange(e) { readFile(e.target.files[0]); }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    readFile(e.dataTransfer.files[0]);
  }

  function onAnalyze() {
    if (!image) return;
    window.PENDING_ANALYSIS = { imageBase64: image.base64, mimeType: image.mime, timeframe: tf };
    nav.replace('loading', { pendingKey: Date.now() });
  }

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '62px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav.back()} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={20} color="var(--text)" />
        </button>
        <div>
          <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>Upload Chart</div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)' }}>103 strategy analysis</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            borderRadius: 20,
            border: `2px dashed ${dragging ? 'var(--brand-2)' : image ? 'var(--brand)' : 'var(--border-strong)'}`,
            background: dragging ? 'rgba(124,108,255,0.08)' : image ? 'var(--bg-2)' : 'var(--bg-2)',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            transition: 'border-color .2s, background .2s',
          }}
        >
          {image ? (
            <>
              <img src={image.url} alt="chart" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, borderRadius: 18 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', borderRadius: 18 }} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(37,208,124,0.2)', border: '1px solid rgba(37,208,124,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={22} color="var(--bull)" />
                </div>
                <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: '#fff' }}>Chart ready</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Tap to change</div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(124,108,255,0.12)', border: '1px solid rgba(124,108,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="upload" size={26} color="var(--brand-2)" sw={2} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Upload TradingView screenshot</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.5 }}>Tap to browse files or drag & drop<br/>PNG, JPG, WEBP supported</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <div style={{ height: 30, padding: '0 12px', borderRadius: 9, background: 'rgba(124,108,255,0.12)', border: '1px solid rgba(124,108,255,0.25)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--ui)', fontSize: 12, fontWeight: 600, color: 'var(--brand-2)' }}>
                  <Icon name="upload" size={13} color="var(--brand-2)" /> Browse
                </div>
                <div style={{ height: 30, padding: '0 12px', borderRadius: 9, background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--ui)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
                  <Icon name="camera" size={13} color="var(--text-2)" /> Camera
                </div>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} style={{ display: 'none' }} />
        </div>

        {/* Timeframe selector */}
        <div style={{ background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 14px' }}>
          <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>Timeframe</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {TFS.map(t => (
              <button key={t} onClick={() => setTf(t)} style={{
                height: 32, padding: '0 12px', borderRadius: 9,
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
        </div>

        {/* Tips */}
        <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(240,194,104,0.07)', border: '1px solid rgba(240,194,104,0.2)' }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Icon name="alert" size={15} color="var(--gold)" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Best results: </span>
              Use full-screen TradingView charts with indicators visible. Higher resolution = better pattern detection.
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5, padding: '0 4px' }}>
          For educational purposes only. Not financial advice. Always conduct your own research before trading.
        </div>

      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 402, padding: '12px 20px 32px', background: 'linear-gradient(to top, var(--bg) 60%, transparent)', zIndex: 30 }}>
        <button
          onClick={onAnalyze}
          disabled={!image}
          style={{
            width: '100%', height: 52, borderRadius: 16,
            background: image ? 'var(--brand-grad)' : 'var(--bg-3)',
            border: image ? 'none' : '1px solid var(--border)',
            color: image ? '#fff' : 'var(--text-3)',
            fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 16,
            cursor: image ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: image ? '0 10px 28px -8px var(--brand-glow)' : 'none',
            transition: 'all .2s',
          }}
        >
          <Icon name="sparkles" size={19} color={image ? '#fff' : 'var(--text-3)'} />
          {image ? 'Analyze Chart' : 'Select a chart to continue'}
        </button>
      </div>
    </div>
  );
}

/* ─── Loading Screen ─── */
function LoadingScreen({ nav, pendingKey }) {
  const [phase, setPhase]     = uS(0);    // 0=init 1=calling 2=evaluating 3=done 4=error
  const [progress, setProgress] = uS(0);
  const [stepsDone, setStepsDone] = uS([]);
  const [errorMsg, setErrorMsg] = uS('');
  const [count, setCount]     = uS(0);    // animated strategy counter
  const startedRef = uR(false);

  const STEPS = [
    { key: 'vision',    label: 'Reading chart with AI vision' },
    { key: 'extract',   label: 'Extracting indicator values'  },
    { key: 'evaluate',  label: 'Evaluating 103 strategies'    },
    { key: 'consensus', label: 'Computing weighted consensus' },
    { key: 'plan',      label: 'Generating trade plan'        },
  ];

  uE(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    run();
  }, []);

  async function run() {
    const pending = window.PENDING_ANALYSIS;
    if (!pending) { setPhase(4); setErrorMsg('No image found. Please go back and upload a chart.'); return; }

    const apiKey = window.DATA.ApiKey.get();
    if (!apiKey) {
      setPhase(4);
      setErrorMsg('No API key set. Go to Profile → API Key to add your Anthropic key.');
      return;
    }

    try {
      setPhase(1);
      setProgress(5);
      markStep('vision');

      // Animate progress and step markers while API call happens
      const progTimer = setInterval(() => {
        setProgress(p => {
          if (p < 30) return p + 2;
          if (p < 60) return p + 0.8;
          if (p < 80) return p + 0.3;
          return p;
        });
      }, 200);

      const countTimer = setInterval(() => {
        setCount(c => c < 103 ? c + 3 : 103);
      }, 60);

      // Staggered step reveals
      setTimeout(() => markStep('extract'),   1800);
      setTimeout(() => { setPhase(2); markStep('evaluate'); }, 3200);
      setTimeout(() => markStep('consensus'), 5000);
      setTimeout(() => markStep('plan'),      6200);

      const analysis = await window.ENGINE.analyzeChart(
        pending.imageBase64, pending.mimeType, apiKey, pending.timeframe
      );

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
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setErrorMsg('Network error. Check your internet connection and try again.');
      } else {
        setErrorMsg('Analysis failed: ' + msg.slice(0, 120));
      }
    }
  }

  function markStep(key) {
    setStepsDone(prev => prev.includes(key) ? prev : [...prev, key]);
  }

  const isError = phase === 4;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>

      {isError ? (
        /* Error state */
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(255,77,94,0.15)', border: '1px solid rgba(255,77,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="alert" size={32} color="var(--bear)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 10 }}>Analysis Failed</div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 300 }}>{errorMsg}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
            <button onClick={() => nav.back()} style={{ flex: 1, height: 48, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Go Back
            </button>
            {errorMsg.includes('Profile') ? (
              <button onClick={() => nav.tab('profile')} style={{ flex: 1, height: 48, borderRadius: 14, background: 'var(--brand-grad)', border: 'none', color: '#fff', fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 18px -6px var(--brand-glow)' }}>
                Open Profile
              </button>
            ) : (
              <button onClick={() => { startedRef.current = false; setPhase(0); setProgress(0); setStepsDone([]); setCount(0); setErrorMsg(''); run(); }} style={{ flex: 1, height: 48, borderRadius: 14, background: 'var(--brand-grad)', border: 'none', color: '#fff', fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 18px -6px var(--brand-glow)' }}>
                Retry
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Animated orb */}
          <div style={{ position: 'relative', width: 130, height: 130, marginBottom: 32 }}>
            {/* Outer glow rings */}
            <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,255,0.18) 0%, transparent 70%)', animation: 'pulse 2.4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(124,108,255,0.2)', animation: 'spin 8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(139,124,255,0.35)', animation: 'spin 5s linear infinite reverse' }} />
            {/* Core */}
            <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #8B7CFF, #6E8BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(124,108,255,0.5)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{count}</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 9.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>strategies</div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.4 }}>
              {phase === 3 ? 'Analysis Complete' : 'Analyzing Chart…'}
            </div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
              {phase === 3 ? 'Verdict ready' : 'Powered by Claude Vision AI'}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', maxWidth: 320, height: 5, borderRadius: 10, background: 'var(--bg-3)', marginBottom: 26, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'var(--brand-grad)', width: `${progress}%`, transition: 'width .4s ease', boxShadow: '0 0 10px var(--brand-glow)' }} />
          </div>

          {/* Steps checklist */}
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

          {/* Disclaimer */}
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5, marginTop: 32, padding: '0 8px' }}>
            Educational analysis only — not financial advice
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { UploadScreen, LoadingScreen });
