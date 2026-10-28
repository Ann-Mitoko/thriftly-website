
const express = require('express');
const router = express.Router();

async function callPartner(path, query, res) {
  const base = process.env.PARTNER_URL;        // e.g. https://pharmalink-iap-production.up.railway.app
  const key = process.env.PARTNER_API_KEY;     // TODO(TEAM3): empty. Team 3's README has no API key yet (only a login token for stock edits)

  if (!base) {
    return res.status(500).json({ error: 'not_configured', message: 'PARTNER_URL is not set in .env' });
  }

  const url = new URL(base.replace(/\/$/, '') + path);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v);
  }

  const headers = {};
  if (key) headers['X-API-Key'] = key;         // TODO(TEAM3): header name is a GUESS (from our Week 9 handout). Use the name Team 3 gives us.

  try {
    const r = await fetch(url, { headers });
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.text()).slice(0, 200); } catch (e) { /* ignore */ }
      console.error('partner returned', r.status, 'for', path, '-', detail);   // never log the key

      if (r.status === 400) {                  // Team 3 rejected our input: relay their message
        let msg = 'Invalid request';
        try { msg = JSON.parse(detail).message || msg; } catch (e) { /* not JSON */ }
        return res.status(400).json({ error: 'bad_request', message: msg });
      }
      return res.status(502).json({ error: 'partner_error', message: 'Health services data is unavailable right now' });
    }
    return res.json(await r.json());
  } catch (err) {
    // ECONNREFUSED = nothing listening, ENOTFOUND = wrong hostname
    console.error('partner call failed:', err.cause?.code || err.message);
    return res.status(502).json({ error: 'partner_unavailable', message: 'Health services data is unavailable right now' });
  }
}

// GET /health-services/health  -> /api/health
router.get('/health', (req, res) => callPartner('/api/health', {}, res));

// GET /health-services/pharmacies?verified=&lat=&lng=  -> /api/pharmacies
router.get('/pharmacies', (req, res) =>
  callPartner('/api/pharmacies', { verified: req.query.verified, lat: req.query.lat, lng: req.query.lng }, res));

// GET /health-services/inventory?pharmacy_id=1  -> /api/inventory   (pharmacy_id is required by Team 3)
router.get('/inventory', (req, res) =>
  callPartner('/api/inventory', { pharmacy_id: req.query.pharmacy_id }, res));

// GET /health-services/stock-search?medicine=&location=&lat=&lng=  -> /api/stock/search
// Team 3 requires BOTH medicine and location, and lat + lng together or not at all.
router.get('/stock-search', (req, res) =>
  callPartner('/api/stock/search', {
    medicine: req.query.medicine, location: req.query.location, lat: req.query.lat, lng: req.query.lng
  }, res));

module.exports = router;