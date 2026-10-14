const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');

const API_TOKEN = "thriftly-dev-token-2026"; // placeholder shared secret — see CONTRACT_DEVIATIONS.md

function isAuthorized(req) {
  const match = (req.headers['authorization'] || '').match(/^Bearer\s+(.+)$/);
  return Boolean(match) && match[1] === API_TOKEN;
}

// GET /purchases  — purchase history, optionally filtered
router.get('/', async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized', message: 'Bearer token missing or invalid' });
  }

  const bad = message => res.status(400).json({ error: 'invalid_request', message });
  const where = [];
  const params = [];

  for (const [qs, col] of [['vendorId', 'pu.vendor_id'], ['productId', 'pu.product_id']]) {
    if (req.query[qs] !== undefined) {
      if (!/^\d+$/.test(req.query[qs])) return bad(`${qs} must be an integer`);
      where.push(`${col} = ?`);
      params.push(Number(req.query[qs]));
    }
  }
  for (const [qs, op] of [['from', '>='], ['to', '<=']]) {
    if (req.query[qs] !== undefined) {
      const d = new Date(req.query[qs]);
      if (isNaN(d.getTime())) return bad(`${qs} must be a valid date or date-time`);
      where.push(`pu.created_at ${op} ?`);
      params.push(d);
    }
  }

  try {
    const [rows] = await db.query(`
      SELECT pu.purchase_id, pu.reference_number, pu.vendor_id, pu.product_id,
             p.name AS product_name, p.brand AS brand, pu.quantity,
             ROUND(pu.total_amount / pu.quantity, 2) AS unit_price,
             pu.total_amount, pu.currency, pu.status, pu.created_at
      FROM purchases pu
      JOIN products p ON pu.product_id = p.product_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY pu.created_at DESC, pu.purchase_id DESC
    `, params);

    res.json(rows.map(r => ({
      id: String(r.purchase_id),
      referenceNumber: r.reference_number,
      vendorId: r.vendor_id,
      productId: r.product_id,
      productName: r.product_name,
      brand: r.brand,
      quantity: r.quantity,
      unitPrice: parseFloat(r.unit_price),
      totalAmount: parseFloat(r.total_amount),
      currency: r.currency,
      status: r.status,
      createdAt: new Date(r.created_at).toISOString()
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch purchases' });
  }
});

// POST /purchases
router.post('/', async (req, res) => {
  // --- Auth check first ---
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized', message: 'Bearer token missing or invalid' });
  }

  const body = req.body;

  // --- Validation: required fields present ---
  const required = ['vendorId', 'productId', 'quantity', 'totalAmount', 'currency'];
  for (const field of required) {
    if (!(field in body)) {
      return res.status(400).json({ error: 'invalid_request', message: `${field} is required` });
    }
  }

  const { vendorId, productId, quantity, totalAmount, currency } = body;

  // --- Validation: correct types ---
  if (!Number.isInteger(vendorId)) {
    return res.status(400).json({ error: 'invalid_request', message: 'vendorId must be an integer' });
  }
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'invalid_request', message: 'productId must be an integer' });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'invalid_request', message: 'quantity must be a positive integer' });
  }
  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({ error: 'invalid_request', message: 'totalAmount must be a positive number' });
  }
  if (typeof currency !== 'string' || currency.trim() === '') {
    return res.status(400).json({ error: 'invalid_request', message: 'currency must be a non-empty string' });
  }

  try {
    // --- Validation: does the vendor exist? ---
    const [vendorRows] = await db.query('SELECT vendor_id FROM vendors WHERE vendor_id = ?', [vendorId]);
    if (vendorRows.length === 0) {
      return res.status(404).json({ error: 'not_found', message: 'No vendor found with the given vendorId' });
    }

    // --- Validation: does the product exist for this vendor? ---
    const [productRows] = await db.query(
      'SELECT quantity_available FROM products WHERE product_id = ? AND vendor_id = ?',
      [productId, vendorId]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ error: 'not_found', message: 'No product found with the given productId for this vendor' });
    }

    const availableStock = productRows[0].quantity_available;
    if (quantity > availableStock) {
      return res.status(400).json({ error: 'invalid_request', message: 'quantity exceeds available stock' });
    }

    // --- All checks passed: perform the real write ---
    const referenceNumber = 'THR-PC-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const [insertResult] = await db.query(
      `INSERT INTO purchases (reference_number, vendor_id, product_id, quantity, total_amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [referenceNumber, vendorId, productId, quantity, totalAmount, currency]
    );

    // Decrement stock — a real state change, not just a logged row
    await db.query(
      'UPDATE products SET quantity_available = quantity_available - ? WHERE product_id = ?',
      [quantity, productId]
    );

    // --- Return the confirmation, shaped exactly to the contract's schema ---
    res.status(201).json({
      id: String(insertResult.insertId),
      referenceNumber,
      vendorId,
      productId,
      quantity,
      totalAmount,
      currency,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
