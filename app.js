const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db'); // mysql2/promise pool
const analysisService = require('./services/analysisService');

const authRouter = require('./routes/auth'); // login/register/logout
const apiRouter = require('./routes/api');   // other API endpoints

const app = express();
const port = process.env.PORT || 3000;

// ------------------
// 🧱 Express Setup
// ------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------
// ⚡ CORS Setup for React frontend
// ------------------
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ------------------
// 🔐 Session & Flash
// ------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// ------------------
// 🔐 Auth Middleware
// ------------------
function ensureLoggedIn(req, res, next) {
  if (!req.session.userId) {
    req.flash('error_msg', 'Please login first.');
    return res.redirect('/login');
  }
  next();
}

// ------------------
// 🔗 API Routes
// ------------------
app.use('/api/auth', authRouter);  // login/register/logout
app.use('/api', apiRouter);        // other API endpoints including geo-data

// ------------------
// 🌐 EJS Routes
// ------------------
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/', ensureLoggedIn, async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT uid, asset_type, vendor_name, condition_lot, depot_code, latitude, longitude FROM rail_tms_db ORDER BY uid DESC'
    );
    res.render('dashboard', { items });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Error loading dashboard');
  }
});

app.get('/item/:uid', ensureLoggedIn, async (req, res) => {
  try {
    const { uid } = req.params;
    const [rows] = await pool.query('SELECT * FROM rail_tms_db WHERE uid = ?', [uid]);
    if (!rows.length) return res.status(404).send('Item not found');

    const item = rows[0];
    const assemblyRemark = analysisService.generateAssemblyRemark(item);
    const lotStatusSummary = await analysisService.getVendorLotStatusSummary(item.vendor_name);
    const vendorReport = await analysisService.getVendorContext(item.vendor_name);
    const assetTypeReport = await analysisService.getAssetTypeContext(item.asset_type);

    item.formatted_last_inspection = item.last_inspection
      ? new Date(item.last_inspection).toISOString().split('T')[0]
      : '';

    res.render('item', {
      item,
      assemblyRemark,
      lotStatusSummary: lotStatusSummary || { ready: 0, notReady: 0 },
      vendorReport: vendorReport || null,
      assetTypeReport: assetTypeReport || null,
    });
  } catch (err) {
    console.error('Item fetch error:', err);
    res.status(500).send('Server Error');
  }
});

app.post('/item/:uid', ensureLoggedIn, async (req, res) => {
  try {
    const { uid } = req.params;
    const { condition_lot, remarks, last_inspection, latitude, longitude } = req.body;

    await pool.query(
      `UPDATE rail_tms_db 
       SET condition_lot=?, remarks=?, last_inspection=?, latitude=?, longitude=? 
       WHERE uid=?`,
      [condition_lot, remarks, last_inspection || null, latitude || null, longitude || null, uid]
    );

    req.flash('success_msg', 'Asset details updated successfully!');
    res.redirect(`/item/${uid}`);
  } catch (err) {
    console.error('Item update error:', err);
    req.flash('error_msg', 'Failed to update asset details.');
    res.redirect(`/item/${req.params.uid}`);
  }
});

app.get('/reports', ensureLoggedIn, async (req, res) => {
  try {
    const vendorReport = await analysisService.generateVendorReport();
    const inventoryReport = await analysisService.generateInventoryReport();
    res.render('report', { pageTitle: 'AI-Generated Reports', vendorReport, inventoryReport });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).send('Error generating reports');
  }
});

// ------------------
// ⚡ React SPA Serve
// ------------------
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// ------------------
// 🚀 Start Server
// ------------------
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
