/* data.jsx — AI Trade Analyst data layer.
   Mock data for the UI + API key / analysis history helpers. */

/* ── Sparkline generator (deterministic) ── */
const spark = (s, n = 24) => {
  let x = s * 1.7;
  const out = [];
  for (let i = 0; i < n; i++) {
    x += Math.sin(i / 2.3 + s) * 1.6 + (Math.cos(i * s) * 1.1);
    out.push(x);
  }
  return out;
};

/* ── Sample analyses (shown before the user runs their first real analysis) ── */
const ANALYSES = [
  {
    id: 'a1', symbol: 'BTC', name: 'BTC / USDT', tf: '4H',
    price: '67,412.80', priceNum: 67412.80, chg: '+2.84%', up: true,
    rec: 'BUY', conf: 87, risk: 34, when: '12m ago', seed: 11,
    summary: 'Strong bullish structure confirmed. Price reclaimed the 4H order block after a clean liquidity sweep of equal lows, with EMA stack aligned bullish and momentum expanding.',
    bull: ['Bullish order block reclaim at 66.2K', 'Liquidity sweep of equal lows reversed', 'EMA 20/50/200 stacked bullish', 'Rising volume on breakout candle', 'Break of structure to the upside (BOS)'],
    bear: ['Approaching 4H resistance at 68.4K', 'RSI nearing overbought (68)'],
    structure: 'Bullish — Break of Structure',
    support: ['66,200', '64,850', '63,100'],
    resist:  ['68,400', '70,250', '72,000'],
    liquidity: ['68,500 (buy-side)', '63,900 (sell-side)'],
    entry: '67,100 – 67,500', stop: '65,900', targets: ['68,400', '70,250', '72,000'],
    rr: '3.1', strategies: 103,
    consensus: [
      { group: 'Smart Money',    sig: 'Bullish', w: 92 },
      { group: 'Trend Following',sig: 'Bullish', w: 84 },
      { group: 'Price Action',   sig: 'Bullish', w: 78 },
      { group: 'Momentum',       sig: 'Neutral', w: 55 },
      { group: 'Mean Reversion', sig: 'Bearish', w: 32 },
    ],
    spark: spark(3),
  },
  {
    id: 'a2', symbol: 'NVDA', name: 'NVIDIA Corp', tf: '1D',
    price: '131.26', priceNum: 131.26, chg: '+1.12%', up: true,
    rec: 'BUY', conf: 79, risk: 41, when: '1h ago', seed: 5,
    summary: 'Daily uptrend intact with a bull flag breakout. Golden cross holding and price respecting the rising 50-day average.',
    bull: ['Bull flag breakout on volume', 'Golden cross intact', 'Above rising 50 DMA', 'Cup-and-handle target open'],
    bear: ['Earnings volatility ahead', 'Extended from 20 DMA'],
    structure: 'Bullish — Trend Continuation',
    support: ['126.40', '121.80', '118.00'],
    resist:  ['134.20', '140.00', '146.50'],
    liquidity: ['135.00 (buy-side)', '117.50 (sell-side)'],
    entry: '130.0 – 131.5', stop: '125.8', targets: ['134.20', '140.00', '146.50'],
    rr: '2.6', strategies: 103,
    consensus: [
      { group: 'Trend Following', sig: 'Bullish', w: 88 },
      { group: 'Chart Patterns',  sig: 'Bullish', w: 81 },
      { group: 'Momentum',        sig: 'Bullish', w: 72 },
      { group: 'Volume',          sig: 'Bullish', w: 69 },
      { group: 'Mean Reversion',  sig: 'Neutral', w: 48 },
    ],
    spark: spark(6),
  },
  {
    id: 'a3', symbol: 'ETH', name: 'ETH / USDT', tf: '1H',
    price: '3,248.10', priceNum: 3248.10, chg: '-1.46%', up: false,
    rec: 'SELL', conf: 71, risk: 58, when: '3h ago', seed: 19,
    summary: 'Lower-timeframe character change. A CHoCH below the 1H support with a fair value gap left open above suggests continuation lower into the sell-side liquidity pool.',
    bull: ['Approaching daily demand zone', 'Oversold RSI on 1H'],
    bear: ['CHoCH below 3,280 support', 'Open FVG above acting as resistance', 'Lower-high structure forming', 'Declining volume on bounces'],
    structure: 'Bearish — Change of Character',
    support: ['3,205', '3,150', '3,080'],
    resist:  ['3,290', '3,340', '3,410'],
    liquidity: ['3,360 (buy-side)', '3,140 (sell-side)'],
    entry: '3,255 – 3,278', stop: '3,312', targets: ['3,205', '3,150', '3,080'],
    rr: '2.2', strategies: 103,
    consensus: [
      { group: 'Smart Money',    sig: 'Bearish', w: 78 },
      { group: 'Price Action',   sig: 'Bearish', w: 70 },
      { group: 'Trend Following',sig: 'Bearish', w: 62 },
      { group: 'Mean Reversion', sig: 'Bullish', w: 44 },
      { group: 'Momentum',       sig: 'Neutral', w: 50 },
    ],
    spark: spark(9),
  },
  {
    id: 'a4', symbol: 'EURUSD', name: 'EUR / USD', tf: '15m',
    price: '1.08642', priceNum: 1.08642, chg: '+0.08%', up: true,
    rec: 'NEUTRAL', conf: 52, risk: 47, when: 'Yesterday', seed: 2,
    summary: 'Range-bound on the intraday. Price oscillating between session highs and lows with no clear displacement — best to wait for a London breakout.',
    bull: ['Holding range support', 'London session approaching'],
    bear: ['Capped by range resistance', 'Low momentum / inside bars'],
    structure: 'Neutral — Consolidation Range',
    support: ['1.0840', '1.0822'],
    resist:  ['1.0878', '1.0902'],
    liquidity: ['1.0905 (buy-side)', '1.0818 (sell-side)'],
    entry: null, stop: null, targets: [], rr: '—', strategies: 103,
    consensus: [
      { group: 'Range Trading',  sig: 'Neutral', w: 60 },
      { group: 'Momentum',       sig: 'Neutral', w: 49 },
      { group: 'Trend Following',sig: 'Neutral', w: 51 },
      { group: 'Price Action',   sig: 'Bearish', w: 42 },
    ],
    spark: spark(14),
  },
];

