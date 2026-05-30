/* screens-results.jsx — Results screen (3 tabs: Overview / Trade Plan / Factors) */

function ResultsScreen({ nav, analysis }) {
  const [tab, setTab] = uS('overview');
  const a = analysis;

  const recTone  = a.rec === 'BUY' ? 'bull' : a.rec === 'SELL' ? 'bear' : 'neutral';
  const recColor = a.rec === 'BUY' ? 'var(--bull)' : a.rec === 'SELL' ? 'var(--bear)' : 'var(--text-2)';

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>

      {/* Header */}
      <div style={{ padding: '62px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button onClick={() => nav.back()} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="chevL" size={20} color="var(--text)" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{a.name}</span>
              <Badge tone="neutral" size="sm">{a.tf}</Badge>
            </div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{a.when}</div>
          </div>
          <button onClick={() => nav.go('saved')} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="save" size={19} color="var(--text)" />
          </button>
        </div>

        {/* Hero verdict card */}
        <div style={{
          borderRadius: 22,
          padding: '20px 20px 18px',
          background: a.rec === 'BUY'
            ? 'linear-gradient(135deg, rgba(37,208,124,0.14), rgba(37,208,124,0.04))'
            : a.rec === 'SELL'
              ? 'linear-gradient(135deg, rgba(255,77,94,0.14), rgba(255,77,94,0.04))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          border: `1px solid ${a.rec === 'BUY' ? 'rgba(37,208,124,0.3)' : a.rec === 'SELL' ? 'rgba(255,77,94,0.3)' : 'var(--border)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>AI Verdict</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 700, color: recColor, letterSpacing: -1, lineHeight: 1 }}>{a.rec}</div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
                {a.conf}% confidence · <span style={{ color: a.risk === 'HIGH' ? 'var(--bear)' : a.risk === 'MEDIUM' ? 'var(--gold)' : 'var(--bull)' }}>{a.risk} risk</span>
              </div>
            </div>
            <Gauge value={a.conf} size={82} color={recColor} label={`${a.conf}%`} />
          </div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-2)', marginTop: 14, lineHeight: 1.6 }}>{a.summary}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, padding: '18px 20px 0', borderBottom: '1px solid var(--border)' }}>
        {['overview', 'plan', 'factors'].map(t => {
          const labels = { overview: 'Overview', plan: 'Trade Plan', factors: 'Factors' };
          const on = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, height: 38, border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--ui)', fontWeight: on ? 700 : 600, fontSize: 13.5,
              color: on ? 'var(--text)' : 'var(--text-3)',
              borderBottom: `2px solid ${on ? 'var(--brand-2)' : 'transparent'}`,
              marginBottom: -1, transition: 'all .15s',
            }}>{labels[t]}</button>
          );
        })}
      </div>

      <div style={{ padding: '18px 16px 0' }}>
        {tab === 'overview' && <OverviewTab a={a} nav={nav} />}
        {tab === 'plan'     && <PlanTab a={a} />}
        {tab === 'factors'  && <FactorsTab a={a} />}
      </div>
    </div>
  );
}

/* ─── Overview tab ─── */
function OverviewTab({ a, nav }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Price + change */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '13px 14px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3 }}>{a.price}</div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Current price</div>
        </div>
        <div style={{ flex: 1, padding: '13px 14px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: a.up ? 'var(--bull)' : 'var(--bear)', letterSpacing: -0.3 }}>{a.chg}</div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Change ({a.tf})</div>
        </div>
      </div>

      {/* Strategy consensus */}
      <div style={{ background: 'var(--bg-2)', borderRadius: 18, border: '1px solid var(--border)', padding: '16px 16px' }}>
        <SectionHead title="Strategy consensus" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {a.consensus.map((g, i) => {
            const pct = Math.round((g.bull / (g.bull + g.bear + g.neutral || 1)) * 100);
            const tone = pct >= 60 ? 'var(--bull)' : pct <= 40 ? 'var(--bear)' : 'var(--text-3)';
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' }}>{g.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: tone }}>{pct}% bull</span>
                </div>
                <div style={{ height: 5, borderRadius: 10, background: 'var(--bg-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: pct >= 60 ? 'var(--bull)' : pct <= 40 ? 'var(--bear)' : 'var(--text-3)', transition: 'width .5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market structure */}
      <div style={{ padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginBottom: 5 }}>Market Structure</div>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{a.structure}</div>
      </div>

      {/* Support / Resistance */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '13px 14px' }}>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, fontWeight: 700, color: 'var(--bull)', marginBottom: 8 }}>SUPPORT</div>
          {(a.support || []).map((s, i) => (
            <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--text-2)', marginTop: 4 }}>{s}</div>
          ))}
        </div>
        <div style={{ flex: 1, background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '13px 14px' }}>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, fontWeight: 700, color: 'var(--bear)', marginBottom: 8 }}>RESISTANCE</div>
          {(a.resist || []).map((r, i) => (
            <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--text-2)', marginTop: 4 }}>{r}</div>
          ))}
        </div>
      </div>

      {/* Liquidity zones */}
      {(a.liquidity || []).length > 0 && (
        <div style={{ background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '13px 14px' }}>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, fontWeight: 700, color: 'var(--brand-2)', marginBottom: 8 }}>LIQUIDITY ZONES</div>
          {a.liquidity.map((l, i) => (
            <div key={i} style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--text-2)', marginTop: 4 }}>{l}</div>
          ))}
        </div>
      )}

      {/* Scan another */}
      <button onClick={() => nav.go('upload')} style={{ width: '100%', height: 48, borderRadius: 14, background: 'var(--brand-grad)', border: 'none', color: '#fff', fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 8px 24px -8px var(--brand-glow)' }}>
        <Icon name="scan" size={18} color="#fff" sw={2} /> Analyze Another Chart
      </button>
    </div>
  );
}

