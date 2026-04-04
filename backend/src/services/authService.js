const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { AppError } = require('../utils/helpers');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email }).setOptions({ includeInactive: true });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id, user.role);

  return { user, token };
};

const login = async ({ email, password }) => {

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);
  return { user, token };
};

module.exports = { register, login };
