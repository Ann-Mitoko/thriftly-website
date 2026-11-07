// Placeholder authentication shared by every protected route.
const API_TOKEN = process.env.API_KEY || 'thrifty-dev-token-2026';

function isAuthorized(req) {
  // Support both X-API-Key (required for Week 12 monitoring) and Bearer tokens
  const apiKey = req.headers['x-api-key'] || (req.headers['authorization'] || '').replace(/^Bearer\s+/, '');
  
  // CRITICAL: Attach to req.apiKey so monitoring.js can generate the caller label
  req.apiKey = apiKey; 

  return apiKey === API_TOKEN;
}

function requireAuth(req, res, next) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or missing API key' });
  }
  next();
}

module.exports = { API_TOKEN, isAuthorized, requireAuth };