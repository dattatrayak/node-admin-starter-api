const User = require('../Models/User');
const RefreshToken = require('../Models/RefreshToken');
const bcrypt = require('bcryptjs');

const { successResponse, errorResponse } = require('../Config/response');
const { generateAccessToken, generateRefreshToken } = require('../Helper/token');
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes
 

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return errorResponse(res,'Account is locked. Try again later.',401,{ message: 'Invalid email or password'});
      //return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return errorResponse(res,'Account is locked. Try again later.',423,{ message: 'Account is locked. Try again later.'});
     // return res.status(423).json({ message: 'Account is locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
      }
      await user.save();
      return errorResponse(res,'Invalid email or password',401,{ message: 'Invalid email or password' });
     // return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    
     return successResponse(res,'login Successfully', {accessToken, refreshToken} )
  } catch (error) {
   return errorResponse(res,'',400,{ error: error.message });
  
  }
};

exports.refreshTokenUser = async (req, res) => {
  const { token } = req.body;
  //check token in the request
  if (!token) {
    return errorResponse(res,'Refresh token is required',403,{ message: 'Refresh token is required' });
    //return res.status(403).json({ message: 'Refresh token is required' });
  }
  try {
    const refreshToken = await RefreshToken.findOne({ where: { token } });

    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token is not in database' });
    }

    if (refreshToken.expiryDate < new Date()) {
      await RefreshToken.destroy({ where: { id: refreshToken.id } });
      return res.status(403).json({ message: 'Refresh token has expired. Please login again' });
    }

    const user = await User.findByPk(refreshToken.userId);
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

 