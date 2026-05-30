/* screens-premium.jsx — Premium / upgrade screen */

function PremiumScreen({ nav }) {
  const [plan, setPlan] = uS('annual');

  const FEATURES = [
    { icon: 'sparkles', text: 'Unlimited chart analyses per day'          },
    { icon: 'layers',   text: 'Multi-timeframe analysis (all 9 TFs)'      },
    { icon: 'bell',     text: 'Real-time price alerts & notifications'     },
    { icon: 'book',     text: 'Advanced trade journal with analytics'      },
    { icon: 'scan',     text: '103-strategy deep scan on every upload'     },
    { icon: 'star',     text: 'Priority AI processing & faster results'    },
    { icon: 'chart',    text: 'Portfolio risk analytics dashboard'         },
    { icon: 'crown',    text: 'Early access to new features'               },
  ];

  const PLANS = {
    monthly: { label: 'Monthly', price: '$9.99', sub: 'per month', badge: null },
    annual:  { label: 'Annual',  price: '$5.99', sub: 'per month · billed $71.88/yr', badge: 'SAVE 40%' },
  };

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120 }}>

      {/* Close button */}
      <div style={{ padding: '62px 20px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => nav.back()} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="x" size={18} color="var(--text)" />
        </button>
      </div>

      <div style={{ padding: '10px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#F6D58A,#E9B84E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 12px 32px -10px rgba(240,194,104,0.5)' }}>
            <Icon name="crown" size={34} color="#2A2008" fill />
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', letterSpacing: -0.5 }}>Trade Analyst Pro</h1>
          <p style={{ fontFamily: 'var(--ui)', fontSize: 14, color: 'var(--text-2)', margin: 0, lineHeight: 1.55 }}>Unlock the full power of AI-driven chart analysis with unlimited scans and premium features.</p>
        </div>

        {/* Features list */}
        <div style={{ background: 'var(--bg-2)', borderRadius: 20, border: '1px solid var(--border)', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(240,194,104,0.12)', border: '1px solid rgba(240,194,104,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={16} color="var(--gold)" />
              </div>
              <span style={{ fontFamily: 'var(--ui)', fontSize: 13.5, color: 'var(--text-2)' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div style={{ display: 'flex', gap: 10 }}>
          {Object.entries(PLANS).map(([key, p]) => {
            const on = plan === key;
            return (
              <button key={key} onClick={() => setPlan(key)} style={{
                flex: 1, padding: '14px 12px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                background: on ? 'rgba(240,194,104,0.12)' : 'var(--bg-2)',
                border: `${on ? 2 : 1}px solid ${on ? 'rgba(240,194,104,0.5)' : 'var(--border)'}`,
                position: 'relative',
              }}>
                {p.badge && (
                  <div style={{ position: 'absolute', top: -10, right: 10, background: 'var(--gold)', color: '#1a1200', fontFamily: 'var(--ui)', fontWeight: 800, fontSize: 10, padding: '3px 8px', borderRadius: 8 }}>{p.badge}</div>
                )}
                <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 13, color: on ? 'var(--gold)' : 'var(--text-2)', marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 20, color: on ? 'var(--text)' : 'var(--text-2)', letterSpacing: -0.5 }}>{p.price}</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{p.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Free trial note */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--text-2)' }}>
            7-day free trial · Cancel anytime
          </div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>
            No charge until trial ends
          </div>
        </div>

        {/* CTA */}
        <button style={{ width: '100%', height: 54, borderRadius: 16, background: 'linear-gradient(135deg,#F6D58A,#E9B84E)', border: 'none', color: '#1a1200', fontFamily: 'var(--ui)', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 12px 32px -10px rgba(240,194,104,0.55)', letterSpacing: -0.2 }}>
          <Icon name="crown" size={20} color="#1a1200" fill />
          Start Free Trial
        </button>

        {/* Legal */}
        <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
          By subscribing you agree to our Terms of Service and Privacy Policy. Subscriptions auto-renew. Cancel anytime before trial ends to avoid charges.
        </div>

        {/* Restore */}
        <button style={{ background: 'none', border: 'none', fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--text-3)', cursor: 'pointer', textDecoration: 'underline', padding: '0 0 16px' }}>
          Restore purchases
        </button>

      </div>
    </div>
  );
}

Object.assign(window, { PremiumScreen });
