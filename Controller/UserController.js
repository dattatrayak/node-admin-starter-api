const User = require('../Models/User');
const RefreshToken = require('../Models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '15h' });
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await RefreshToken.create({ token, userId: user.id, expiryDate });
  return token;
};

exports.register = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, userType });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account is locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    res.json({ accessToken, refreshToken });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  //check token in the request
  if (!token) {
    return res.status(403).json({ message: 'Refresh token is required' });
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