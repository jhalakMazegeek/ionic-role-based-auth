const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const User = require('../models/User');
router.use(jwtMiddleware);

router.get('/profile', async (req, res) => {
  // Access user data from req.userData (set by jwtMiddleware)
  const {userId, roles } = req.userData;
  try {
    const user = await User.findOne({ _id: userId });
    console.log(req.userData);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user && roles.includes('admin')) {
      res.status(200).json({ message: `Admin Accessed: ${user}`, info: user });
    } else if (user && roles.includes('user')) {
      res.status(200).json({ message: `User Accessed: ${user}`, info: user });
    } else if (user && roles.includes('author')) {
      res.status(200).json({ message: `Author Accessed: ${user}`, info: user });
    }else {
      res.status(403).json({ message: 'Access Denied' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/all-users', jwtMiddleware, async (req, res) => {
  const userRoles = req.userData.roles;
  
  if (!userRoles.includes('admin')) {
    return res.status(403).json({ message: 'Forbidden: Admin can access this endpoint.' });
  }
  try {
    const users = await User.find({});
    console.log(users);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
