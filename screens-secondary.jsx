/* screens-secondary.jsx — Watchlist, Alerts, Journal, Saved, Profile screens */

/* ══════════════════════════════════════════════════════════════
   WATCHLIST SCREEN
══════════════════════════════════════════════════════════════ */

function WatchlistScreen({ nav }) {
  const D = window.DATA;
  const [filter, setFilter] = uS('All');

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>
      <TopBar title="Markets" nav={nav} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Segmented
          options={['All', 'Crypto', 'Stocks', 'Forex']}
          value={filter}
          onChange={setFilter}
        />

        {/* Market overview row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'BTC Dom', v: '53.2%', up: true }, { l: 'Fear & Greed', v: '68', up: true }, { l: 'Vol 24h', v: '$82B', up: false }].map((m, i) => (
            <div key={i} style={{ flex: 1, padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: m.up ? 'var(--bull)' : 'var(--bear)' }}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* Watchlist items */}
        <div>
          <SectionHead title="Your watchlist" action="Edit" />
          <Card pad={6}>
            {D.WATCHLIST.map((w, i) => (
              <div key={w.symbol} onClick={() => nav.go('upload')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderTop: i ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                <AssetGlyph symbol={w.symbol} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{w.symbol}</div>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)' }}>{w.name}</div>
                </div>
                <Sparkline data={w.spark} color={w.up ? 'var(--bull)' : 'var(--bear)'} width={60} height={26} />
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{w.price}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: w.up ? 'var(--bull)' : 'var(--bear)' }}>{w.chg}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); nav.go('upload'); }} style={{ marginLeft: 4, width: 34, height: 34, borderRadius: 10, background: 'rgba(124,108,255,0.12)', border: '1px solid rgba(124,108,255,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Icon name="scan" size={16} color="var(--brand-2)" sw={2} />
                </button>
              </div>
            ))}
          </Card>
        </div>

        {/* Add assets */}
        <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 14, background: 'transparent', border: '1.5px dashed var(--border-strong)', color: 'var(--text-3)', fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="plusCircle" size={18} color="var(--text-3)" />
          Add symbol
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ALERTS SCREEN
══════════════════════════════════════════════════════════════ */

