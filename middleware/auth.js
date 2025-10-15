const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ? LIMIT 1', [decoded.id]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};
