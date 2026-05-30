/* screens-home.jsx — Home dashboard */

function StatTile({ label, value, sub, tone }) {
  return (
    <div style={{ flex: 1, padding: '13px 14px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: tone || 'var(--text)', letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontFamily: 'var(--ui)', fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function RecentRow({ a, nav }) {
  const tone = a.rec === 'BUY' ? 'bull' : a.rec === 'SELL' ? 'bear' : 'neutral';
  return (
    <div onClick={() => nav.go('results', { id: a.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)', cursor: 'pointer' }}>
      <AssetGlyph symbol={a.symbol} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{a.name}</span>
          <Badge tone="neutral" size="sm">{a.tf}</Badge>
        </div>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{a.when} · {a.strategies} strategies</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Badge tone={tone} icon={a.rec === 'BUY' ? 'trendUp' : a.rec === 'SELL' ? 'trendDown' : undefined}>{a.rec}</Badge>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-3)', marginTop: 5 }}>{a.conf}% conf</div>
      </div>
    </div>
  );
}

function HomeScreen({ nav }) {
  const D = window.DATA;
  const hasKey = D.ApiKey.hasKey();
  const used = 2, limit = 3;

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ paddingTop: 62, padding: '62px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#2A2E3A,#171A22)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>T</div>
            <div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)' }}>Good morning</div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Trader</div>
            </div>
          </div>
          <button onClick={() => nav.go('alerts')} style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="bell" size={21} color="var(--text)" />
            <div style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: '50%', background: 'var(--bear)', border: '2px solid var(--bg)' }} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* API key notice (shown when no key) */}
        {!hasKey && (
          <div onClick={() => nav.go('profile')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(124,108,255,0.1)', borderRadius: 16, border: '1px solid rgba(124,108,255,0.28)', cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="key" size={19} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Add your API key</div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>Required for real AI chart analysis</div>
            </div>
            <Icon name="chevR" size={18} color="var(--brand-2)" />
          </div>
        )}

        {/* Hero scan CTA */}
        <div onClick={() => nav.go('upload')} style={{ position: 'relative', borderRadius: 24, padding: 20, overflow: 'hidden', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(139,124,255,0.22), rgba(110,139,255,0.10))', border: '1px solid rgba(124,108,255,0.3)', boxShadow: '0 18px 40px -18px var(--brand-glow)' }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,255,0.35), transparent 70%)' }} />
          <div style={{ position: 'relative' }}>
            <Badge tone="brand" icon="sparkles" style={{ marginBottom: 14 }}>AI ANALYST — 103 STRATEGIES</Badge>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 23, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', letterSpacing: -0.4 }}>Analyze a chart</h2>
            <p style={{ fontFamily: 'var(--ui)', fontSize: 13.5, color: 'var(--text-2)', margin: '0 0 16px', maxWidth: 250 }}>Upload a TradingView screenshot for an instant verdict across 103 weighted strategies.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ height: 46, padding: '0 20px', borderRadius: 13, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 15, color: '#fff', boxShadow: '0 8px 20px -6px var(--brand-glow)' }}>
                <Icon name="upload" size={18} color="#fff" sw={2.2} /> Upload chart
              </div>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--bg-2)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="camera" size={20} color="var(--text)" />
              </div>
            </div>
          </div>
        </div>

        {/* Usage / plan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <Ring value={(used / limit) * 100} size={48} color="var(--brand-2)">
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{limit - used}</span>
          </Ring>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{limit - used} free {limit - used === 1 ? 'analysis' : 'analyses'} left today</div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Resets in 9h · Go unlimited with Pro</div>
          </div>
          <button onClick={() => nav.go('premium')} style={{ height: 34, padding: '0 14px', borderRadius: 10, background: 'rgba(240,194,104,0.14)', border: '1px solid rgba(240,194,104,0.3)', color: 'var(--gold)', fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Upgrade</button>
        </div>

        {/* Performance */}
        <div>
          <SectionHead title="Your performance" action="Journal" onAction={() => nav.tab('journal')} />
          <div style={{ display: 'flex', gap: 10 }}>
            <StatTile label="Win rate"     value="68%"   tone="var(--bull)" />
            <StatTile label="Avg R / trade" value="+1.9R" tone="var(--text)" />
            <StatTile label="Analyses"      value="142"   tone="var(--text)" />
          </div>
        </div>

        {/* Insights */}
        <div>
          <SectionHead title="Market insights" />
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px', scrollSnapType: 'x mandatory' }}>
            {D.INSIGHTS.map((ins, i) => (
              <div key={i} style={{ minWidth: 264, scrollSnapAlign: 'start', padding: 16, borderRadius: 18, flexShrink: 0, background: ins.tone === 'bull' ? 'linear-gradient(135deg, rgba(37,208,124,0.12), var(--bg-2))' : 'linear-gradient(135deg, rgba(240,194,104,0.1), var(--bg-2))', border: '1px solid var(--border)' }}>
                <Badge tone={ins.tone === 'bull' ? 'bull' : 'warn'} size="sm">{ins.tag}</Badge>
                <h4 style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '11px 0 6px' }}>{ins.title}</h4>
                <p style={{ fontFamily: 'var(--ui)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-2)', margin: 0 }}>{ins.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent analyses */}
        <div>
          <SectionHead title="Recent analyses" action="See all" onAction={() => nav.go('saved')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {D.ANALYSES.slice(0, 3).map(a => <RecentRow key={a.id} a={a} nav={nav} />)}
          </div>
        </div>

        {/* Watchlist preview */}
        <div>
          <SectionHead title="Watchlist" action="Markets" onAction={() => nav.tab('watchlist')} />
          <Card pad={6}>
            {D.WATCHLIST.slice(0, 4).map((w, i) => (
              <div key={w.symbol} onClick={() => nav.tab('watchlist')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px', borderTop: i ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                <AssetGlyph symbol={w.symbol} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{w.symbol}</div>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--text-3)' }}>{w.name}</div>
                </div>
                <Sparkline data={w.spark} color={w.up ? 'var(--bull)' : 'var(--bear)'} width={56} height={24} />
                <div style={{ textAlign: 'right', minWidth: 72 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{w.price}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600, color: w.up ? 'var(--bull)' : 'var(--bear)' }}>{w.chg}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Premium banner */}
        <div onClick={() => nav.go('premium')} style={{ position: 'relative', borderRadius: 20, padding: 18, overflow: 'hidden', cursor: 'pointer', background: 'linear-gradient(120deg, rgba(240,194,104,0.16), rgba(240,194,104,0.04))', border: '1px solid rgba(240,194,104,0.26)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg,#F6D58A,#E9B84E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="crown" size={24} color="#2A2008" fill />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Unlock Trade Analyst Pro</div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}>Unlimited scans, multi-timeframe & alerts</div>
            </div>
            <Icon name="chevR" size={20} color="var(--gold)" />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, StatTile, RecentRow });
