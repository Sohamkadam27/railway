// routes/api.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const analysisService = require('../services/analysisService');

// Utility to handle async errors
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ----------------------------
// GET /api/assets
// ----------------------------
router.get('/assets', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM rail_tms_db ORDER BY uid DESC');
  res.status(200).json(rows);
}));

// ----------------------------
// GET /api/assets/:uid
// ----------------------------
router.get('/assets/:uid', asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: 'Asset UID is required' });

  const [rows] = await pool.query('SELECT * FROM rail_tms_db WHERE uid = ?', [uid]);
  if (rows.length === 0) return res.status(404).json({ error: 'Asset not found' });

  const item = rows[0];

  // --- Fetch analysis and reports safely ---
  const assemblyRemark = analysisService.generateAssemblyRemark(item);

  // ✅ fallback to [] or {}
  const vendorReport = (await analysisService.getVendorContext(item.vendor_name)) || [];
  const inventoryReport = (await analysisService.getAssetTypeContext(item.asset_type)) || [];

  // --- If vendorReport empty, try fetching vendor-wide summary ---
  if (vendorReport.length === 0 && item.vendor_name) {
    const [vendorRows] = await pool.query(
      `SELECT vendor_name,
              COUNT(*) AS total_assets,
              SUM(CASE WHEN condition_lot = 'Good' THEN 1 ELSE 0 END) AS good_condition,
              SUM(CASE WHEN condition_lot = 'Needs Repair' THEN 1 ELSE 0 END) AS needs_repair
       FROM rail_tms_db
       WHERE vendor_name = ?
       GROUP BY vendor_name`, [item.vendor_name]
    );
    if (vendorRows.length > 0) vendorReport.push(vendorRows[0]);
  }

  // --- If inventoryReport empty, build one dynamically ---
  if (inventoryReport.length === 0) {
    const [invRows] = await pool.query(
      `SELECT asset_type, COUNT(*) AS total_units
       FROM rail_tms_db
       GROUP BY asset_type`
    );
    if (invRows.length > 0) inventoryReport.push(...invRows);
  }

  res.status(200).json({
    item,
    assemblyRemark,
    vendorReport,
    inventoryReport,
  });
}));

// ----------------------------
// POST /api/assets/:uid
// ----------------------------
router.post('/assets/:uid', asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { condition_lot, remarks, last_inspection, latitude, longitude } = req.body;

  if (!condition_lot) return res.status(400).json({ error: 'condition_lot field is required' });

  const sql = `
    UPDATE rail_tms_db
    SET condition_lot = ?, remarks = ?, last_inspection = ?, latitude = ?, longitude = ?
    WHERE uid = ?
  `;
  await pool.query(sql, [
    condition_lot,
    remarks || null,
    last_inspection || null,
    latitude || null,
    longitude || null,
    uid,
  ]);

  const [updatedRows] = await pool.query('SELECT * FROM rail_tms_db WHERE uid = ?', [uid]);
  res.status(200).json({ success: true, item: updatedRows[0] });
}));

// ----------------------------
// GET /api/dashboard
// ----------------------------
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [assets] = await pool.query('SELECT condition_lot, warranty_expiry FROM rail_tms_db');
  const total = assets.length;
  const good = assets.filter(a => a.condition_lot === 'Good').length;
  const needsRepair = assets.filter(a => a.condition_lot === 'Needs Repair').length;

  const now = new Date();
  const next30 = new Date();
  next30.setDate(now.getDate() + 30);

  const soonExpiring = assets.filter(a => {
    if (!a.warranty_expiry) return false;
    const expiryDate = new Date(a.warranty_expiry);
    return expiryDate > now && expiryDate <= next30;
  }).length;

  res.status(200).json({ total, good, needsRepair, soonExpiring });
}));

// ----------------------------
// GET /api/vendors
// ----------------------------
router.get('/vendors', asyncHandler(async (req, res) => {
  const data = await analysisService.generateVendorReport();
  res.status(200).json(data || []);
}));

// ----------------------------
// GET /api/inventory
// ----------------------------
router.get('/inventory', asyncHandler(async (req, res) => {
  const data = await analysisService.generateInventoryReport();
  res.status(200).json(data || []);
}));

// ----------------------------
// Global error handler
// ----------------------------
router.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = router;
