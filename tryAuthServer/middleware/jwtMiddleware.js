const jwt = require('jsonwebtoken');
const config = require('../config/config'); 

module.exports = (req, res, next) => {
  try {
    const accessToken = req.headers['authorization'].split(' ')[1]; // Access Token
    const refreshToken = req.headers['refresh-token']; // Refresh Token

    const partsAccessToken = accessToken.split('.');
    if (partsAccessToken.length !== 3) {
        console.error("Access Token structure is not valid.");
    }

    const partsRefreshToken = refreshToken.split('.');
    if (partsRefreshToken.length !== 3) {
        console.error("Refresh Token structure is not valid.");
    }

    const decodedAccessToken = jwt.verify(accessToken, config.accessTokenSecret);
    const decodedRefreshToken = jwt.verify(refreshToken, config.refreshTokenSecret);

    req.accessTokenData = decodedAccessToken;
    req.refreshTokenData = decodedRefreshToken;
    
    req.userData = {
      userId: decodedAccessToken.userId,
      roles: decodedAccessToken.roles,
    };
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Authentication failed from jwtMiddleware' });
  }
};
