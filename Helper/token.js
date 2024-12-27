const jwt = require('jsonwebtoken');
const RefreshToken = require('../Models/RefreshToken');
exports.generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '15h' });
};

exports.generateRefreshToken = async (user) => {
  const token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await RefreshToken.create({ token, userId: user.id, expiryDate });
  return token;
};