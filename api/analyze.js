export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType } = req.body;
  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'Missing imageBase64 or mimeType' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: VISION_PROMPT },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err.error && err.error.message) || `Anthropic error ${response.status}`;
    return res.status(response.status).json({ error: msg });
  }

  const data = await response.json();
  return res.status(200).json(data);
}

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
    "ema": { "visible": true_or_false, "alignment": "bullish|bearish|mixed", "priceAbove": true_or_false, "recentCross": "bullish|bearish|none" },
    "sma50": { "visible": true_or_false, "priceAbove": true_or_false },
    "sma200": { "visible": true_or_false, "priceAbove": true_or_false },
    "rsi": { "visible": true_or_false, "value": number_between_0_and_100_or_null, "zone": "oversold|neutral|overbought", "trend": "rising|falling|flat", "divergence": "bullish|bearish|none" },
    "macd": { "visible": true_or_false, "histogram": "positive_rising|positive_falling|negative_rising|negative_falling|none", "signalCross": "bullish|bearish|none", "aboveZero": true_or_false },
    "bollinger": { "visible": true_or_false, "position": "upper|middle|lower|outside_upper|outside_lower", "squeeze": true_or_false, "expanding": true_or_false },
    "stochastic": { "visible": true_or_false, "value": number_0_to_100_or_null, "zone": "oversold|neutral|overbought", "cross": "bullish|bearish|none" },
    "volume": { "visible": true_or_false, "trend": "increasing|decreasing|average", "aboveAverage": true_or_false, "divergence": "bullish|bearish|none" },
    "vwap": { "visible": true_or_false, "priceAbove": true_or_false },
    "ichimoku": { "visible": true_or_false, "priceAboveCloud": true_or_false, "tkCross": "bullish|bearish|none", "kumoColor": "bullish|bearish" },
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
    "orderBlock": { "present": true_or_false, "type": "bullish|bearish|none", "priceNear": true_or_false },
    "fvg": { "present": true_or_false, "type": "bullish|bearish|none", "filled": true_or_false },
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
