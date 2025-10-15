const { validationResult } = require('express-validator');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (userId, statusCode, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24*60*60*1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  };
  res.status(statusCode).cookie('token', token, options).json({ success: true, token });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
  sendTokenResponse(result.insertId, 201, res);
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, rows[0].password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  sendTokenResponse(rows[0].id, 200, res);
};

exports.getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, data: req.user });
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10*1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
