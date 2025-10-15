// services/analysisService.js
// All data analysis and "AI" logic functions.
const pool = require('../db');

const generateVendorReport = async () => {
  const [data] = await pool.query(`SELECT vendor_name, COUNT(uid) as total_assets, SUM(CASE WHEN condition_lot = 'Good' THEN 1 ELSE 0 END) as good_condition, SUM(CASE WHEN condition_lot = 'Needs Repair' THEN 1 ELSE 0 END) as needs_repair FROM rail_tms_db WHERE vendor_name IS NOT NULL AND vendor_name != '' GROUP BY vendor_name ORDER BY total_assets DESC;`);
  return data;
};

const generateInventoryReport = async () => {
  const [data] = await pool.query(`SELECT asset_type, COUNT(uid) as total_units, AVG(DATEDIFF(warranty_expiry, CURDATE())) as avg_days_left_warranty FROM rail_tms_db WHERE asset_type IS NOT NULL AND asset_type != '' GROUP BY asset_type ORDER BY total_units DESC;`);
  return data;
};

const getVendorContext = async (vendorName) => {
  if (!vendorName) return null;
  const [data] = await pool.query(`SELECT COUNT(uid) as total_assets, SUM(CASE WHEN condition_lot = 'Good' THEN 1 ELSE 0 END) as good_condition, SUM(CASE WHEN condition_lot = 'Needs Repair' THEN 1 ELSE 0 END) as needs_repair FROM rail_tms_db WHERE vendor_name = ?;`, [vendorName]);
  return data[0];
};

const getAssetTypeContext = async (assetType) => {
  if (!assetType) return null;
  const [data] = await pool.query(`SELECT COUNT(uid) as total_units, AVG(DATEDIFF(warranty_expiry, CURDATE())) as avg_days_left_warranty FROM rail_tms_db WHERE asset_type = ?;`, [assetType]);
  return data[0];
};

const generateAssemblyRemark = (item) => {
  if (item.condition_lot === 'Need Replacement') {
    return { remark: '❌ Not Ready for Assembly', reason: `Asset condition is 'Need Replacement'.`, status: 'fail' };
  }
  if (item.warranty_expiry && new Date(item.warranty_expiry) < new Date()) {
    return { remark: '❌ Not Ready for Assembly', reason: 'The warranty period has expired.', status: 'fail' };
  }
  if (item.remarks) {
    const remarkText = item.remarks.toLowerCase();
    if (['crack', 'rust observed', 'damage'].some(keyword => remarkText.includes(keyword))) {
      return { remark: '⚠️ Inspection is Needed', reason: `Remark contains a potential issue: "${item.remarks}"`, status: 'warning' };
    }
  }
  if (item.condition_lot === 'Good' || item.condition_lot === 'Fair') {
    return { remark: '✅ OK to Assemble', reason: 'Asset condition is acceptable and meets all checks.', status: 'ok' };
  }
  return { remark: '⚠️ Inspection is Needed', reason: `Asset condition '${item.condition_lot}' requires manual review.`, status: 'warning' };
};

const getVendorLotStatusSummary = async (vendorName) => {
  if (!vendorName) return null;
  const [items] = await pool.query('SELECT * FROM rail_tms_db WHERE vendor_name = ?', [vendorName]);
  if (items.length === 0) return null;
  return items.reduce((acc, item) => {
    const { status } = generateAssemblyRemark(item);
    if (status === 'ok') acc.ready++;
    else acc.notReady++;
    return acc;
  }, { ready: 0, notReady: 0 });
};

module.exports = {
  generateVendorReport,
  generateInventoryReport,
  getVendorContext,
  getAssetTypeContext,
  generateAssemblyRemark,
  getVendorLotStatusSummary,
};