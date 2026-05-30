/* app.jsx — Root app: device frame, navigation stack, tab bar, screen router */

/* ── Status bar ── */
function StatusBar() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', pointerEvents: 'none' }}>
      <span style={{ fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 16, color: '#fff', letterSpacing: 0.2, marginTop: 4 }}>9:41</span>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: 4 }}>
        {/* Signal bars */}
        <svg width="18" height="11" viewBox="0 0 18 11">
          <rect x="0" y="6.5" width="3" height="4.5" rx="0.7" fill="#fff"/>
          <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.7" fill="#fff"/>
          <rect x="9" y="2.3" width="3" height="8.7" rx="0.7" fill="#fff"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.7" fill="#fff"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="11" viewBox="0 0 16 11">
          <path d="M8 2.9c2.1 0 4 .8 5.4 2.2l1-1C12.7 2.4 10.5 1.4 8 1.4S3.3 2.4 1.6 4.1l1 1C4 3.7 5.9 2.9 8 2.9z" fill="#fff"/>
          <path d="M8 6.2c1.2 0 2.3.5 3.1 1.3l1-1C11 5.4 9.6 4.7 8 4.7s-3 .7-4.1 1.8l1 1C5.7 6.7 6.8 6.2 8 6.2z" fill="#fff"/>
          <circle cx="8" cy="9.6" r="1.4" fill="#fff"/>
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#fff" strokeOpacity="0.4" fill="none"/>
          <rect x="2" y="2" width="16" height="8" rx="1.6" fill="#fff"/>
          <path d="M23 4v4c.7-.3 1.2-1 1.2-2S23.7 4.3 23 4z" fill="#fff" fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

/* ── Device frame (402×874 phone shell) ── */
function AppFrame({ children }) {
  return (
    <div style={{
      width: 402, height: 874, borderRadius: 52, position: 'relative',
      background: 'var(--bg)', overflow: 'hidden',
      boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 11px #14161b, 0 0 0 12px rgba(255,255,255,0.06), 0 0 0 13px #000',
    }}>
      <StatusBar />
      {/* Dynamic island */}
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 122, height: 35, borderRadius: 20, background: '#000', zIndex: 50 }} />
      {children}
      {/* Home indicator */}
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 100, background: 'rgba(255,255,255,0.32)', zIndex: 60, pointerEvents: 'none' }} />
    </div>
  );
}

/* ── Bottom tab bar ── */
function TabBar({ active, nav }) {
  const tabs = [
    { id: 'home',      icon: 'home',  label: 'Home'    },
    { id: 'watchlist', icon: 'star',  label: 'Markets' },
    { id: 'scan',      icon: 'scan',  label: ''        },
    { id: 'journal',   icon: 'book',  label: 'Journal' },
    { id: 'profile',   icon: 'user',  label: 'Profile' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 35, paddingBottom: 26, paddingTop: 10, background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 18px' }}>
        {tabs.map(t => {
          if (t.id === 'scan') {
            return (
              <button key={t.id} onClick={() => nav.go('upload')} style={{ background: 'var(--brand-grad)', border: 'none', width: 58, height: 58, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 26px -6px var(--brand-glow), inset 0 1px 0 rgba(255,255,255,0.25)', marginTop: -6, transform: 'translateY(-2px)' }}>
                <Icon name="scan" size={27} color="#fff" sw={2} />
              </button>
            );
          }
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => nav.tab(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 56, padding: '4px 0' }}>
              <Icon name={t.icon} size={23} color={on ? 'var(--brand-2)' : 'var(--text-3)'} sw={on ? 2.1 : 1.8} />
              <span style={{ fontFamily: 'var(--ui)', fontSize: 10.5, fontWeight: on ? 700 : 600, color: on ? 'var(--text)' : 'var(--text-3)' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Root App ── */
const TAB_SCREENS = ['home', 'watchlist', 'journal', 'profile', 'saved', 'alerts'];

function App() {
  const [stack, setStack] = uS([{ screen: 'onboarding' }]);
  const scrollRef = uR(null);
  const cur = stack[stack.length - 1];

  const go      = (screen, params = {}) => setStack(s => [...s, { screen, ...params }]);
  const replace = (screen, params = {}) => setStack(s => [...s.slice(0, -1), { screen, ...params }]);
  const back    = () => setStack(s => s.length > 1 ? s.slice(0, -1) : s);
  const tab     = (screen) => setStack([{ screen }]);
  const nav     = { go, replace, back, tab, depth: stack.length };

  uE(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [stack.length, cur.screen]);

  const showTabs = TAB_SCREENS.includes(cur.screen);

  const A = window.DATA.ANALYSES;
  const findA = id => A.find(x => x.id === id) || A[0];

  let screen = null;
  switch (cur.screen) {
    case 'onboarding': screen = <Onboarding nav={nav} onDone={() => tab('home')} />; break;
    case 'auth':       screen = <AuthScreen nav={nav} onDone={() => tab('home')} />; break;
    case 'home':       screen = <HomeScreen nav={nav} />; break;
    case 'watchlist':  screen = <WatchlistScreen nav={nav} />; break;
    case 'alerts':     screen = <AlertsScreen nav={nav} />; break;
    case 'journal':    screen = <JournalScreen nav={nav} />; break;
    case 'saved':      screen = <SavedScreen nav={nav} />; break;
    case 'profile':    screen = <ProfileScreen nav={nav} />; break;
    case 'upload':     screen = <UploadScreen nav={nav} />; break;
    case 'loading':    screen = <LoadingScreen nav={nav} pendingKey={cur.pendingKey} />; break;
    case 'results':    screen = <ResultsScreen nav={nav} analysis={findA(cur.id)} />; break;
    case 'premium':    screen = <PremiumScreen nav={nav} />; break;
    default:           screen = <HomeScreen nav={nav} />;
  }

  return (
    <AppFrame>
      <div key={cur.screen + stack.length} ref={scrollRef} className="scrollarea"
        style={{ position: 'absolute', inset: 0, animation: 'fadeIn .28s ease', background: 'var(--bg)' }}>
        {screen}
      </div>
      {showTabs && <TabBar active={cur.screen} nav={nav} />}
    </AppFrame>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
