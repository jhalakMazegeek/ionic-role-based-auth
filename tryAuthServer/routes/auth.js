const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, roles });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code && error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const roles = user.roles || [];
    const token = jwt.sign(
      { userId: user._id, roles: roles }, 'your-secret-key', { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, roles: roles }, 'your-refresh-secret-key', { expiresIn: '7d' }
    );

    res.status(200).json({ token, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Refresh JWT token
router.post('/refresh', (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    const decoded = jwt.verify(refreshToken, 'your-refresh-secret-key');

    const roles = decoded.roles || [];

    const newToken = jwt.sign(
      { userId: decoded.userId, roles: roles }, 
      'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
});

module.exports = router;