const WATCHLIST = [
  { symbol: 'BTC',    name: 'Bitcoin',   price: '67,412', chg: '+2.84%', up: true,  spark: spark(3)  },
  { symbol: 'ETH',    name: 'Ethereum',  price: '3,248',  chg: '-1.46%', up: false, spark: spark(9)  },
  { symbol: 'SOL',    name: 'Solana',    price: '178.42', chg: '+5.21%', up: true,  spark: spark(4)  },
  { symbol: 'NVDA',   name: 'NVIDIA',    price: '131.26', chg: '+1.12%', up: true,  spark: spark(6)  },
  { symbol: 'XAU',    name: 'Gold Spot', price: '2,412',  chg: '-0.34%', up: false, spark: spark(12) },
];

const ALERTS = [
  { id: 'al1', symbol: 'BTC',  type: 'Price',   cond: 'Crosses above 68,400', tf: '4H',  active: true,  hit: false },
  { id: 'al2', symbol: 'ETH',  type: 'Pattern', cond: 'Bullish CHoCH on 1H',  tf: '1H',  active: true,  hit: true,  when: '24m ago' },
  { id: 'al3', symbol: 'SOL',  type: 'AI Signal',cond: 'Confidence > 80% BUY',tf: 'Any', active: true,  hit: false },
  { id: 'al4', symbol: 'NVDA', type: 'Price',   cond: 'Drops below 126.40',   tf: '1D',  active: false, hit: false },
];

const JOURNAL = [
  { id: 'j1', symbol: 'BTC',    dir: 'Long',  entry: '64,200', exit: '66,950', rMult: '+2.4R', pnl: '+$1,375', win: true,  date: 'May 28', tf: '4H',  note: 'Followed the AI consensus. Order block entry, target 2 hit.' },
  { id: 'j2', symbol: 'SOL',    dir: 'Long',  entry: '162.0',  exit: '178.4',  rMult: '+3.1R', pnl: '+$820',   win: true,  date: 'May 25', tf: '1D',  note: 'Breakout retest, scaled out at resistance.' },
  { id: 'j3', symbol: 'ETH',    dir: 'Short', entry: '3,310',  exit: '3,344',  rMult: '-1.0R', pnl: '-$340',   win: false, date: 'May 22', tf: '1H',  note: 'Stopped out on a fakeout, ignored neutral momentum flag.' },
  { id: 'j4', symbol: 'EURUSD', dir: 'Long',  entry: '1.0840', exit: '1.0892', rMult: '+1.8R', pnl: '+$260',   win: true,  date: 'May 20', tf: '15m', note: 'London breakout, clean run to target 1.' },
];

const STRATEGY_GROUPS = [
  { name: 'Trend Following',  count: 15, icon: 'trendUp'  },
  { name: 'Momentum',         count: 12, icon: 'activity' },
  { name: 'Smart Money',      count: 12, icon: 'brain'    },
  { name: 'Price Action',     count: 15, icon: 'candles'  },
  { name: 'Chart Patterns',   count: 12, icon: 'chart'    },
  { name: 'Mean Reversion',   count: 8,  icon: 'refresh'  },
  { name: 'Volatility',       count: 8,  icon: 'zap'      },
  { name: 'Volume',           count: 8,  icon: 'layers'   },
  { name: 'Fibonacci',        count: 8,  icon: 'target'   },
  { name: 'Candlestick',      count: 5,  icon: 'candles'  },
];

const INSIGHTS = [
  { tag: 'Market Pulse', title: 'Crypto majors reclaiming key levels', body: 'BTC and SOL printing bullish structure across higher timeframes. Risk-on tone building into the weekly close.', tone: 'bull' },
  { tag: 'Heads up', title: 'NVDA earnings volatility ahead', body: 'Implied move elevated. AI flags trimming size on open positions into the print.', tone: 'warn' },
];

/* ── API Key helpers ── */
const ApiKey = {
  get: ()        => localStorage.getItem('ta_api_key') || '',
  set: (k)       => localStorage.setItem('ta_api_key', k),
  clear: ()      => localStorage.removeItem('ta_api_key'),
  hasKey: ()     => !!localStorage.getItem('ta_api_key'),
};

/* ── Analysis history helpers ── */
const History = {
  prepend: (analysis) => {
    window.DATA.ANALYSES.unshift(analysis);
    // Keep last 50
    if (window.DATA.ANALYSES.length > 50) window.DATA.ANALYSES.splice(50);
  },
};

window.DATA = { ANALYSES, WATCHLIST, ALERTS, JOURNAL, STRATEGY_GROUPS, INSIGHTS, spark, ApiKey, History };
