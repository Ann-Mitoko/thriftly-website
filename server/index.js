const express = require('express');
const cors = require('cors');
require('dotenv').config();

   const { requireApiKey, rateLimit, loadKeys } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerUi = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const spec = YAML.load(path.join(__dirname, '..', './openapi.yaml'));




app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

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
