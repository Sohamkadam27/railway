// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db'); // promise pool
const router = express.Router();

// --- Register ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) 
      return res.status(400).json({ message: 'All fields are required' });

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) 
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) 
      return res.status(400).json({ message: 'All fields required' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) 
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return res.status(401).json({ message: 'Invalid credentials' });

    // Set session
    req.session.userId = user.id;
    req.session.userName = user.name;

    return res.json({ 
      message: 'Login successful', 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// --- Logout ---
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) 
      return res.status(500).json({ message: 'Could not logout' });

    res.clearCookie('connect.sid', { httpOnly: true, sameSite: 'lax' });
    return res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
