/* engine.jsx — AI chart analysis engine.
   Flow: image → Claude Vision (extracts chart data) → 103 strategy evaluators → weighted consensus → trade plan */

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — CLAUDE VISION PROMPT
   Asks Claude to extract structured chart data as JSON.
══════════════════════════════════════════════════════════════ */

const VISION_PROMPT = `You are an expert technical analyst. Analyze this TradingView chart screenshot and extract ALL visible technical information.

Return ONLY a valid JSON object — no markdown, no code fences, no explanation. Use exactly this structure:

{
  "asset": "symbol as shown (e.g. BTC/USDT, NVDA, EUR/USD)",
  "exchange": "exchange if visible, else null",
  "price": current_price_as_number_or_null,
  "priceStr": "formatted price string",
  "change": percent_change_as_number_or_null,
  "timeframe": "timeframe string: 1m|5m|15m|30m|1h|2h|4h|1d|3d|1w|1M",
  "trend": {
    "primary": "bullish|bearish|sideways",
    "strength": "strong|moderate|weak"
  },
  "marketStructure": {
    "type": "bos|choch|continuation|range|breakdown|breakout|accumulation|distribution",
    "direction": "bullish|bearish|neutral",
    "hhhl": true_or_false,
    "lhll": true_or_false
  },
  "indicators": {
    "ema": {
      "visible": true_or_false,
      "alignment": "bullish|bearish|mixed",
      "priceAbove": true_or_false,
      "recentCross": "bullish|bearish|none"
    },
    "sma50": { "visible": true_or_false, "priceAbove": true_or_false },
    "sma200": { "visible": true_or_false, "priceAbove": true_or_false },
    "rsi": {
      "visible": true_or_false,
      "value": number_between_0_and_100_or_null,
      "zone": "oversold|neutral|overbought",
      "trend": "rising|falling|flat",
      "divergence": "bullish|bearish|none"
    },
    "macd": {
      "visible": true_or_false,
      "histogram": "positive_rising|positive_falling|negative_rising|negative_falling|none",
      "signalCross": "bullish|bearish|none",
      "aboveZero": true_or_false
    },
    "bollinger": {
      "visible": true_or_false,
      "position": "upper|middle|lower|outside_upper|outside_lower",
      "squeeze": true_or_false,
      "expanding": true_or_false
    },
    "stochastic": {
      "visible": true_or_false,
      "value": number_0_to_100_or_null,
      "zone": "oversold|neutral|overbought",
      "cross": "bullish|bearish|none"
    },
    "volume": {
      "visible": true_or_false,
      "trend": "increasing|decreasing|average",
      "aboveAverage": true_or_false,
      "divergence": "bullish|bearish|none"
    },
    "vwap": { "visible": true_or_false, "priceAbove": true_or_false },
    "ichimoku": {
      "visible": true_or_false,
      "priceAboveCloud": true_or_false,
      "tkCross": "bullish|bearish|none",
      "kumoColor": "bullish|bearish"
    },
    "supertrend": { "visible": true_or_false, "direction": "bullish|bearish" },
    "adx": { "visible": true_or_false, "value": number_or_null, "trending": true_or_false }
  },
  "priceAction": {
    "lastCandle": "strong_bullish|bullish|doji|bearish|strong_bearish|hammer|shooting_star|pinbar_bull|pinbar_bear",
    "pattern": "engulfing_bull|engulfing_bear|hammer|shooting_star|morning_star|evening_star|three_soldiers|three_crows|doji_star|spinning_top|none",
    "insideBar": true_or_false,
    "outsideBar": true_or_false,
    "trendlineBreak": "bullish|bearish|none"
  },
  "chartPattern": {
    "type": "head_shoulders|inv_head_shoulders|double_top|double_bottom|ascending_triangle|descending_triangle|bull_flag|bear_flag|cup_handle|falling_wedge|rising_wedge|pennant|rectangle|broadening|none",
    "completion": number_0_to_100,
    "breakout": true_or_false,
    "direction": "bullish|bearish|none"
  },
  "smc": {
    "bos": "bullish|bearish|none",
    "choch": "bullish|bearish|none",
    "orderBlock": {
      "present": true_or_false,
      "type": "bullish|bearish|none",
      "priceNear": true_or_false
    },
    "fvg": {
      "present": true_or_false,
      "type": "bullish|bearish|none",
      "filled": true_or_false
    },
    "liquidityAbove": true_or_false,
    "liquidityBelow": true_or_false,
    "premiumDiscount": "premium|equilibrium|discount"
  },
  "fibonacci": {
    "visible": true_or_false,
    "nearRetracement": "0.236|0.382|0.5|0.618|0.786|none",
    "nearExtension": "1.272|1.414|1.618|none"
  },
  "levels": {
    "support": [up_to_4_support_prices_as_numbers],
    "resistance": [up_to_4_resistance_prices_as_numbers],
    "currentPrice": current_price_as_number
  }
}

Rules:
- Only mark indicators as visible:true if you can clearly see them drawn on the chart
- For RSI, estimate the value from its oscillator position (0-100)
- For price levels, read actual values from the chart price scale
- If a field is uncertain, use the most reasonable default
- The JSON must be complete and valid`;

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — CLAUDE VISION API CALL
══════════════════════════════════════════════════════════════ */

async function callClaudeVision(base64, mimeType, apiKey) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: VISION_PROMPT },
        ],
      }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    const msg = (err.error && err.error.message) || `API error ${resp.status}`;
    throw new Error(msg);
  }

  const data = await resp.json();
  const raw = data.content[0].text.trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from any surrounding text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse chart data from AI response. Please try again.');
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — STRATEGY EVALUATORS
   Each evaluator: (chartData) → { signal: 'Bullish'|'Bearish'|'Neutral', strength: 0-100 } | null
   null means "not applicable / indicator not visible"
══════════════════════════════════════════════════════════════ */

