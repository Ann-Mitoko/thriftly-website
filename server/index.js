const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { monitor } = require('./monitoring');

   const { requireApiKey, rateLimit, loadKeys } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerUi = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const spec = YAML.load(path.join(__dirname, '..', './openapi.yaml'));



let lastGood = null; // Stores { data, asof } in memory

app.get('/api/stock/search', async (req, res) => {
  try {
    const r = await fetchWithRetry(`${PARTNER_URL}/stock/search`, {}, { timeoutMs: 1500, retries: 2, delayMs: 200 });
    
    if (!r.ok) throw new Error(`Partner returned ${r.status}`);
    
    const data = await r.json();
    
    // Save successful data to memory
    lastGood = { data, asof: new Date().toISOString() };
    return res.json({ data, stale: false, asof: lastGood.asof });

  } catch (err) {
    const reason = err.name === 'TimeoutError' ? 'timeout' : (err.cause?.code || err.message);
    console.error('Partner call failed:', reason);

    // If we have saved data, return it as stale!
    if (lastGood) {
      return res.json({ data: lastGood.data, stale: true, asof: lastGood.asof });
    }

    // If no data was ever saved, return a clean friendly message
    return res.status(502).json({ message: 'Partner data unavailable right now' });
  }
});


app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.use(monitor);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});


   console.log('API keys loaded:', loadKeys().size);   

   const apiLimiter = rateLimit({ windowMs: 60000, max: 60 });
   app.use('/vendors', requireApiKey, apiLimiter, require('./routes/vendors'));
   app.use('/products', requireApiKey, apiLimiter, require('./routes/products'));
   app.use('/purchases', requireApiKey, apiLimiter, require('./routes/purchases'));
   app.use('/health-services', rateLimit({ windowMs: 60000, max: 30 }), require('./routes/healthServices'));

app.listen(PORT, '0.0.0.0',() => {
 console.log('Server is running on port ' + PORT);
});


   app.use((err, req, res, next) => {
     console.error(err);
     const bad = err.status === 400;
     res.status(bad ? 400 : 500).json({ error: bad ? 'bad_request' : 'server_error', message: bad ? 'Invalid JSON body' : 'Server error' });
   });