function AlertsScreen({ nav }) {
  const D = window.DATA;
  const [alerts, setAlerts] = uS(D.ALERTS);

  const toggle = (id) => setAlerts(prev =>
    prev.map(a => a.id === id ? { ...a, active: !a.active } : a)
  );

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>
      <TopBar title="Alerts" nav={nav} right={
        <button onClick={() => {}} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-grad)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="plus" size={18} color="#fff" sw={2.4} />
        </button>
      } />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map(a => (
          <div key={a.id} style={{ padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 16, border: `1px solid ${a.hit ? 'var(--bull-line)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AssetGlyph symbol={a.symbol} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{a.symbol}</span>
                  <Badge tone={a.hit ? 'bull' : 'neutral'} size="sm">{a.type}</Badge>
                  {a.hit && <Badge tone="bull" size="sm" icon="checkCircle">Triggered</Badge>}
                </div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--text-2)', marginTop: 3 }}>{a.cond}</div>
                {a.when && <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.when}</div>}
              </div>
              <Toggle on={a.active} onChange={() => toggle(a.id)} />
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="bell" size={26} color="var(--text-3)" />
            </div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No alerts yet</div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)' }}>Set alerts from any analysis result</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   JOURNAL SCREEN
══════════════════════════════════════════════════════════════ */

function JournalScreen({ nav }) {
  const D = window.DATA;
  const wins = D.JOURNAL.filter(j => j.win).length;
  const winRate = Math.round((wins / D.JOURNAL.length) * 100);

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>
      <TopBar title="Journal" nav={nav} right={
        <button onClick={() => {}} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-grad)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="plus" size={18} color="#fff" sw={2.4} />
        </button>
      } />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <StatTile label="Win rate" value={winRate + '%'} tone="var(--bull)" />
          <StatTile label="Best trade" value="+3.1R" tone="var(--bull)" />
          <StatTile label="Total trades" value={D.JOURNAL.length} />
        </div>

        {/* Equity sparkline */}
        <Card glow>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>Account equity</span>
            <Badge tone="bull" size="sm" icon="trendUp">+18.4%</Badge>
          </div>
          <Sparkline data={window.DATA.spark(7, 32)} width={340} height={60} color="var(--bull)" />
        </Card>

        {/* Trade list */}
        <div>
          <SectionHead title="Trade history" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {D.JOURNAL.map(j => (
              <div key={j.id} style={{ padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 16, border: `1px solid ${j.win ? 'var(--bull-line)' : 'var(--bear-line)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AssetGlyph symbol={j.symbol} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{j.symbol}</span>
                      <Badge tone={j.dir === 'Long' ? 'bull' : 'bear'} size="sm">{j.dir}</Badge>
                      <Badge tone="neutral" size="sm">{j.tf}</Badge>
                    </div>
                    <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                      {j.entry} → {j.exit} · {j.date}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: j.win ? 'var(--bull)' : 'var(--bear)' }}>{j.rMult}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{j.pnl}</div>
                  </div>
                </div>
                {j.note && <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-2)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', lineHeight: 1.45 }}>{j.note}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SAVED / HISTORY SCREEN
══════════════════════════════════════════════════════════════ */

function SavedScreen({ nav }) {
  const D = window.DATA;
  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>
      <TopBar title="Saved analyses" nav={nav} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {D.ANALYSES.map(a => {
          const tone = a.rec === 'BUY' ? 'bull' : a.rec === 'SELL' ? 'bear' : 'neutral';
          return (
            <div key={a.id} onClick={() => nav.go('results', { id: a.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)', cursor: 'pointer' }}>
              <AssetGlyph symbol={a.symbol} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{a.name}</span>
                  <Badge tone="neutral" size="sm">{a.tf}</Badge>
                </div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                  {a.when} · {a.strategies} strategies
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge tone={tone} icon={a.rec === 'BUY' ? 'trendUp' : a.rec === 'SELL' ? 'trendDown' : undefined}>{a.rec}</Badge>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-3)', marginTop: 5 }}>{a.conf}% conf</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROFILE SCREEN (includes API key management)
══════════════════════════════════════════════════════════════ */

function ProfileScreen({ nav }) {
  const [apiKey, setApiKey] = uS(window.DATA.ApiKey.get());
  const [visible, setVisible] = uS(false);
  const [saved, setSaved] = uS(false);
  const [notifications, setNotifications] = uS(true);
  const [darkMode, setDarkMode] = uS(true);

  const saveKey = () => {
    window.DATA.ApiKey.set(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearKey = () => {
    window.DATA.ApiKey.clear();
    setApiKey('');
  };

  const maskedKey = apiKey
    ? apiKey.slice(0, 12) + '•'.repeat(Math.max(0, apiKey.length - 16)) + apiKey.slice(-4)
    : '';

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>
      <TopBar title="Profile" nav={nav} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* User card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px -8px var(--brand-glow)' }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, color: '#fff' }}>T</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>Trader</div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Free plan · 1 analysis today</div>
            </div>
            <button onClick={() => nav.go('premium')} style={{ height: 34, padding: '0 14px', borderRadius: 10, background: 'rgba(240,194,104,0.14)', border: '1px solid rgba(240,194,104,0.3)', color: 'var(--gold)', fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              Upgrade
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <StatTile label="Win rate" value="68%" tone="var(--bull)" />
            <StatTile label="Analyses" value="142" />
            <StatTile label="Streak" value="4d" tone="var(--gold)" />
          </div>
        </Card>

        {/* API Key section */}
        <div>
          <SectionHead title="Google Gemini API key" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: apiKey ? 'var(--bull-dim)' : 'var(--bg-3)', border: `1px solid ${apiKey ? 'var(--bull-line)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={apiKey ? 'checkCircle' : 'key'} size={18} color={apiKey ? 'var(--bull)' : 'var(--text-3)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                  {apiKey ? 'Key connected' : 'No key set'}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                  {apiKey ? maskedKey : 'Free — get key at aistudio.google.com'}
                </div>
              </div>
              {apiKey && (
                <button onClick={clearKey} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bear-dim)', border: '1px solid var(--bear-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Icon name="trash" size={15} color="var(--bear)" />
                </button>
              )}
            </div>

            {/* Key input */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input
                type={visible ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{ width: '100%', height: 48, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '0 48px 0 16px', outline: 'none' }}
              />
              <button onClick={() => setVisible(!visible)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Icon name="eye" size={17} color="var(--text-3)" />
              </button>
            </div>

            <Button
              variant={saved ? 'bull' : 'primary'}
              full
              onClick={saveKey}
              disabled={!apiKey.trim() || !apiKey.startsWith('AIza')}
            >
              {saved ? '✓ API key saved' : 'Save key'}
            </Button>

            <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--text-3)', marginTop: 10, lineHeight: 1.5, textAlign: 'center' }}>
              Stored locally · never shared · used only for chart analysis
            </div>
          </Card>
        </div>

        {/* Settings */}
        <div>
          <SectionHead title="Settings" />
          <Card pad={4}>
            {[
              { label: 'Push notifications', sub: 'Alerts and signal updates', val: notifications, set: setNotifications },
              { label: 'Dark mode', sub: 'Always on for best experience', val: darkMode, set: setDarkMode },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 14.5, color: 'var(--text)' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{s.sub}</div>
                </div>
                <Toggle on={s.val} onChange={s.set} />
              </div>
            ))}
          </Card>
        </div>

        {/* Legal / logout */}
        <Card pad={4}>
          {[
            { label: 'About & Strategy library', icon: 'info' },
            { label: 'Privacy Policy', icon: 'shield' },
            { label: 'Terms of Service', icon: 'list' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px', borderTop: i ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
              <Icon name={item.icon} size={18} color="var(--text-3)" />
              <span style={{ flex: 1, fontFamily: 'var(--ui)', fontSize: 14.5, color: 'var(--text)' }}>{item.label}</span>
              <Icon name="chevR" size={16} color="var(--text-3)" />
            </div>
          ))}
        </Card>

        <button onClick={() => nav.tab('onboarding')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 14, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="logout" size={18} color="var(--text-3)" />
          Sign out
        </button>

        <div style={{ textAlign: 'center', fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--text-3)', paddingBottom: 8 }}>
          Trade Analyst · v1.0.0 · 103 active strategies
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WatchlistScreen, AlertsScreen, JournalScreen, SavedScreen, ProfileScreen });
