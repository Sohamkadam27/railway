const pool = require('../db');
const ASSET_TABLE = process.env.ASSET_TABLE_NAME || 'rail_tms_db';

exports.getAssets = async (req, res) => {
  try {
    const [assets] = await pool.query(
      `SELECT uid AS UID, item_type, zone, division, vendor_name, condition_lot 
       FROM ${ASSET_TABLE} 
       WHERE uid IS NOT NULL AND uid != '' 
       ORDER BY uid DESC`
    );
    res.status(200).json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAssetByUID = async (req, res) => {
  try {
    const { uid } = req.params;
    const [rows] = await pool.query(`SELECT *, uid as UID FROM ${ASSET_TABLE} WHERE uid = ?`, [uid]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// New: update asset
exports.updateAsset = async (req, res) => {
  try {
    const { uid } = req.params;
    const { condition_lot, remarks, last_inspection } = req.body;

    // Validate existence
    const [exists] = await pool.query(`SELECT uid FROM ${ASSET_TABLE} WHERE uid = ?`, [uid]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await pool.query(
      `UPDATE ${ASSET_TABLE} 
       SET condition_lot = ?, remarks = ?, last_inspection = ? 
       WHERE uid = ?`,
      [condition_lot || null, remarks || null, last_inspection || null, uid]
    );

    // Return updated record
    const [rows] = await pool.query(`SELECT *, uid as UID FROM ${ASSET_TABLE} WHERE uid = ?`, [uid]);
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};