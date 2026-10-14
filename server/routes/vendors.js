const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.vendor_id AS id, v.name AS name, c.name AS category, m.name AS market, v.description AS description,
             v.phone AS phone, v.email AS email, v.status AS status
      FROM vendors v
      JOIN categories c ON v.category_id = c.category_id
      JOIN markets m ON v.market_id = m.market_id
      WHERE v.status = 'verified'
      ORDER BY v.name ASC
    `);
    res.json(rows.map(r => ({ id: r.id, name: r.name, category: r.category, market: r.market, description: r.description,
      phone: r.phone, email: r.email, verified: r.status === 'verified' })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch vendors' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.vendor_id AS id, v.name AS name, c.name AS category, m.name AS market, v.description AS description,
             v.phone AS phone, v.email AS email, v.status AS status
      FROM vendors v
      JOIN categories c ON v.category_id = c.category_id
      JOIN markets m ON v.market_id = m.market_id
      WHERE v.vendor_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found', message: 'No vendor found with the given id' });
    const r = rows[0];
    res.json({ id: r.id, name: r.name, category: r.category, market: r.market, description: r.description,
      phone: r.phone, email: r.email, verified: r.status === 'verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch vendor' });
  }
});

module.exports = router;
