const express = require('express');
const router = express.Router();
const { fetchWithRetry } = require('../resilientFetch');

// In-memory cache for graceful fallback when the partner is slow or down
let lastGood = null;

async function callPartner(path, query, res) {
  const base = process.env.PARTNER_URL;
  const key = process.env.PARTNER_API_KEY;

  if (!base) {
    return res.status(500).json({ error: 'not_configured', message: 'PARTNER_URL is not set in .env' });
  }

  const url = new URL(base.replace(/\/$/, '') + path);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v);
  }

  const headers = {};
  if (key) headers['X-API-Key'] = key;

  try {
    const r = await fetchWithRetry(url.toString(), { headers });
    
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.text()).slice(0, 200); } catch (e) { /* ignore */ }
      console.error('partner returned', r.status, 'for', path, '-', detail);

      if (r.status === 400) {
        let msg = 'Invalid request';
        try { msg = JSON.parse(detail).message || msg; } catch (e) { /* not JSON */ }
        return res.status(400).json({ error: 'bad_request', message: msg });
      }

      // If the partner returned a 5xx error, check if we have last known good data to fallback to
      if (lastGood) {
        console.warn('Partner error encountered. Serving stale cached data.');
        return res.json({ data: lastGood.data, stale: true, asof: lastGood.asof });
      }

      return res.status(502).json({ error: 'partner_error', message: 'Health services data is unavailable right now' });
    }

    // Successfully fetched live data
    const freshData = await r.json();
    
    // Save successful response to memory with a timestamp[cite: 6, 7]
    lastGood = { data: freshData, asof: new Date().toISOString() };

    // Return live data response object with stale flag[cite: 7]
    return res.json({ data: freshData, stale: false, asof: lastGood.asof });

  } catch (err) {
    console.error('partner call failed:', err.cause?.code || err.message);

    // If fetch failed completely (timeout, connection refused), fallback to last good data if available[cite: 7]
    if (lastGood) {
      console.warn('Partner unreachable. Serving stale cached data.');
      return res.json({ data: lastGood.data, stale: true, asof: lastGood.asof });
    }

    return res.status(502).json({ error: 'partner_unavailable', message: 'Health services data is unavailable right now' });
  }
}

// GET /health-services/health  -> /api/health
router.get('/health', (req, res) => callPartner('/health', {}, res));

// GET /health-services/pharmacies?verified=&lat=&lng=  -> /api/pharmacies
router.get('/pharmacies', (req, res) =>
  callPartner('/api/pharmacies', { verified: req.query.verified, lat: req.query.lat, lng: req.query.lng }, res));

// GET /health-services/inventory?pharmacy_id=1  -> /api/inventory   (pharmacy_id is required by Team 3)
router.get('/inventory', (req, res) =>
  callPartner('/api/inventory', { pharmacy_id: req.query.pharmacy_id }, res));

// GET /health-services/stock-search?medicine=&location=&lat=&lng=  -> /api/stock/search
router.get('/stock-search', (req, res) => {
  console.log("INCOMING SEARCH QUERY:", req.query);
  callPartner('/stock/search', {
  medicine: req.query.medicine, location: req.query.location, lat: req.query.lat, lng: req.query.lng
}, res)
  });

module.exports = router;