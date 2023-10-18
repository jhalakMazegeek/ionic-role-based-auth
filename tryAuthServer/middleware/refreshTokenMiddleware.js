const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

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