/* ── TREND FOLLOWING (15 strategies) ── */
const STRAT = {
  // 1 EMA alignment
  emaAlignment: d => {
    const e = d.indicators.ema;
    if (!e.visible) return null;
    if (e.alignment === 'bullish') return { signal: 'Bullish', strength: 80 };
    if (e.alignment === 'bearish') return { signal: 'Bearish', strength: 80 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 2 EMA recent cross
  emaCross: d => {
    const e = d.indicators.ema;
    if (!e.visible) return null;
    if (e.recentCross === 'bullish') return { signal: 'Bullish', strength: 85 };
    if (e.recentCross === 'bearish') return { signal: 'Bearish', strength: 85 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 3 Price above/below EMA
  priceVsEma: d => {
    const e = d.indicators.ema;
    if (!e.visible) return null;
    return e.priceAbove
      ? { signal: 'Bullish', strength: 70 }
      : { signal: 'Bearish', strength: 70 };
  },

  // 4 Golden / Death cross (SMA 50/200)
  goldenCross: d => {
    const s50 = d.indicators.sma50, s200 = d.indicators.sma200;
    if (!s50.visible && !s200.visible) return null;
    if (s50.visible && s200.visible) {
      return (s50.priceAbove && s200.priceAbove)
        ? { signal: 'Bullish', strength: 82 }
        : (!s50.priceAbove && !s200.priceAbove)
          ? { signal: 'Bearish', strength: 82 }
          : { signal: 'Neutral', strength: 55 };
    }
    const ref = s50.visible ? s50 : s200;
    return ref.priceAbove ? { signal: 'Bullish', strength: 70 } : { signal: 'Bearish', strength: 70 };
  },

  // 5 Supertrend
  supertrend: d => {
    const st = d.indicators.supertrend;
    if (!st.visible) return null;
    return st.direction === 'bullish'
      ? { signal: 'Bullish', strength: 78 }
      : { signal: 'Bearish', strength: 78 };
  },

  // 6 Ichimoku cloud position
  ichimokuCloud: d => {
    const ich = d.indicators.ichimoku;
    if (!ich.visible) return null;
    let score = 50;
    if (ich.priceAboveCloud) score += 25; else score -= 25;
    if (ich.kumoColor === 'bullish') score += 10; else score -= 10;
    if (score >= 68) return { signal: 'Bullish', strength: score };
    if (score <= 32) return { signal: 'Bearish', strength: 100 - score };
    return { signal: 'Neutral', strength: 50 };
  },

  // 7 Ichimoku TK cross
  ichimokuTK: d => {
    const ich = d.indicators.ichimoku;
    if (!ich.visible || ich.tkCross === 'none') return null;
    return ich.tkCross === 'bullish'
      ? { signal: 'Bullish', strength: 75 }
      : { signal: 'Bearish', strength: 75 };
  },

  // 8 Primary trend direction
  primaryTrend: d => {
    const t = d.trend;
    const s = t.strength === 'strong' ? 88 : t.strength === 'moderate' ? 72 : 60;
    if (t.primary === 'bullish') return { signal: 'Bullish', strength: s };
    if (t.primary === 'bearish') return { signal: 'Bearish', strength: s };
    return { signal: 'Neutral', strength: 50 };
  },

  // 9 ADX trend filter
  adx: d => {
    const adx = d.indicators.adx;
    if (!adx.visible) return null;
    if (!adx.trending) return { signal: 'Neutral', strength: 45 };
    const t = d.trend.primary;
    if (t === 'bullish') return { signal: 'Bullish', strength: 75 };
    if (t === 'bearish') return { signal: 'Bearish', strength: 75 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 10 Market structure HH/HL or LH/LL
  marketStructure: d => {
    const ms = d.marketStructure;
    if (ms.direction === 'bullish') return { signal: 'Bullish', strength: ms.hhhl ? 86 : 70 };
    if (ms.direction === 'bearish') return { signal: 'Bearish', strength: ms.lhll ? 86 : 70 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 11 VWAP position
  vwapTrend: d => {
    const vwap = d.indicators.vwap;
    if (!vwap.visible) return null;
    return vwap.priceAbove
      ? { signal: 'Bullish', strength: 72 }
      : { signal: 'Bearish', strength: 72 };
  },

  // 12 SMA 50 trend
  sma50: d => {
    const s = d.indicators.sma50;
    if (!s.visible) return null;
    return s.priceAbove ? { signal: 'Bullish', strength: 68 } : { signal: 'Bearish', strength: 68 };
  },

  // 13 SMA 200 long-term trend
  sma200: d => {
    const s = d.indicators.sma200;
    if (!s.visible) return null;
    return s.priceAbove ? { signal: 'Bullish', strength: 75 } : { signal: 'Bearish', strength: 75 };
  },

  // 14 Dual MA alignment (EMA + SMA 50)
  dualMa: d => {
    const signals = [];
    if (d.indicators.ema.visible) signals.push(d.indicators.ema.priceAbove);
    if (d.indicators.sma50.visible) signals.push(d.indicators.sma50.priceAbove);
    if (!signals.length) return null;
    const bullCount = signals.filter(Boolean).length;
    if (bullCount === signals.length) return { signal: 'Bullish', strength: 75 };
    if (bullCount === 0) return { signal: 'Bearish', strength: 75 };
    return { signal: 'Neutral', strength: 55 };
  },

  // 15 Trend + momentum alignment
  trendMomentum: d => {
    const t = d.trend.primary;
    const rsi = d.indicators.rsi;
    const macd = d.indicators.macd;
    let bull = 0, bear = 0, n = 1;
    if (t === 'bullish') bull += 2; else if (t === 'bearish') bear += 2;
    if (rsi.visible && rsi.trend === 'rising') { bull += 1; n++; }
    else if (rsi.visible && rsi.trend === 'falling') { bear += 1; n++; }
    if (macd.visible && macd.histogram && macd.histogram.startsWith('positive')) { bull += 1; n++; }
    else if (macd.visible && macd.histogram && macd.histogram.startsWith('negative')) { bear += 1; n++; }
    const net = (bull - bear) / (n * 2);
    if (net > 0.3) return { signal: 'Bullish', strength: Math.round(60 + net * 35) };
    if (net < -0.3) return { signal: 'Bearish', strength: Math.round(60 + Math.abs(net) * 35) };
    return { signal: 'Neutral', strength: 50 };
  },

  /* ── MOMENTUM (12 strategies) ── */

  // 16 RSI trend direction
  rsiTrend: d => {
    const rsi = d.indicators.rsi;
    if (!rsi.visible) return null;
    if (rsi.trend === 'rising'  && (rsi.value === null || rsi.value >= 50)) return { signal: 'Bullish', strength: 72 };
    if (rsi.trend === 'falling' && (rsi.value === null || rsi.value <= 50)) return { signal: 'Bearish', strength: 72 };
    if (rsi.trend === 'rising')  return { signal: 'Bullish', strength: 60 };
    if (rsi.trend === 'falling') return { signal: 'Bearish', strength: 60 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 17 RSI extreme zones
  rsiExtreme: d => {
    const rsi = d.indicators.rsi;
    if (!rsi.visible) return null;
    const v = rsi.value;
    if (v !== null) {
      if (v <= 30) return { signal: 'Bullish', strength: Math.min(96, 80 + (30 - v)) };
      if (v >= 70) return { signal: 'Bearish', strength: Math.min(96, 80 + (v - 70)) };
    }
    if (rsi.zone === 'oversold')   return { signal: 'Bullish', strength: 78 };
    if (rsi.zone === 'overbought') return { signal: 'Bearish', strength: 78 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 18 RSI divergence
  rsiDivergence: d => {
    const rsi = d.indicators.rsi;
    if (!rsi.visible || rsi.divergence === 'none') return null;
    return rsi.divergence === 'bullish'
      ? { signal: 'Bullish', strength: 84 }
      : { signal: 'Bearish', strength: 84 };
  },

  // 19 MACD histogram momentum
  macdHistogram: d => {
    const m = d.indicators.macd;
    if (!m.visible) return null;
    const h = m.histogram;
    if (h === 'positive_rising')  return { signal: 'Bullish', strength: 82 };
    if (h === 'positive_falling') return { signal: 'Bullish', strength: 62 };
    if (h === 'negative_rising')  return { signal: 'Bearish', strength: 62 };
    if (h === 'negative_falling') return { signal: 'Bearish', strength: 82 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 20 MACD signal line cross
  macdCross: d => {
    const m = d.indicators.macd;
    if (!m.visible) return null;
    if (m.signalCross === 'bullish') return { signal: 'Bullish', strength: 80 };
    if (m.signalCross === 'bearish') return { signal: 'Bearish', strength: 80 };
    return m.aboveZero ? { signal: 'Bullish', strength: 62 } : { signal: 'Bearish', strength: 62 };
  },

  // 21 MACD zero-line position
  macdZero: d => {
    const m = d.indicators.macd;
    if (!m.visible) return null;
    return m.aboveZero ? { signal: 'Bullish', strength: 66 } : { signal: 'Bearish', strength: 66 };
  },

  // 22 Stochastic
  stochastic: d => {
    const s = d.indicators.stochastic;
    if (!s.visible) return null;
    if (s.cross === 'bullish') return { signal: 'Bullish', strength: 75 };
    if (s.cross === 'bearish') return { signal: 'Bearish', strength: 75 };
    if (s.zone === 'oversold')   return { signal: 'Bullish', strength: 70 };
    if (s.zone === 'overbought') return { signal: 'Bearish', strength: 70 };
    if (s.value !== null) return s.value > 50 ? { signal: 'Bullish', strength: 58 } : { signal: 'Bearish', strength: 58 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 23 Williams %R (proxied from stoch/RSI)
  williamsR: d => {
    const s = d.indicators.stochastic, r = d.indicators.rsi;
    if (s.visible) {
      if (s.zone === 'oversold')   return { signal: 'Bullish', strength: 72 };
      if (s.zone === 'overbought') return { signal: 'Bearish', strength: 72 };
    }
    if (r.visible && r.value !== null) {
      if (r.value < 35) return { signal: 'Bullish', strength: 65 };
      if (r.value > 65) return { signal: 'Bearish', strength: 65 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 24 Rate of Change
  roc: d => {
    const t = d.trend;
    const s = t.strength === 'strong' ? 74 : 60;
    if (t.primary === 'bullish') return { signal: 'Bullish', strength: s };
    if (t.primary === 'bearish') return { signal: 'Bearish', strength: s };
    return { signal: 'Neutral', strength: 50 };
  },

  // 25 Awesome Oscillator
  awesomeOsc: d => {
    const m = d.indicators.macd;
    if (m.visible) {
      const h = m.histogram;
      if (h === 'positive_rising')  return { signal: 'Bullish', strength: 76 };
      if (h === 'negative_falling') return { signal: 'Bearish', strength: 76 };
      if (h && h.startsWith('positive')) return { signal: 'Bullish', strength: 62 };
      if (h && h.startsWith('negative')) return { signal: 'Bearish', strength: 62 };
    }
    const t = d.trend.primary;
    return t === 'bullish' ? { signal: 'Bullish', strength: 60 } : t === 'bearish' ? { signal: 'Bearish', strength: 60 } : { signal: 'Neutral', strength: 50 };
  },

  // 26 CCI (Commodity Channel Index)
  cci: d => {
    const rsi = d.indicators.rsi;
    if (rsi.visible && rsi.value !== null) {
      if (rsi.value > 70) return { signal: 'Bearish', strength: 72 };
      if (rsi.value < 30) return { signal: 'Bullish', strength: 72 };
      if (rsi.value > 55) return { signal: 'Bullish', strength: 60 };
      if (rsi.value < 45) return { signal: 'Bearish', strength: 60 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 27 TRIX signal
  trix: d => {
    const m = d.indicators.macd;
    if (!m.visible) return null;
    if (m.signalCross === 'bullish') return { signal: 'Bullish', strength: 73 };
    if (m.signalCross === 'bearish') return { signal: 'Bearish', strength: 73 };
    return m.aboveZero ? { signal: 'Bullish', strength: 62 } : { signal: 'Bearish', strength: 62 };
  },

  /* ── VOLATILITY (8 strategies) ── */

  // 28 Bollinger squeeze (pending breakout)
  bbSqueeze: d => {
    const bb = d.indicators.bollinger;
    if (!bb.visible) return null;
    if (bb.squeeze) {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 64 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 64 };
      return { signal: 'Neutral', strength: 55 };
    }
    if (bb.expanding) {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 77 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 77 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 29 Bollinger breakout
  bbBreakout: d => {
    const bb = d.indicators.bollinger;
    if (!bb.visible) return null;
    if (bb.position === 'outside_upper') return { signal: 'Bearish', strength: 72 };
    if (bb.position === 'outside_lower') return { signal: 'Bullish', strength: 72 };
    if (bb.position === 'upper') return { signal: 'Bullish', strength: 65 };
    if (bb.position === 'lower') return { signal: 'Bearish', strength: 65 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 30 Bollinger band position
  bbPosition: d => {
    const bb = d.indicators.bollinger;
    if (!bb.visible) return null;
    if (bb.position === 'upper' || bb.position === 'outside_upper') return { signal: 'Bullish', strength: 66 };
    if (bb.position === 'lower' || bb.position === 'outside_lower') return { signal: 'Bearish', strength: 66 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 31 ATR trend (volume + momentum proxy)
  atrTrend: d => {
    const vol = d.indicators.volume, t = d.trend;
    if (vol.visible && vol.aboveAverage && t.strength === 'strong') {
      if (t.primary === 'bullish') return { signal: 'Bullish', strength: 74 };
      if (t.primary === 'bearish') return { signal: 'Bearish', strength: 74 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 32 Keltner channel
  keltner: d => {
    const bb = d.indicators.bollinger;
    if (bb.visible) {
      if (bb.position === 'outside_upper') return { signal: 'Bullish', strength: 74 };
      if (bb.position === 'outside_lower') return { signal: 'Bearish', strength: 74 };
    }
    const t = d.trend;
    if (t.strength === 'strong') {
      if (t.primary === 'bullish') return { signal: 'Bullish', strength: 70 };
      if (t.primary === 'bearish') return { signal: 'Bearish', strength: 70 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 33 TTM Squeeze
  ttmSqueeze: d => {
    const bb = d.indicators.bollinger;
    if (!bb.visible) return null;
    if (bb.squeeze) return { signal: 'Neutral', strength: 54 };
    if (bb.expanding) {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 80 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 80 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 34 Donchian channel breakout
  donchian: d => {
    const cp = d.chartPattern;
    if (cp.breakout) {
      if (cp.direction === 'bullish') return { signal: 'Bullish', strength: 78 };
      if (cp.direction === 'bearish') return { signal: 'Bearish', strength: 78 };
    }
    const t = d.trend.primary;
    if (t === 'bullish') return { signal: 'Bullish', strength: 63 };
    if (t === 'bearish') return { signal: 'Bearish', strength: 63 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 35 Volatility contraction pattern (VCP)
  vcp: d => {
    const bb = d.indicators.bollinger;
    if (bb.visible && bb.squeeze) {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 74 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 74 };
      return { signal: 'Neutral', strength: 60 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  /* ── VOLUME (8 strategies) ── */

  // 36 Volume trend
  volumeTrend: d => {
    const vol = d.indicators.volume;
    if (!vol.visible) return null;
    const t = d.trend.primary;
    if (vol.trend === 'increasing' && vol.aboveAverage) {
      if (t === 'bullish') return { signal: 'Bullish', strength: 82 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 82 };
    }
    if (vol.trend === 'decreasing') return { signal: 'Neutral', strength: 52 };
    return { signal: 'Neutral', strength: 55 };
  },

  // 37 OBV trend
  obv: d => {
    const vol = d.indicators.volume;
    if (!vol.visible) return null;
    if (vol.divergence === 'bullish') return { signal: 'Bullish', strength: 80 };
    if (vol.divergence === 'bearish') return { signal: 'Bearish', strength: 80 };
    const t = d.trend.primary;
    if (vol.trend === 'increasing') {
      if (t === 'bullish') return { signal: 'Bullish', strength: 72 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 72 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 38 VWAP position
  vwapPosition: d => {
    const v = d.indicators.vwap;
    if (!v.visible) return null;
    return v.priceAbove ? { signal: 'Bullish', strength: 72 } : { signal: 'Bearish', strength: 72 };
  },

  // 39 Money Flow Index
  mfi: d => {
    const vol = d.indicators.volume, rsi = d.indicators.rsi;
    if (!vol.visible) return null;
    if (vol.divergence === 'bullish') return { signal: 'Bullish', strength: 78 };
    if (vol.divergence === 'bearish') return { signal: 'Bearish', strength: 78 };
    if (vol.aboveAverage && rsi.visible) {
      if (rsi.zone === 'oversold')   return { signal: 'Bullish', strength: 74 };
      if (rsi.zone === 'overbought') return { signal: 'Bearish', strength: 74 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 40 Accumulation/Distribution
  adLine: d => {
    const vol = d.indicators.volume;
    if (!vol.visible) return null;
    const t = d.trend.primary;
    if (vol.trend === 'increasing') {
      if (t === 'bullish') return { signal: 'Bullish', strength: 74 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 74 };
    }
    return { signal: 'Neutral', strength: 52 };
  },

  // 41 Chaikin Money Flow
  cmf: d => {
    const vol = d.indicators.volume;
    if (!vol.visible) return null;
    if (vol.aboveAverage && vol.trend === 'increasing') {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 72 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 72 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 42 Relative Volume
  rvol: d => {
    const vol = d.indicators.volume;
    if (!vol.visible) return null;
    if (vol.aboveAverage) {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 76 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 76 };
      return { signal: 'Neutral', strength: 60 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 43 Volume divergence
  volumeDivergence: d => {
    const vol = d.indicators.volume;
    if (!vol.visible || vol.divergence === 'none') return null;
    return vol.divergence === 'bullish'
      ? { signal: 'Bullish', strength: 82 }
      : { signal: 'Bearish', strength: 82 };
  },

  /* ── PRICE ACTION (15 strategies) ── */

  // 44 Last candle direction
  lastCandle: d => {
    const c = d.priceAction.lastCandle;
    if (c === 'strong_bullish') return { signal: 'Bullish', strength: 80 };
    if (c === 'bullish')        return { signal: 'Bullish', strength: 65 };
    if (c === 'hammer' || c === 'pinbar_bull') return { signal: 'Bullish', strength: 78 };
    if (c === 'strong_bearish') return { signal: 'Bearish', strength: 80 };
    if (c === 'bearish')        return { signal: 'Bearish', strength: 65 };
    if (c === 'shooting_star' || c === 'pinbar_bear') return { signal: 'Bearish', strength: 78 };
    return { signal: 'Neutral', strength: 52 };
  },

  // 45 Candlestick pattern
  candlePattern: d => {
    const p = d.priceAction.pattern;
    const bull = ['engulfing_bull', 'hammer', 'morning_star', 'three_soldiers', 'doji_star'];
    const bear = ['engulfing_bear', 'shooting_star', 'evening_star', 'three_crows'];
    if (bull.includes(p)) return { signal: 'Bullish', strength: (p === 'morning_star' || p === 'three_soldiers') ? 88 : 80 };
    if (bear.includes(p)) return { signal: 'Bearish', strength: (p === 'evening_star' || p === 'three_crows') ? 88 : 80 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 46 Higher highs / higher lows
  hhhl: d => {
    const ms = d.marketStructure;
    if (ms.hhhl) return { signal: 'Bullish', strength: 85 };
    if (ms.lhll) return { signal: 'Bearish', strength: 85 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 47 Inside bar (consolidation)
  insideBar: d => {
    if (!d.priceAction.insideBar) return { signal: 'Neutral', strength: 50 };
    const t = d.trend.primary;
    if (t === 'bullish') return { signal: 'Bullish', strength: 62 };
    if (t === 'bearish') return { signal: 'Bearish', strength: 62 };
    return { signal: 'Neutral', strength: 55 };
  },

  // 48 Outside bar / engulfing candle
  outsideBar: d => {
    if (!d.priceAction.outsideBar) return { signal: 'Neutral', strength: 50 };
    const t = d.trend.primary;
    if (t === 'bullish') return { signal: 'Bullish', strength: 72 };
    if (t === 'bearish') return { signal: 'Bearish', strength: 72 };
    return { signal: 'Neutral', strength: 55 };
  },

  // 49 Trendline break
  trendlineBreak: d => {
    const tb = d.priceAction.trendlineBreak;
    if (tb === 'bullish') return { signal: 'Bullish', strength: 82 };
    if (tb === 'bearish') return { signal: 'Bearish', strength: 82 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 50 Support level hold
  supportHold: d => {
    const { levels } = d;
    const price = levels.currentPrice;
    if (!price || !levels.support.length) return { signal: 'Neutral', strength: 50 };
    const nearSup = levels.support.some(s => s && Math.abs(price - s) / price < 0.015);
    if (nearSup && d.trend.primary === 'bullish') return { signal: 'Bullish', strength: 80 };
    if (nearSup) return { signal: 'Bullish', strength: 65 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 51 Resistance break
  resistanceBreak: d => {
    const cp = d.chartPattern;
    if (cp.breakout && cp.direction === 'bullish') return { signal: 'Bullish', strength: 85 };
    if (cp.breakout && cp.direction === 'bearish') return { signal: 'Bearish', strength: 85 };
    const { levels } = d;
    const price = levels.currentPrice;
    if (!price || !levels.resistance.length) return { signal: 'Neutral', strength: 50 };
    const nearRes = levels.resistance.some(r => r && Math.abs(price - r) / price < 0.015);
    if (nearRes && d.trend.primary === 'bearish') return { signal: 'Bearish', strength: 72 };
    if (nearRes) return { signal: 'Neutral', strength: 58 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 52 Pivot point bounce
  pivotBounce: d => {
    const ms = d.marketStructure;
    const t = d.trend.primary;
    if (ms.type === 'range') {
      if (t === 'bullish') return { signal: 'Bullish', strength: 65 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 65 };
      return { signal: 'Neutral', strength: 55 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 53 Swing structure
  swingStructure: d => {
    const ms = d.marketStructure;
    if (ms.direction === 'bullish') return { signal: 'Bullish', strength: 80 };
    if (ms.direction === 'bearish') return { signal: 'Bearish', strength: 80 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 54 Failed breakout
  failedBreakout: d => {
    const cp = d.chartPattern;
    if (!cp.breakout && cp.completion > 80 && cp.type !== 'none') {
      if (cp.direction === 'bullish') return { signal: 'Bearish', strength: 68 };
      if (cp.direction === 'bearish') return { signal: 'Bullish', strength: 68 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 55 Range position (premium/discount)
  rangePosition: d => {
    const ms = d.marketStructure;
    if (ms.type !== 'range') return { signal: 'Neutral', strength: 50 };
    const pd = d.smc.premiumDiscount;
    if (pd === 'discount') return { signal: 'Bullish', strength: 68 };
    if (pd === 'premium')  return { signal: 'Bearish', strength: 68 };
    return { signal: 'Neutral', strength: 55 };
  },

  // 56 Hammer at support
  hammer: d => {
    const c = d.priceAction.lastCandle, p = d.priceAction.pattern;
    if (c !== 'hammer' && p !== 'hammer') return { signal: 'Neutral', strength: 50 };
    const { levels } = d;
    const price = levels.currentPrice;
    const nearSup = price && levels.support.some(s => s && Math.abs(price - s) / price < 0.02);
    return nearSup ? { signal: 'Bullish', strength: 88 } : { signal: 'Bullish', strength: 76 };
  },

  // 57 Shooting star at resistance
  shootingStar: d => {
    const c = d.priceAction.lastCandle, p = d.priceAction.pattern;
    if (c !== 'shooting_star' && p !== 'shooting_star') return { signal: 'Neutral', strength: 50 };
    const { levels } = d;
    const price = levels.currentPrice;
    const nearRes = price && levels.resistance.some(r => r && Math.abs(price - r) / price < 0.02);
    return nearRes ? { signal: 'Bearish', strength: 88 } : { signal: 'Bearish', strength: 76 };
  },

  // 58 Engulfing at key level
  engulfing: d => {
    const p = d.priceAction.pattern;
    if (p === 'engulfing_bull') {
      if (d.smc.orderBlock.present && d.smc.orderBlock.type === 'bullish') return { signal: 'Bullish', strength: 90 };
      const { levels } = d;
      const nearSup = levels.currentPrice && levels.support.some(s => s && Math.abs(levels.currentPrice - s) / levels.currentPrice < 0.015);
      return nearSup ? { signal: 'Bullish', strength: 86 } : { signal: 'Bullish', strength: 80 };
    }
    if (p === 'engulfing_bear') {
      if (d.smc.orderBlock.present && d.smc.orderBlock.type === 'bearish') return { signal: 'Bearish', strength: 90 };
      return { signal: 'Bearish', strength: 80 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  /* ── MEAN REVERSION (8 strategies) ── */

  // 59 RSI extreme reversion
  rsiReversion: d => {
    const rsi = d.indicators.rsi;
    if (!rsi.visible) return null;
    const v = rsi.value;
    if (v !== null && v < 20) return { signal: 'Bullish', strength: 85 };
    if (v !== null && v > 80) return { signal: 'Bearish', strength: 85 };
    if (rsi.zone === 'oversold')   return { signal: 'Bullish', strength: 78 };
    if (rsi.zone === 'overbought') return { signal: 'Bearish', strength: 78 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 60 Bollinger band touch (mean reversion)
  bbTouch: d => {
    const bb = d.indicators.bollinger;
    if (!bb.visible) return null;
    if (bb.position === 'outside_lower') return { signal: 'Bullish', strength: 80 };
    if (bb.position === 'outside_upper') return { signal: 'Bearish', strength: 80 };
    if (bb.position === 'lower') return { signal: 'Bullish', strength: 68 };
    if (bb.position === 'upper') return { signal: 'Bearish', strength: 68 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 61 Z-score (statistical deviation)
  zScore: d => {
    const bb = d.indicators.bollinger, rsi = d.indicators.rsi;
    if (bb.visible) {
      if (bb.position === 'outside_upper') return { signal: 'Bearish', strength: 76 };
      if (bb.position === 'outside_lower') return { signal: 'Bullish', strength: 76 };
    }
    if (rsi.visible && rsi.value !== null) {
      if (rsi.value > 75) return { signal: 'Bearish', strength: 72 };
      if (rsi.value < 25) return { signal: 'Bullish', strength: 72 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 62 VWAP deviation reversion
  vwapDeviation: d => {
    const v = d.indicators.vwap;
    if (!v.visible) return null;
    const t = d.trend.primary;
    if (!v.priceAbove && t !== 'bearish') return { signal: 'Bullish', strength: 65 };
    if (v.priceAbove  && t !== 'bullish') return { signal: 'Bearish', strength: 60 };
    return { signal: 'Neutral', strength: 52 };
  },

  // 63 Fibonacci retracement
  fibRetracement: d => {
    const fib = d.fibonacci;
    if (!fib.visible) return null;
    const golden = ['0.5', '0.618', '0.382'];
    if (golden.includes(fib.nearRetracement)) {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 80 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 80 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 64 Oversold bounce confluence
  oversoldBounce: d => {
    const rsi = d.indicators.rsi, stoch = d.indicators.stochastic;
    let score = 0;
    if (rsi.visible && rsi.zone === 'oversold') score += 2;
    if (stoch.visible && stoch.zone === 'oversold') score += 2;
    const c = d.priceAction.lastCandle;
    if (c === 'hammer' || c === 'pinbar_bull') score++;
    if (score >= 3) return { signal: 'Bullish', strength: 80 };
    if (score >= 1) return { signal: 'Bullish', strength: 65 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 65 Overbought fade confluence
  overboughtFade: d => {
    const rsi = d.indicators.rsi, stoch = d.indicators.stochastic;
    let score = 0;
    if (rsi.visible && rsi.zone === 'overbought') score += 2;
    if (stoch.visible && stoch.zone === 'overbought') score += 2;
    const c = d.priceAction.lastCandle;
    if (c === 'shooting_star' || c === 'pinbar_bear') score++;
    if (score >= 3) return { signal: 'Bearish', strength: 80 };
    if (score >= 1) return { signal: 'Bearish', strength: 65 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 66 Mean deviation from average
  meanDeviation: d => {
    const t = d.trend, rsi = d.indicators.rsi;
    if (t.strength === 'strong' && rsi.visible) {
      if (rsi.zone === 'overbought') return { signal: 'Bearish', strength: 68 };
      if (rsi.zone === 'oversold')   return { signal: 'Bullish', strength: 68 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  /* ── SMART MONEY CONCEPTS (12 strategies) ── */

  // 67 Break of Structure
  bos: d => {
    const smc = d.smc;
    if (smc.bos === 'bullish') return { signal: 'Bullish', strength: 88 };
    if (smc.bos === 'bearish') return { signal: 'Bearish', strength: 88 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 68 Change of Character
  choch: d => {
    const smc = d.smc;
    if (smc.choch === 'bullish') return { signal: 'Bullish', strength: 85 };
    if (smc.choch === 'bearish') return { signal: 'Bearish', strength: 85 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 69 Order Block
  orderBlock: d => {
    const ob = d.smc.orderBlock;
    if (!ob.present) return { signal: 'Neutral', strength: 50 };
    if (ob.type === 'bullish' && ob.priceNear) return { signal: 'Bullish', strength: 88 };
    if (ob.type === 'bearish' && ob.priceNear) return { signal: 'Bearish', strength: 88 };
    if (ob.type === 'bullish') return { signal: 'Bullish', strength: 72 };
    if (ob.type === 'bearish') return { signal: 'Bearish', strength: 72 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 70 Fair Value Gap
  fvg: d => {
    const fvg = d.smc.fvg;
    if (!fvg.present || fvg.filled) return { signal: 'Neutral', strength: 50 };
    const t = d.trend.primary;
    if (fvg.type === 'bullish' && t === 'bullish') return { signal: 'Bullish', strength: 82 };
    if (fvg.type === 'bearish' && t === 'bearish') return { signal: 'Bearish', strength: 82 };
    if (fvg.type === 'bullish') return { signal: 'Bullish', strength: 70 };
    if (fvg.type === 'bearish') return { signal: 'Bearish', strength: 70 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 71 Liquidity hunt (sweep + reversal)
  liquidityHunt: d => {
    const smc = d.smc, ms = d.marketStructure;
    if (smc.liquidityBelow && ms.direction === 'bullish' && smc.bos === 'bullish') return { signal: 'Bullish', strength: 90 };
    if (smc.liquidityAbove && ms.direction === 'bearish' && smc.bos === 'bearish') return { signal: 'Bearish', strength: 90 };
    if (smc.liquidityBelow) return { signal: 'Bullish', strength: 65 };
    if (smc.liquidityAbove) return { signal: 'Bearish', strength: 65 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 72 Premium / Discount
  premiumDiscount: d => {
    const pd = d.smc.premiumDiscount;
    if (pd === 'discount') return { signal: 'Bullish', strength: 75 };
    if (pd === 'premium')  return { signal: 'Bearish', strength: 75 };
    return { signal: 'Neutral', strength: 55 };
  },

  // 73 Equal highs / equal lows (liquidity targets)
  equalHL: d => {
    const smc = d.smc;
    if (smc.liquidityAbove && smc.liquidityBelow) return { signal: 'Neutral', strength: 55 };
    if (smc.liquidityAbove) return { signal: 'Bullish', strength: 68 };
    if (smc.liquidityBelow) return { signal: 'Bearish', strength: 68 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 74 Market Maker model (composite)
  mmModel: d => {
    const smc = d.smc, ms = d.marketStructure;
    let score = 0;
    if (ms.type === 'bos'   && ms.direction === 'bullish') score += 30;
    if (ms.type === 'choch' && ms.direction === 'bullish') score += 20;
    if (smc.premiumDiscount === 'discount') score += 20;
    if (smc.orderBlock.present && smc.orderBlock.type === 'bullish') score += 25;
    if (smc.fvg.present && smc.fvg.type === 'bullish') score += 20;
    if (ms.type === 'bos'   && ms.direction === 'bearish') score -= 30;
    if (ms.type === 'choch' && ms.direction === 'bearish') score -= 20;
    if (smc.premiumDiscount === 'premium') score -= 20;
    if (smc.orderBlock.present && smc.orderBlock.type === 'bearish') score -= 25;
    if (smc.fvg.present && smc.fvg.type === 'bearish') score -= 20;
    if (score > 30)  return { signal: 'Bullish', strength: Math.min(95, 50 + score) };
    if (score < -30) return { signal: 'Bearish', strength: Math.min(95, 50 + Math.abs(score)) };
    return { signal: 'Neutral', strength: 52 };
  },

  // 75 Inducement sweep
  inducement: d => {
    const smc = d.smc;
    if (smc.choch !== 'none' && smc.bos === 'none') {
      if (smc.choch === 'bullish') return { signal: 'Bullish', strength: 82 };
      if (smc.choch === 'bearish') return { signal: 'Bearish', strength: 82 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 76 Institutional order flow
  institutionalFlow: d => {
    const vol = d.indicators.volume, smc = d.smc;
    let score = 0;
    if (vol.visible && vol.aboveAverage) score += 20;
    if (smc.bos === 'bullish') score += 30;
    else if (smc.bos === 'bearish') score -= 30;
    if (smc.orderBlock.present) score += (smc.orderBlock.type === 'bullish' ? 20 : -20);
    const t = d.trend;
    if (t.primary === 'bullish' && t.strength === 'strong') score += 20;
    else if (t.primary === 'bearish' && t.strength === 'strong') score -= 20;
    if (score > 30)  return { signal: 'Bullish', strength: Math.min(90, 50 + score) };
    if (score < -30) return { signal: 'Bearish', strength: Math.min(90, 50 + Math.abs(score)) };
    return { signal: 'Neutral', strength: 52 };
  },

  // 77 Displacement (impulsive move)
  displacement: d => {
    const t = d.trend, vol = d.indicators.volume, ms = d.marketStructure;
    if (t.strength === 'strong' && vol.visible && vol.aboveAverage) {
      if (ms.type === 'bos' || ms.type === 'breakout') {
        if (t.primary === 'bullish') return { signal: 'Bullish', strength: 86 };
        if (t.primary === 'bearish') return { signal: 'Bearish', strength: 86 };
      }
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 78 Mitigation block
  mitigationBlock: d => {
    const ob = d.smc.orderBlock;
    if (ob.present && ob.priceNear) {
      if (ob.type === 'bullish') return { signal: 'Bullish', strength: 85 };
      if (ob.type === 'bearish') return { signal: 'Bearish', strength: 85 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  /* ── CHART PATTERNS (12 strategies) ── */

  // 79 Head & Shoulders
  headShoulders: d => {
    const cp = d.chartPattern;
    if (cp.type === 'head_shoulders') return cp.breakout ? { signal: 'Bearish', strength: 88 } : cp.completion > 70 ? { signal: 'Bearish', strength: 72 } : { signal: 'Neutral', strength: 55 };
    if (cp.type === 'inv_head_shoulders') return cp.breakout ? { signal: 'Bullish', strength: 88 } : cp.completion > 70 ? { signal: 'Bullish', strength: 72 } : { signal: 'Neutral', strength: 55 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 80 Double top / bottom
  doubleTopBottom: d => {
    const cp = d.chartPattern;
    if (cp.type === 'double_top')    return cp.breakout ? { signal: 'Bearish', strength: 86 } : cp.completion > 80 ? { signal: 'Bearish', strength: 70 } : { signal: 'Neutral', strength: 55 };
    if (cp.type === 'double_bottom') return cp.breakout ? { signal: 'Bullish', strength: 86 } : cp.completion > 80 ? { signal: 'Bullish', strength: 70 } : { signal: 'Neutral', strength: 55 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 81 Flag / pennant
  flagPennant: d => {
    const cp = d.chartPattern;
    if (cp.type === 'bull_flag' || cp.type === 'pennant') return cp.breakout ? { signal: 'Bullish', strength: 85 } : cp.completion > 70 ? { signal: 'Bullish', strength: 72 } : { signal: 'Neutral', strength: 55 };
    if (cp.type === 'bear_flag')     return cp.breakout ? { signal: 'Bearish', strength: 85 } : cp.completion > 70 ? { signal: 'Bearish', strength: 72 } : { signal: 'Neutral', strength: 55 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 82 Triangle breakout
  triangle: d => {
    const cp = d.chartPattern;
    if (cp.type === 'ascending_triangle')  return cp.breakout ? { signal: 'Bullish', strength: 84 } : cp.completion > 75 ? { signal: 'Bullish', strength: 68 } : { signal: 'Neutral', strength: 55 };
    if (cp.type === 'descending_triangle') return cp.breakout ? { signal: 'Bearish', strength: 84 } : cp.completion > 75 ? { signal: 'Bearish', strength: 68 } : { signal: 'Neutral', strength: 55 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 83 Cup & Handle
  cupHandle: d => {
    const cp = d.chartPattern;
    if (cp.type !== 'cup_handle') return { signal: 'Neutral', strength: 50 };
    return cp.breakout ? { signal: 'Bullish', strength: 88 } : cp.completion > 80 ? { signal: 'Bullish', strength: 72 } : { signal: 'Neutral', strength: 55 };
  },

  // 84 Wedge pattern
  wedge: d => {
    const cp = d.chartPattern;
    if (cp.type === 'falling_wedge') return cp.breakout ? { signal: 'Bullish', strength: 84 } : { signal: 'Bullish', strength: 65 };
    if (cp.type === 'rising_wedge')  return cp.breakout ? { signal: 'Bearish', strength: 84 } : { signal: 'Bearish', strength: 65 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 85 Rectangle range
  rectangle: d => {
    const cp = d.chartPattern;
    if (cp.type === 'rectangle') {
      if (cp.breakout && cp.direction === 'bullish') return { signal: 'Bullish', strength: 82 };
      if (cp.breakout && cp.direction === 'bearish') return { signal: 'Bearish', strength: 82 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 86 Broadening pattern (distribution)
  broadening: d => {
    const cp = d.chartPattern;
    if (cp.type === 'broadening') return { signal: 'Neutral', strength: 55 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 87 Overall pattern signal
  patternSignal: d => {
    const cp = d.chartPattern;
    if (cp.type === 'none') return { signal: 'Neutral', strength: 50 };
    if (cp.direction === 'bullish') return { signal: 'Bullish', strength: Math.round(Math.min(90, cp.breakout ? 85 : 58 + cp.completion * 0.22)) };
    if (cp.direction === 'bearish') return { signal: 'Bearish', strength: Math.round(Math.min(90, cp.breakout ? 85 : 58 + cp.completion * 0.22)) };
    return { signal: 'Neutral', strength: 50 };
  },

  // 88 Wyckoff accumulation / distribution
  wyckoff: d => {
    const ms = d.marketStructure;
    if (ms.type === 'accumulation') return { signal: 'Bullish', strength: 76 };
    if (ms.type === 'distribution') return { signal: 'Bearish', strength: 76 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 89 Pennant continuation
  pennant: d => {
    const cp = d.chartPattern;
    if (cp.type !== 'pennant') return { signal: 'Neutral', strength: 50 };
    const t = d.trend.primary;
    if (cp.breakout) {
      if (t === 'bullish') return { signal: 'Bullish', strength: 84 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 84 };
    }
    return { signal: 'Neutral', strength: 58 };
  },

  // 90 Pattern completion momentum
  patternCompletion: d => {
    const cp = d.chartPattern;
    if (cp.type === 'none' || cp.completion < 50) return { signal: 'Neutral', strength: 50 };
    if (cp.direction === 'bullish') return { signal: 'Bullish', strength: Math.round(55 + cp.completion * 0.35) };
    if (cp.direction === 'bearish') return { signal: 'Bearish', strength: Math.round(55 + cp.completion * 0.35) };
    return { signal: 'Neutral', strength: 50 };
  },

  /* ── FIBONACCI (8 strategies) ── */

  // 91 Fibonacci 0.618 golden ratio
  fib618: d => {
    const fib = d.fibonacci;
    if (!fib.visible || fib.nearRetracement !== '0.618') return null;
    const t = d.trend.primary;
    if (t === 'bullish') return { signal: 'Bullish', strength: 85 };
    if (t === 'bearish') return { signal: 'Bearish', strength: 85 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 92 Fibonacci 0.382 / 0.5
  fibGolden: d => {
    const fib = d.fibonacci;
    if (!fib.visible) return null;
    if (!['0.382', '0.5'].includes(fib.nearRetracement)) return null;
    const t = d.trend.primary;
    if (t === 'bullish') return { signal: 'Bullish', strength: 78 };
    if (t === 'bearish') return { signal: 'Bearish', strength: 78 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 93 Fibonacci extension target
  fibExtension: d => {
    const fib = d.fibonacci;
    if (!fib.visible) return null;
    if (fib.nearExtension === '1.618') return { signal: 'Neutral', strength: 58 };
    if (fib.nearExtension !== 'none') {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 72 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 72 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 94 Harmonic Gartley
  harmonicGartley: d => {
    const fib = d.fibonacci;
    if (!fib.visible || fib.nearRetracement !== '0.618') return null;
    if (fib.nearExtension !== '1.272') return null;
    const t = d.trend.primary;
    return t === 'bullish' ? { signal: 'Bullish', strength: 86 } : t === 'bearish' ? { signal: 'Bearish', strength: 86 } : null;
  },

  // 95 Harmonic Butterfly (1.27 / 1.618 extension)
  harmonicButterfly: d => {
    const fib = d.fibonacci;
    if (!fib.visible) return null;
    if (fib.nearExtension === '1.618' || fib.nearExtension === '1.414') {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bearish', strength: 74 };
      if (t === 'bearish') return { signal: 'Bullish', strength: 74 };
    }
    return null;
  },

  // 96 AB=CD pattern
  abcd: d => {
    const fib = d.fibonacci;
    if (!fib.visible || fib.nearRetracement !== '0.5') return null;
    if (fib.nearExtension !== '1.272') return null;
    const t = d.trend.primary;
    return t === 'bullish' ? { signal: 'Bullish', strength: 80 } : t === 'bearish' ? { signal: 'Bearish', strength: 80 } : null;
  },

  // 97 Fibonacci cluster (any fib present)
  fibCluster: d => {
    const fib = d.fibonacci;
    if (!fib.visible || fib.nearRetracement === 'none') return null;
    const t = d.trend.primary;
    if (t === 'bullish') return { signal: 'Bullish', strength: 72 };
    if (t === 'bearish') return { signal: 'Bearish', strength: 72 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 98 Golden ratio multi-confluence
  goldenRatio: d => {
    const fib = d.fibonacci, rsi = d.indicators.rsi, bb = d.indicators.bollinger;
    let score = 0;
    if (fib.visible && fib.nearRetracement === '0.618') score += 2;
    if (fib.visible && fib.nearRetracement === '0.5')   score += 1;
    if (rsi.visible && rsi.zone === 'oversold' && d.trend.primary === 'bullish') score += 2;
    if (bb.visible  && bb.position === 'lower')   score += 1;
    if (score >= 3) {
      const t = d.trend.primary;
      if (t === 'bullish') return { signal: 'Bullish', strength: 84 };
      if (t === 'bearish') return { signal: 'Bearish', strength: 84 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  /* ── CANDLESTICK PATTERNS (5 strategies) ── */

  // 99 Morning / Evening star
  starPattern: d => {
    const p = d.priceAction.pattern;
    if (p === 'morning_star') return { signal: 'Bullish', strength: 86 };
    if (p === 'evening_star') return { signal: 'Bearish', strength: 86 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 100 Three soldiers / three crows
  threeCandles: d => {
    const p = d.priceAction.pattern;
    if (p === 'three_soldiers') return { signal: 'Bullish', strength: 88 };
    if (p === 'three_crows')    return { signal: 'Bearish', strength: 88 };
    return { signal: 'Neutral', strength: 50 };
  },

  // 101 Doji star / spinning top (indecision)
  dojiStar: d => {
    const p = d.priceAction.pattern;
    if (p !== 'doji_star' && p !== 'spinning_top') return { signal: 'Neutral', strength: 50 };
    const rsi = d.indicators.rsi;
    if (rsi.visible && rsi.zone === 'overbought') return { signal: 'Bearish', strength: 72 };
    if (rsi.visible && rsi.zone === 'oversold')   return { signal: 'Bullish', strength: 72 };
    return { signal: 'Neutral', strength: 58 };
  },

  // 102 Pin bar confluence with order block
  pinBar: d => {
    const c = d.priceAction.lastCandle, smc = d.smc;
    if (c === 'pinbar_bull' || c === 'hammer') {
      if (smc.orderBlock.present && smc.orderBlock.type === 'bullish') return { signal: 'Bullish', strength: 92 };
      return { signal: 'Bullish', strength: 80 };
    }
    if (c === 'pinbar_bear' || c === 'shooting_star') {
      if (smc.orderBlock.present && smc.orderBlock.type === 'bearish') return { signal: 'Bearish', strength: 92 };
      return { signal: 'Bearish', strength: 80 };
    }
    return { signal: 'Neutral', strength: 50 };
  },

  // 103 Engulfing at structure level
  engulfingAtLevel: d => {
    const p = d.priceAction.pattern, smc = d.smc, levels = d.levels;
    if (p === 'engulfing_bull') {
      if (smc.orderBlock.present && smc.orderBlock.type === 'bullish') return { signal: 'Bullish', strength: 92 };
      const nearSup = levels.currentPrice && levels.support.some(s => s && Math.abs(levels.currentPrice - s) / levels.currentPrice < 0.015);
      return nearSup ? { signal: 'Bullish', strength: 88 } : { signal: 'Bullish', strength: 80 };
    }
    if (p === 'engulfing_bear') {
      if (smc.orderBlock.present && smc.orderBlock.type === 'bearish') return { signal: 'Bearish', strength: 92 };
      return { signal: 'Bearish', strength: 80 };
    }
    return { signal: 'Neutral', strength: 50 };
  },
};

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — STRATEGY GROUP DEFINITIONS
   Maps group names to evaluator functions + timeframe weights.
══════════════════════════════════════════════════════════════ */

const GROUP_DEFS = [
  {
    id: 'trend', name: 'Trend Following',
    fns: ['emaAlignment','emaCross','priceVsEma','goldenCross','supertrend','ichimokuCloud','ichimokuTK','primaryTrend','adx','marketStructure','vwapTrend','sma50','sma200','dualMa','trendMomentum'],
    tfW: { '1m':15,'5m':18,'15m':20,'30m':22,'1h':25,'2h':27,'4h':30,'1d':35,'3d':38,'1w':40,'1M':45 },
  },
  {
    id: 'momentum', name: 'Momentum',
    fns: ['rsiTrend','rsiExtreme','rsiDivergence','macdHistogram','macdCross','macdZero','stochastic','williamsR','roc','awesomeOsc','cci','trix'],
    tfW: { '1m':25,'5m':23,'15m':20,'30m':18,'1h':17,'2h':16,'4h':15,'1d':12,'3d':10,'1w':9,'1M':7 },
  },
  {
    id: 'volatility', name: 'Volatility',
    fns: ['bbSqueeze','bbBreakout','bbPosition','atrTrend','keltner','ttmSqueeze','donchian','vcp'],
    tfW: { '1m':10,'5m':10,'15m':10,'30m':10,'1h':10,'2h':10,'4h':10,'1d':8,'3d':7,'1w':7,'1M':5 },
  },
  {
    id: 'volume', name: 'Volume',
    fns: ['volumeTrend','obv','vwapPosition','mfi','adLine','cmf','rvol','volumeDivergence'],
    tfW: { '1m':20,'5m':18,'15m':15,'30m':14,'1h':12,'2h':11,'4h':10,'1d':10,'3d':9,'1w':8,'1M':7 },
  },
  {
    id: 'priceAction', name: 'Price Action',
    fns: ['lastCandle','candlePattern','hhhl','insideBar','outsideBar','trendlineBreak','supportHold','resistanceBreak','pivotBounce','swingStructure','failedBreakout','rangePosition','hammer','shootingStar','engulfing'],
    tfW: { '1m':30,'5m':28,'15m':22,'30m':20,'1h':18,'2h':16,'4h':16,'1d':15,'3d':13,'1w':12,'1M':10 },
  },
  {
    id: 'meanReversion', name: 'Mean Reversion',
    fns: ['rsiReversion','bbTouch','zScore','vwapDeviation','fibRetracement','oversoldBounce','overboughtFade','meanDeviation'],
    tfW: { '1m':10,'5m':10,'15m':10,'30m':10,'1h':10,'2h':10,'4h':10,'1d':10,'3d':8,'1w':7,'1M':6 },
  },
  {
    id: 'smc', name: 'Smart Money',
    fns: ['bos','choch','orderBlock','fvg','liquidityHunt','premiumDiscount','equalHL','mmModel','inducement','institutionalFlow','displacement','mitigationBlock'],
    tfW: { '1m':8,'5m':10,'15m':14,'30m':17,'1h':20,'2h':22,'4h':25,'1d':20,'3d':17,'1w':14,'1M':10 },
  },
  {
    id: 'chartPatterns', name: 'Chart Patterns',
    fns: ['headShoulders','doubleTopBottom','flagPennant','triangle','cupHandle','wedge','rectangle','broadening','patternSignal','wyckoff','pennant','patternCompletion'],
    tfW: { '1m':4,'5m':5,'15m':7,'30m':10,'1h':12,'2h':14,'4h':15,'1d':18,'3d':19,'1w':20,'1M':22 },
  },
  {
    id: 'fibonacci', name: 'Fibonacci',
    fns: ['fib618','fibGolden','fibExtension','harmonicGartley','harmonicButterfly','abcd','fibCluster','goldenRatio'],
    tfW: { '1m':3,'5m':4,'15m':5,'30m':5,'1h':5,'2h':6,'4h':7,'1d':9,'3d':11,'1w':13,'1M':15 },
  },
  {
    id: 'candlePatterns', name: 'Candlestick',
    fns: ['starPattern','threeCandles','dojiStar','pinBar','engulfingAtLevel'],
    tfW: { '1m':10,'5m':10,'15m':8,'30m':8,'1h':7,'2h':6,'4h':6,'1d':7,'3d':5,'1w':5,'1M':4 },
  },
];

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — CONSENSUS ENGINE
══════════════════════════════════════════════════════════════ */

function normalizeTF(tf) {
  if (!tf) return '4h';
  const t = tf.toLowerCase().replace(/\s/g, '');
  const map = { '1min':'1m','5min':'5m','15min':'15m','30min':'30m','60min':'1h','h':'1h','4hour':'4h','daily':'1d','weekly':'1w','monthly':'1M','d':'1d','w':'1w' };
  return map[t] || t;
}

function evaluateAllStrategies(d) {
  const results = {};
  for (const g of GROUP_DEFS) {
    results[g.id] = g.fns.map(name => {
      try {
        return STRAT[name] ? STRAT[name](d) : null;
      } catch {
        return null;
      }
    }).filter(r => r !== null);
  }
  return results;
}

function computeGroupConsensus(groupResults, timeframe) {
  const tf = normalizeTF(timeframe);
  const out = [];
  for (const g of GROUP_DEFS) {
    const signals = groupResults[g.id] || [];
    if (!signals.length) continue;
    let bullScore = 0, bearScore = 0;
    for (const s of signals) {
      if (s.signal === 'Bullish') bullScore += s.strength;
      else if (s.signal === 'Bearish') bearScore += s.strength;
    }
    const total = signals.length * 100;
    const netScore = (bullScore - bearScore) / total;
    const avgStrength = Math.max(bullScore, bearScore) / signals.length;
    let sig = 'Neutral';
    if (netScore > 0.12) sig = 'Bullish';
    else if (netScore < -0.12) sig = 'Bearish';
    const tfWeight = g.tfW[tf] || 15;
    out.push({ group: g.name, sig, w: Math.round(Math.min(99, avgStrength)), tfWeight, netScore });
  }
  return out;
}

function computeFinalRecommendation(groupConsensus) {
  let bullTotal = 0, bearTotal = 0, weightTotal = 0;
  for (const g of groupConsensus) {
    const w = g.tfWeight;
    weightTotal += w;
    if (g.sig === 'Bullish') bullTotal += g.w * w;
    else if (g.sig === 'Bearish') bearTotal += g.w * w;
  }
  if (!weightTotal) return { rec: 'NEUTRAL', conf: 50 };
  const maxPossible = weightTotal * 100;
  const net = (bullTotal - bearTotal) / maxPossible;
  const conf = Math.round(Math.max(5, Math.min(97, 50 + net * 50)));
  let rec = 'NEUTRAL';
  if (net > 0.18) rec = 'BUY';
  else if (net < -0.18) rec = 'SELL';
  return { rec, conf };
}

function computeRiskScore(d, groupConsensus) {
  let risk = 40;
  const rsi = d.indicators.rsi;
  if (rsi.visible && rsi.value !== null) {
    if (rsi.value > 75 || rsi.value < 25) risk += 15;
  }
  const t = d.trend.strength;
  if (t === 'weak') risk += 12;
  if (d.marketStructure.type === 'range') risk += 8;
  const smcGroup = groupConsensus.find(g => g.group === 'Smart Money');
  if (smcGroup && smcGroup.sig === 'Neutral') risk += 6;
  if (d.smc.choch !== 'none') risk -= 5;
  if (d.smc.orderBlock.present && d.smc.orderBlock.priceNear) risk -= 8;
  return Math.round(Math.max(10, Math.min(92, risk)));
}

/* ══════════════════════════════════════════════════════════════
   SECTION 6 — TRADE PLAN GENERATION
══════════════════════════════════════════════════════════════ */

function fmt(price) {
  if (price === null || price === undefined) return '—';
  const abs = Math.abs(price);
  let s;
  if (abs >= 10000) s = price.toFixed(0);
  else if (abs >= 100) s = price.toFixed(2);
  else if (abs >= 1)   s = price.toFixed(3);
  else                 s = price.toFixed(5);
  return Number(s).toLocaleString('en-US', { minimumFractionDigits: s.split('.')[1]?.length || 0 });
}

function generateTradePlan(d, rec, conf) {
  if (conf < 65 || rec === 'NEUTRAL') return null;
  const price = d.levels.currentPrice;
  if (!price) return null;
  const sup  = d.levels.support.filter(Boolean);
  const res  = d.levels.resistance.filter(Boolean);

  if (rec === 'BUY') {
    const stop    = sup.length ? sup[0] * 0.997  : price * 0.978;
    const t1      = res.length ? res[0]           : price * 1.022;
    const t2      = res.length > 1 ? res[1]       : price * 1.045;
    const t3      = res.length > 2 ? res[2]       : price * 1.075;
    const risk    = Math.max(0.001, price - stop);
    const reward  = t1 - price;
    const rr      = (reward / risk).toFixed(1);
    const entryLo = (price * 0.998).toFixed(price > 100 ? 0 : 5);
    const entryHi = (price * 1.002).toFixed(price > 100 ? 0 : 5);
    return {
      entry: `${fmt(parseFloat(entryLo))} – ${fmt(parseFloat(entryHi))}`,
      stop: fmt(stop),
      targets: [fmt(t1), fmt(t2), fmt(t3)],
      rr,
    };
  }

  if (rec === 'SELL') {
    const stop    = res.length ? res[0] * 1.003  : price * 1.022;
    const t1      = sup.length ? sup[0]           : price * 0.978;
    const t2      = sup.length > 1 ? sup[1]       : price * 0.955;
    const t3      = sup.length > 2 ? sup[2]       : price * 0.925;
    const risk    = Math.max(0.001, stop - price);
    const reward  = price - t1;
    const rr      = (reward / risk).toFixed(1);
    const entryLo = (price * 0.998).toFixed(price > 100 ? 0 : 5);
    const entryHi = (price * 1.002).toFixed(price > 100 ? 0 : 5);
    return {
      entry: `${fmt(parseFloat(entryLo))} – ${fmt(parseFloat(entryHi))}`,
      stop: fmt(stop),
      targets: [fmt(t1), fmt(t2), fmt(t3)],
      rr,
    };
  }

  return null;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 7 — NARRATIVE + FACTOR GENERATION
══════════════════════════════════════════════════════════════ */

function generateSummary(d, rec, conf, groupConsensus) {
  const tf = d.timeframe || '?';
  const smc = d.smc, ind = d.indicators, ms = d.marketStructure;
  const topBull = groupConsensus.filter(g => g.sig === 'Bullish').sort((a, b) => b.w - a.w)[0];
  const topBear = groupConsensus.filter(g => g.sig === 'Bearish').sort((a, b) => b.w - a.w)[0];
  let s = '';

  if (rec === 'BUY') {
    s += `Bullish setup confirmed on the ${tf}. `;
    if (smc.bos === 'bullish') s += 'Break of structure to the upside signals a shift in market bias. ';
    if (smc.orderBlock.present && smc.orderBlock.type === 'bullish') s += 'Price is at a bullish order block, offering a high-probability entry zone. ';
    if (ind.ema.visible && ind.ema.alignment === 'bullish') s += 'EMA stack is fully aligned bullish with price trading above all key averages. ';
    if (ind.rsi.visible && ind.rsi.value) s += `RSI at ${ind.rsi.value} with ${ind.rsi.trend} momentum. `;
    if (topBull) s += `Strongest consensus from ${topBull.group} (${topBull.w}% bullish).`;
  } else if (rec === 'SELL') {
    s += `Bearish setup on the ${tf}. `;
    if (smc.choch === 'bearish') s += 'Change of character confirms a shift to bearish momentum. ';
    if (smc.fvg.present && smc.fvg.type === 'bearish') s += 'Open bearish fair value gap above acting as supply resistance. ';
    if (ind.ema.visible && ind.ema.alignment === 'bearish') s += 'EMA stack is bearishly aligned with price trading below key averages. ';
    if (topBear) s += `Strongest signal from ${topBear.group} (${topBear.w}% bearish).`;
  } else {
    s += `Mixed signals on the ${tf} — consolidation in play. `;
    if (ms.type === 'range') s += 'Price is range-bound between key levels with no clear directional displacement. ';
    s += 'Wait for a break of structure or clear confirmation before entering.';
  }

  return s.trim();
}

function generateBullFactors(d, groupConsensus) {
  const factors = [];
  const smc = d.smc, ind = d.indicators, ms = d.marketStructure, pa = d.priceAction;
  if (smc.bos === 'bullish') factors.push('Break of structure to the upside confirmed');
  if (smc.orderBlock.present && smc.orderBlock.type === 'bullish') factors.push('Bullish order block acting as support');
  if (smc.fvg.present && smc.fvg.type === 'bullish') factors.push('Open bullish fair value gap below price');
  if (ind.ema.visible && ind.ema.alignment === 'bullish') factors.push('EMA stack fully aligned bullish');
  if (ind.ema.recentCross === 'bullish') factors.push('Recent bullish EMA crossover');
  if (ind.rsi.visible && ind.rsi.zone === 'oversold') factors.push('RSI in oversold zone — reversion potential');
  if (ind.rsi.divergence === 'bullish') factors.push('Bullish RSI divergence detected');
  if (ind.macd.visible && ind.macd.signalCross === 'bullish') factors.push('Bullish MACD signal line crossover');
  if (ind.volume.visible && ind.volume.aboveAverage) factors.push('Volume above average confirming move');
  if (ms.hhhl) factors.push('Higher-high / higher-low market structure intact');
  if (pa.pattern === 'engulfing_bull') factors.push('Bullish engulfing candlestick pattern');
  if (pa.pattern === 'hammer' || pa.lastCandle === 'hammer') factors.push('Hammer candle at key support');
  if (d.chartPattern.type !== 'none' && d.chartPattern.direction === 'bullish') factors.push(`${d.chartPattern.type.replace(/_/g,' ')} pattern in play`);
  if (ind.ichimoku.visible && ind.ichimoku.priceAboveCloud) factors.push('Price trading above Ichimoku cloud');
  if (ind.supertrend.visible && ind.supertrend.direction === 'bullish') factors.push('Supertrend indicator bullish');
  if (smc.premiumDiscount === 'discount') factors.push('Price in discount zone — strong value area');
  return factors.slice(0, 6);
}

function generateBearFactors(d, groupConsensus) {
  const factors = [];
  const smc = d.smc, ind = d.indicators, ms = d.marketStructure, pa = d.priceAction;
  if (smc.choch === 'bearish') factors.push('Change of character (CHoCH) — bullish structure broken');
  if (smc.bos === 'bearish') factors.push('Break of structure to the downside');
  if (smc.fvg.present && smc.fvg.type === 'bearish') factors.push('Open bearish fair value gap above price');
  if (smc.orderBlock.present && smc.orderBlock.type === 'bearish') factors.push('Bearish order block acting as resistance');
  if (ind.ema.visible && ind.ema.alignment === 'bearish') factors.push('EMA stack fully aligned bearish');
  if (ind.rsi.visible && ind.rsi.zone === 'overbought') factors.push('RSI in overbought zone — exhaustion risk');
  if (ind.rsi.divergence === 'bearish') factors.push('Bearish RSI divergence detected');
  if (ind.macd.visible && ind.macd.signalCross === 'bearish') factors.push('Bearish MACD signal line crossover');
  if (ind.volume.divergence === 'bearish') factors.push('Bearish volume divergence on recent highs');
  if (ms.lhll) factors.push('Lower-high / lower-low market structure forming');
  if (pa.pattern === 'engulfing_bear') factors.push('Bearish engulfing candlestick pattern');
  if (pa.pattern === 'shooting_star' || pa.lastCandle === 'shooting_star') factors.push('Shooting star at resistance — rejection');
  if (d.chartPattern.type !== 'none' && d.chartPattern.direction === 'bearish') factors.push(`${d.chartPattern.type.replace(/_/g,' ')} pattern forming`);
  if (smc.premiumDiscount === 'premium') factors.push('Price in premium zone — overextended');
  return factors.slice(0, 6);
}

function generateLiquidityZones(d) {
  const zones = [];
  if (d.smc.liquidityAbove) {
    const res = d.levels.resistance[0];
    zones.push(res ? `${fmt(res)} (buy-side)` : 'Buy-side liquidity above');
  }
  if (d.smc.liquidityBelow) {
    const sup = d.levels.support[0];
    zones.push(sup ? `${fmt(sup)} (sell-side)` : 'Sell-side liquidity below');
  }
  if (!zones.length) {
    if (d.levels.resistance[0]) zones.push(`${fmt(d.levels.resistance[0])} (above)`);
    if (d.levels.support[0])    zones.push(`${fmt(d.levels.support[0])} (below)`);
  }
  return zones;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 8 — MAIN ENTRY POINT
══════════════════════════════════════════════════════════════ */

async function analyzeChart(imageBase64, mimeType, apiKey, timeframe) {
  // 1. Extract chart data via Claude Vision
  const d = await callClaudeVision(imageBase64, mimeType, apiKey);

  // 2. Determine effective timeframe (user override takes priority)
  const tf = timeframe || d.timeframe || '4h';

  // 3. Run all strategy evaluators
  const strategyResults = evaluateAllStrategies(d);

  // 4. Compute group-level consensus with timeframe weights
  const groupConsensus = computeGroupConsensus(strategyResults, tf);

  // 5. Final recommendation + confidence
  const { rec, conf } = computeFinalRecommendation(groupConsensus);

  // 6. Risk score
  const risk = computeRiskScore(d, groupConsensus);

  // 7. Trade plan (only for high-confidence directional signals)
  const plan = generateTradePlan(d, rec, conf);

  // 8. Narrative + factor lists
  const summary  = generateSummary(d, rec, conf, groupConsensus);
  const bullList = generateBullFactors(d, groupConsensus);
  const bearList = generateBearFactors(d, groupConsensus);
  const liqZones = generateLiquidityZones(d);

  // 9. Format levels as strings
  const fmtList = arr => (arr || []).filter(Boolean).map(n => fmt(n));

  // 10. Symbol normalization
  const rawAsset = (d.asset || 'UNKNOWN').toUpperCase();
  const symbol = rawAsset.replace(/[^A-Z]/g, '').slice(0, 6) || 'CHART';

  // 11. Build final analysis object (same shape as ANALYSES in data.jsx)
  const id = 'live_' + Date.now();
  return {
    id,
    symbol,
    name: d.asset || rawAsset,
    tf: (d.timeframe || tf).toUpperCase(),
    price: d.priceStr || (d.price ? fmt(d.price) : '—'),
    priceNum: d.price || d.levels?.currentPrice || 0,
    chg: d.change != null ? (d.change >= 0 ? '+' : '') + d.change.toFixed(2) + '%' : '—',
    up: d.change != null ? d.change >= 0 : true,
    rec,
    conf,
    risk,
    when: 'Just now',
    seed: Math.floor(Math.random() * 99) + 1,
    summary,
    bull: bullList,
    bear: bearList,
    structure: d.marketStructure
      ? `${d.marketStructure.direction.charAt(0).toUpperCase() + d.marketStructure.direction.slice(1)} — ${d.marketStructure.type.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}`
      : 'Analyzing...',
    support: fmtList(d.levels?.support),
    resist:  fmtList(d.levels?.resistance),
    liquidity: liqZones,
    entry:   plan ? plan.entry   : null,
    stop:    plan ? plan.stop    : null,
    targets: plan ? plan.targets : [],
    rr:      plan ? plan.rr      : '—',
    strategies: 103,
    consensus: groupConsensus.slice(0, 5).map(g => ({
      group: g.group,
      sig: g.sig,
      w: g.w,
    })),
    spark: window.DATA.spark(Math.floor(Math.random() * 20)),
    _chartData: d,
  };
}

window.ENGINE = {
  analyzeChart,
  STRATEGY_COUNT: 103,
};
