const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/vendors', require('./routes/vendors'));
app.use('/products', require('./routes/products'));
app.use('/purchases', require('./routes/purchases'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
