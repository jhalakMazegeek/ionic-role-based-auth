const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('User trying to login:', email);
    try {
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Authentication failed' });
      }
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return res.status(500).json({ message: 'Error during authentication' });
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, 'your-secret-key', { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, 'your-refresh-secret-key', { expiresIn: '7d' });

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
    const newToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
});

module.exports = router;
