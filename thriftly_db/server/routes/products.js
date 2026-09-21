const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /products
router.get('/', async (req, res) => {
  try {
    const where = [];
    const params = [];

    if (req.query.vendorId) {
      where.push('p.vendor_id = ?');
      params.push(req.query.vendorId);
    }
    if (req.query.category) {
      where.push('c.name = ?');
      params.push(req.query.category);
    }

    let sql = `
      SELECT
        p.product_id AS id,
        p.vendor_id AS vendorId,
        p.name AS name,
        c.name AS category,
        p.price AS price,
        p.quantity_available AS quantityAvailable
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
    `;
    if (where.length > 0) {
      sql += ' WHERE ' + where.join(' AND ');
    }
    sql += ' ORDER BY p.name ASC';

    const [rows] = await db.query(sql, params);

    const products = rows.map(r => ({
      id: r.id,
      vendorId: r.vendorId,
      name: r.name,
      category: r.category,
      price: parseFloat(r.price),
      currency: 'KES',
      quantityAvailable: r.quantityAvailable
    }));

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.product_id AS id,
        p.vendor_id AS vendorId,
        p.name AS name,
        c.name AS category,
        p.price AS price,
        p.quantity_available AS quantityAvailable
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No product found with the given id' });
    }

    const r = rows[0];
    res.json({
      id: r.id,
      vendorId: r.vendorId,
      name: r.name,
      category: r.category,
      price: parseFloat(r.price),
      currency: 'KES',
      quantityAvailable: r.quantityAvailable
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;