/* ─── Trade Plan tab ─── */
function PlanTab({ a }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Entry */}
      <div style={{ background: 'var(--bg-2)', borderRadius: 18, border: '1px solid var(--border)', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Entry & Exits</div>

        <PlanRow label="Entry zone" value={a.entry} tone="var(--brand-2)" />
        <PlanRow label="Stop loss"  value={a.stop}  tone="var(--bear)" />

        {(a.targets || []).map((t, i) => (
          <PlanRow key={i} label={`Target ${i + 1}`} value={t} tone="var(--bull)" />
        ))}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)' }}>Risk / Reward</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{a.rr}</span>
          </div>
        </div>
      </div>

      {/* Strategies used */}
      <div style={{ background: 'var(--bg-2)', borderRadius: 18, border: '1px solid var(--border)', padding: '16px 16px' }}>
        <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Strategies evaluated</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {(a.strategies || 103) && Array.from({ length: 0 }).map((_, i) => null)}
          <Badge tone="brand">{a.strategies || 103} strategies</Badge>
          <Badge tone="neutral">10 groups</Badge>
          <Badge tone={a.rec === 'BUY' ? 'bull' : a.rec === 'SELL' ? 'bear' : 'neutral'}>{a.rec} consensus</Badge>
        </div>
        <div style={{ marginTop: 12, fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>
          Each strategy returned a signal (Bullish / Bearish / Neutral) weighted by group and timeframe. The final verdict reflects the weighted aggregate across all evaluated signals.
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,77,94,0.07)', border: '1px solid rgba(255,77,94,0.2)' }}>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.55 }}>
          <span style={{ color: 'var(--bear)', fontWeight: 700 }}>Disclaimer: </span>
          This analysis is for educational purposes only. Not financial advice. Always use your own judgment and risk management. Past performance does not guarantee future results.
        </div>
      </div>
    </div>
  );
}

function PlanRow({ label, value, tone }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: tone }}>{value}</span>
    </div>
  );
}

/* ─── Factors tab ─── */
function FactorsTab({ a }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Bull factors */}
      <div style={{ background: 'var(--bg-2)', borderRadius: 18, border: '1px solid rgba(37,208,124,0.2)', padding: '16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="trendUp" size={16} color="var(--bull)" />
          <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--bull)' }}>Bullish factors</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {(a.bull || []).map((f, i) => (
            <FactorRow key={i} text={f} tone="bull" />
          ))}
          {(!a.bull || a.bull.length === 0) && (
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)' }}>No significant bullish factors identified.</div>
          )}
        </div>
      </div>

      {/* Bear factors */}
      <div style={{ background: 'var(--bg-2)', borderRadius: 18, border: '1px solid rgba(255,77,94,0.2)', padding: '16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="trendDown" size={16} color="var(--bear)" />
          <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--bear)' }}>Bearish factors</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {(a.bear || []).map((f, i) => (
            <FactorRow key={i} text={f} tone="bear" />
          ))}
          {(!a.bear || a.bear.length === 0) && (
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)' }}>No significant bearish factors identified.</div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Full Analysis Summary</div>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{a.summary}</div>
      </div>
    </div>
  );
}

function FactorRow({ text, tone }) {
  const color = tone === 'bull' ? 'var(--bull)' : 'var(--bear)';
  const bg    = tone === 'bull' ? 'rgba(37,208,124,0.12)' : 'rgba(255,77,94,0.12)';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 18, height: 18, borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        {tone === 'bull'
          ? <Icon name="trendUp" size={10} color={color} />
          : <Icon name="trendDown" size={10} color={color} />
        }
      </div>
      <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{text}</div>
    </div>
  );
}

Object.assign(window, { ResultsScreen });
