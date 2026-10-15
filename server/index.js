const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerUi = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const spec = YAML.load(path.join(__dirname, '..', './openapi.yaml'));

const path = require('path');


app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/vendors', require('./routes/vendors'));
app.use('/products', require('./routes/products'));
app.use('/purchases', require('./routes/purchases'));

app.listen(PORT, '0.0.0.0',() => {
 console.log('Server is running on port ' + PORT);
});
