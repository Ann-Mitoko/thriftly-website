// Placeholder authentication shared by every protected route.
// A single shared token, NOT real login. See CONTRACT_DEVIATIONS.md entry 5.
const API_TOKEN = 'thriftly-dev-token-2026';

function isAuthorized(req) {
  const match = (req.headers['authorization'] || '').match(/^Bearer\s+(.+)$/);
  return Boolean(match) && match[1] === API_TOKEN;
}

function requireAuth(req, res, next) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized', message: 'Bearer token missing or invalid' });
  }
  next();
}

module.exports = { API_TOKEN, isAuthorized, requireAuth };
