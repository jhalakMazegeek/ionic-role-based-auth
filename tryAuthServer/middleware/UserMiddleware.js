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

//Delete a User
router.delete('/delete/:id', async (req, res) => {
  console.log("DELETE route accessed");
  const { id } = req.params;

  // Ensure that the user is an admin before allowing deletion
  const { roles } = req.userData;
  if (!roles.includes('admin')) {
      return res.status(403).json({ message: 'Access Denied' });
  }

  try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
