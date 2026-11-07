const express = require('express');
const app = express();
let mode = 'ok'; // ok | slow | flaky | error
let calls = 0;

const tasks = [
  { id: 1, title: 'Write README', dueDate: '2026-11-02', status: 'active' },
  { id: 2, title: 'Ship v1', dueDate: '2026-11-09', status: 'active' },
];

const healthStatus = { status: 'healthy', timestamp: new Date().toISOString() };

// Original pharmacies preserved, with locations and details added
const pharmaciesList = [
  { id: 1, name: 'City Central Pharmacy', location: 'Nairobi CBD', verified: true },
  { id: 2, name: 'HealthPlus Chemist', location: 'Westlands', verified: true }
];

// Expanded stock search data with prices, locations, and categories included
const stockSearchData = [
  { id: 1, medicine: 'Paracetamol', location: 'Nairobi CBD', pharmacy_id: 1, price: 150, stock: 50 },
  { id: 2, medicine: 'Amoxicillin', location: 'Nairobi CBD', pharmacy_id: 1, price: 450, stock: 20 },
  { id: 3, medicine: 'Ibuprofen', location: 'Westlands', pharmacy_id: 2, price: 250, stock: 35 },
  { id: 4, medicine: 'Bandages', location: 'Nairobi CBD', pharmacy_id: 1, price: 100, stock: 100 }
];

// Expanded inventory data with item prices and categories
const inventoryData = [
  { id: 1, pharmacy_id: 1, name: 'Paracetamol 500mg', item: 'Paracetamol 500mg', medicine: 'Paracetamol', category: 'Analgesic', price: 150, quantity: 50 },
  { id: 2, pharmacy_id: 1, name: 'Amoxicillin 250mg', item: 'Amoxicillin 250mg', medicine: 'Amoxicillin', category: 'Antibiotic', price: 450, quantity: 20 },
  { id: 3, pharmacy_id: 1, name: 'Bandages', item: 'Bandages', medicine: 'Bandages', category: 'First Aid', price: 100, quantity: 100 },
  { id: 4, pharmacy_id: 2, name: 'Ibuprofen 400mg', item: 'Ibuprofen 400mg', medicine: 'Ibuprofen', category: 'Anti-inflammatory', price: 250, quantity: 35 }
];

// Mode switching route
app.get('/_mode/:m', (req, res) => {
  mode = req.params.m;
  calls = 0;
  res.json({ mode });
});

// Helper logic for simulated latency, flaky errors, and total failures
async function handlePartnerRequest(req, res, data) {
  calls += 1;
  console.log(`GET ${req.path} (call ${calls}), mode ${mode}`);

  if (mode === 'slow') {
    await new Promise(r => setTimeout(r, 10000));
  }

  if (mode === 'flaky' && calls % 3 !== 0) {
    return res.status(503).json({ message: 'Try again' });
  }

  if (mode === 'error') {
    return res.status(500).json({ message: 'Internal error' });
  }

  res.json(data);
}

// Basic routes (supporting both root and /api prefixes)
app.get('/tasks', (req, res) => handlePartnerRequest(req, res, tasks));
app.get('/api/tasks', (req, res) => handlePartnerRequest(req, res, tasks));

app.get('/health', (req, res) => handlePartnerRequest(req, res, healthStatus));
app.get('/api/health', (req, res) => handlePartnerRequest(req, res, healthStatus));

app.get('/pharmacies', (req, res) => handlePartnerRequest(req, res, pharmaciesList));
app.get('/api/pharmacies', (req, res) => handlePartnerRequest(req, res, pharmaciesList));

// Filter-supported stock search route with price and location support
const handleStockSearch = (req, res) => {
  const { medicine, location } = req.query;
  let results = stockSearchData;
  if (medicine) {
    results = results.filter(item => item.medicine.toLowerCase().includes(medicine.toLowerCase()));
  }
  if (location) {
    results = results.filter(item => item.location.toLowerCase().includes(location.toLowerCase()));
  }
  handlePartnerRequest(req, res, results);
};
app.get('/stock/search', handleStockSearch);
app.get('/api/stock/search', handleStockSearch);

// Filter-supported inventory route with prices included
const handleInventory = (req, res) => {
  const { pharmacy_id } = req.query;
  let results = inventoryData;
  if (pharmacy_id) {
    results = results.filter(item => item.pharmacy_id == pharmacy_id);
  }
  handlePartnerRequest(req, res, results);
};
app.get('/inventory', handleInventory);
app.get('/api/inventory', handleInventory);

app.listen(4000, () => console.log('Stand-in partner on http://localhost:4000'));