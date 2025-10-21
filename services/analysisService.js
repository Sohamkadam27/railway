// services/analysisService.js
// Handles data analysis and "AI logic" for asset insights

const pool = require('../db');

// ----------------------------
// Vendor Report (All Vendors)
// ----------------------------
const generateVendorReport = async () => {
  try {
    const [data] = await pool.query(`
      SELECT 
        vendor_name,
        COUNT(uid) AS total_assets,
        SUM(CASE WHEN condition_lot = 'Good' THEN 1 ELSE 0 END) AS good_condition,
        SUM(CASE WHEN condition_lot = 'Needs Repair' THEN 1 ELSE 0 END) AS needs_repair
      FROM rail_tms_db
      WHERE vendor_name IS NOT NULL AND vendor_name != ''
      GROUP BY vendor_name
      ORDER BY total_assets DESC;
    `);

    if (!data || data.length === 0) {
      console.warn("⚠️ No vendor data found in database.");
      return [];
    }

    return data;
  } catch (err) {
    console.error("❌ Error in generateVendorReport:", err);
    return [];
  }
};

// ----------------------------
// Inventory Report (All Asset Types)
// ----------------------------
const generateInventoryReport = async () => {
  try {
    const [data] = await pool.query(`
      SELECT 
        asset_type,
        COUNT(uid) AS total_units,
        AVG(DATEDIFF(warranty_expiry, CURDATE())) AS avg_days_left_warranty
      FROM rail_tms_db
      WHERE asset_type IS NOT NULL AND asset_type != ''
      GROUP BY asset_type
      ORDER BY total_units DESC;
    `);

    if (!data || data.length === 0) {
      console.warn("⚠️ No inventory data found in database.");
      return [];
    }

    return data;
  } catch (err) {
    console.error("❌ Error in generateInventoryReport:", err);
    return [];
  }
};

// ----------------------------
// Vendor Context (Single Vendor Summary)
// ----------------------------
const getVendorContext = async (vendorName) => {
  try {
    if (!vendorName) return [];

    const [data] = await pool.query(`
      SELECT 
        vendor_name,
        COUNT(uid) AS total_assets,
        SUM(CASE WHEN condition_lot = 'Good' THEN 1 ELSE 0 END) AS good_condition,
        SUM(CASE WHEN condition_lot = 'Needs Repair' THEN 1 ELSE 0 END) AS needs_repair
      FROM rail_tms_db
      WHERE vendor_name = ?
      GROUP BY vendor_name;
    `, [vendorName]);

    if (!data || data.length === 0) {
      console.warn(`⚠️ No vendor context found for: ${vendorName}`);
      return [];
    }

    return data; // always an array
  } catch (err) {
    console.error("❌ Error in getVendorContext:", err);
    return [];
  }
};

// ----------------------------
// Asset Type Context (Inventory Summary by Type)
// ----------------------------
const getAssetTypeContext = async (assetType) => {
  try {
    if (!assetType) return [];

    const [data] = await pool.query(`
      SELECT 
        asset_type,
        COUNT(uid) AS total_units,
        AVG(DATEDIFF(warranty_expiry, CURDATE())) AS avg_days_left_warranty
      FROM rail_tms_db
      WHERE asset_type = ?
      GROUP BY asset_type;
    `, [assetType]);

    if (!data || data.length === 0) {
      console.warn(`⚠️ No asset type context found for: ${assetType}`);
      return [];
    }

    return data; // always an array
  } catch (err) {
    console.error("❌ Error in getAssetTypeContext:", err);
    return [];
  }
};

// ----------------------------
// Assembly Remark Logic
// ----------------------------
const generateAssemblyRemark = (item) => {
  if (!item)
    return { remark: '⚠️ No Data', reason: 'Item not found', status: 'warning' };

  if (item.condition_lot === 'Need Replacement') {
    return {
      remark: '❌ Not Ready for Assembly',
      reason: `Asset condition is 'Need Replacement'.`,
      status: 'fail',
    };
  }

  if (item.warranty_expiry && new Date(item.warranty_expiry) < new Date()) {
    return {
      remark: '❌ Not Ready for Assembly',
      reason: 'Warranty has expired.',
      status: 'fail',
    };
  }

  if (item.remarks) {
    const remarkText = item.remarks.toLowerCase();
    if (['crack', 'rust', 'damage'].some((keyword) => remarkText.includes(keyword))) {
      return {
        remark: '⚠️ Inspection Needed',
        reason: `Remark indicates issue: "${item.remarks}"`,
        status: 'warning',
      };
    }
  }

  if (['Good', 'Fair'].includes(item.condition_lot)) {
    return {
      remark: '✅ OK to Assemble',
      reason: 'Condition acceptable and checks passed.',
      status: 'ok',
    };
  }

  return {
    remark: '⚠️ Inspection Needed',
    reason: `Condition '${item.condition_lot}' needs review.`,
    status: 'warning',
  };
};

// ----------------------------
// Vendor Lot Status Summary
// ----------------------------
const getVendorLotStatusSummary = async (vendorName) => {
  try {
    if (!vendorName) return { ready: 0, notReady: 0 };

    const [items] = await pool.query(
      'SELECT * FROM rail_tms_db WHERE vendor_name = ?',
      [vendorName]
    );

    if (!items || items.length === 0) {
      console.warn(`⚠️ No items found for vendor: ${vendorName}`);
      return { ready: 0, notReady: 0 };
    }

    return items.reduce(
      (acc, item) => {
        const { status } = generateAssemblyRemark(item);
        if (status === 'ok') acc.ready++;
        else acc.notReady++;
        return acc;
      },
      { ready: 0, notReady: 0 }
    );
  } catch (err) {
    console.error("❌ Error in getVendorLotStatusSummary:", err);
    return { ready: 0, notReady: 0 };
  }
};

// ----------------------------
// Exports
// ----------------------------
module.exports = {
  generateVendorReport,
  generateInventoryReport,
  getVendorContext,
  getAssetTypeContext,
  generateAssemblyRemark,
  getVendorLotStatusSummary,
};
