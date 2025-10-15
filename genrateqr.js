// generateqr.js
// One-time script to generate QR codes for all database items.
require('dotenv').config();

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  console.log('Starting QR code generation...');
  try {
    const [rows] = await pool.query('SELECT uid FROM rail_tms_db');
    const qrDir = path.join(__dirname, 'public', 'qr');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    for (const row of rows) {
      const url = `http://localhost:3000/item/${row.uid}`;
      const qrPath = path.join(qrDir, `${row.uid}.png`);
      await QRCode.toFile(qrPath, url);
      await pool.query('UPDATE rail_tms_db SET qr_link = ? WHERE uid = ?', [url, row.uid]);
      console.log(`Generated QR for ${row.uid}`);
    }
    console.log('✅ All QR codes generated successfully.');
  } catch (err) {
    console.error('❌ Error during QR code generation:', err);
  } finally {
    await pool.end(); // Close the database connection
  }
})();