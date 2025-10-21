// server/app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db'); // mysql2/promise pool
const analysisService = require('./services/analysisService');
const calculateFitting = require('./utils/calculate_fitting'); // updated for line_length_km & gauge_type
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');

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
// ⚡ CORS Setup
// ------------------
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// ------------------
// 🔐 Session & Flash
// ------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: 'lax' },
  })
);
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
app.use('/api/auth', authRouter);
app.use('/api', apiRouter);

// ------------------
// ✅ Track Fitting Calculation API
// POST /api/fittings/calculate
// ------------------
app.post('/api/fittings/calculate', (req, res) => {
  try {
    const { line_length_km, gauge_type } = req.body;

    if (!line_length_km || line_length_km <= 0) {
      return res.status(400).json({ error: 'Line length must be greater than 0.' });
    }
    if (!['BG', 'MG', 'NG'].includes(gauge_type?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid gauge type. Use BG, MG, or NG.' });
    }

    const result = calculateFitting(Number(line_length_km), gauge_type.toUpperCase());
    res.json(result);
  } catch (err) {
    console.error('Fitting calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate fittings.' });
  }
});

// ------------------
// React SPA Serve
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
