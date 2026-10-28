
function loadKeys() {
  const map = new Map();   // key -> consumer name
  (process.env.API_KEYS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(pair => {
      const i = pair.indexOf(':');
      const name = i > 0 ? pair.slice(0, i) : 'consumer';
      const key = i > 0 ? pair.slice(i + 1) : pair;
      if (key) map.set(key, name);
    });
  return map;
}

// 401 = "I don't know who you are". No valid key, and the route never runs.
function requireApiKey(req, res, next) {
  const key = req.get('X-API-Key');
  const keys = loadKeys();
  if (!key || !keys.has(key)) {
    return res.status(401).json({ error: 'unauthorized', message: 'Missing or invalid API key' });
  }
  req.apiKey = key;
  req.consumer = keys.get(key);
  next();
}

// Counts requests per key 
function rateLimit({ windowMs, max }) {
  const hits = new Map();   
  return (req, res, next) => {
    const id = req.apiKey || req.ip;
    const now = Date.now();
    let entry = hits.get(id);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(id, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'rate_limited', message: 'Too many requests', retryAfter });
    }
    next();
  };
}

module.exports = { requireApiKey, rateLimit, loadKeys };