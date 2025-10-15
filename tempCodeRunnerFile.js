const mysql = require('mysql2/promise');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Soh@mk@d@m27',
    database: 'rail_tms_db'
});

(async () => {
    try {
        // Fetch all UIDs from the table
        const [rows] = await pool.query('SELECT uid FROM rail_tms_db');
        const baseUrl = 'http://localhost:3000/item/';

        // Ensure the QR directory exists
        const qrDir = path.join(__dirname, 'public', 'qr');
        if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

        for (const row of rows) {
            const uid = row.uid;
            const url = `${baseUrl}${uid}`;

            // Update QR link in the database
            await pool.query('UPDATE rail_tms_db SET qr_link = ? WHERE uid = ?', [url, uid]);

            // Sanitize filename to avoid invalid characters
            const safeUid = uid.replace(/[^a-zA-Z0-9-_]/g, '_');
            const qrPath = path.join(qrDir, `${safeUid}.png`);

            // Generate QR code image
            await QRCode.toFile(qrPath, url);

            console.log(`✅ QR generated for UID: ${uid} at ${qrPath}`);
        }

        console.log('🎉 All QR codes generated and database updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error generating QR codes:', err);
        process.exit(1);
    }
})();
