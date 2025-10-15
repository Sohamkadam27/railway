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
// Fetch all assets
// ----------------------------
router.get('/assets', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM rail_tms_db ORDER BY uid DESC');
  res.status(200).json(rows);
}));

// ----------------------------
// GET /api/assets/:uid
// Fetch single asset + analysis
// ----------------------------
router.get('/assets/:uid', asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: 'Asset UID is required' });

  const [rows] = await pool.query('SELECT * FROM rail_tms_db WHERE uid = ?', [uid]);
  if (rows.length === 0) return res.status(404).json({ error: 'Asset not found' });

  const item = rows[0];

  // Fetch analysis and reports
  const assemblyRemark = analysisService.generateAssemblyRemark(item);
  const lotStatusSummary = await analysisService.getVendorLotStatusSummary(item.vendor_name);
  const vendorReport = await analysisService.getVendorContext(item.vendor_name);
  const assetTypeReport = await analysisService.getAssetTypeContext(item.asset_type);

  res.status(200).json({ item, assemblyRemark, lotStatusSummary, vendorReport, assetTypeReport });
}));

// ----------------------------
// POST /api/assets/:uid
// Update asset details
// ----------------------------
router.post('/assets/:uid', asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { condition_lot, remarks, last_inspection, latitude, longitude } = req.body;

  if (!condition_lot) return res.status(400).json({ error: 'condition_lot field is required' });

  const inspectionDateForDb = last_inspection || null;

  const sql = `
    UPDATE rail_tms_db
    SET condition_lot = ?, remarks = ?, last_inspection = ?, latitude = ?, longitude = ?
    WHERE uid = ?
  `;
  await pool.query(sql, [condition_lot, remarks, inspectionDateForDb, latitude || null, longitude || null, uid]);

  const [updatedRows] = await pool.query('SELECT * FROM rail_tms_db WHERE uid = ?', [uid]);
  res.status(200).json({ success: true, item: updatedRows[0] });
}));

// ----------------------------
// GET /api/dashboard
// Dashboard statistics summary
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
// Vendor aggregated report
// ----------------------------
router.get('/vendors', asyncHandler(async (req, res) => {
  const data = await analysisService.generateVendorReport();
  res.status(200).json(data);
}));

// ----------------------------
// GET /api/inventory
// Inventory breakdown
// ----------------------------
router.get('/inventory', asyncHandler(async (req, res) => {
  const data = await analysisService.generateInventoryReport();
  res.status(200).json(data);
}));

// ----------------------------
// Global API error handler
// ----------------------------
router.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

module.exports = router;
