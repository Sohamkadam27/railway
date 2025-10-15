// scheduler.js
// Runs background tasks on a schedule.
const cron = require('node-cron');
const pool = require('./db');

const checkWarrantyExpirations = async () => {
  console.log('Scheduler: Checking for expiring warranties...');
  const [items] = await pool.query('SELECT uid, warranty_expiry FROM rail_tms_db WHERE warranty_expiry IS NOT NULL');
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  for (const item of items) {
    const expiryDate = new Date(item.warranty_expiry);
    if (expiryDate < thirtyDaysFromNow && expiryDate > new Date()) {
      console.log(`🚨 AI ALERT: Warranty for item ${item.uid} is expiring soon on ${expiryDate.toLocaleDateString()}!`);
    }
  }
};

cron.schedule('0 2 * * *', () => { // Runs daily at 2 AM
  console.log('Scheduler: Running daily AI analysis...');
  checkWarrantyExpirations();
});

console.log('🤖 AI Scheduler started.');