const authService = require('../services/authService');
const { catchAsync, sendSuccess } = require('../utils/helpers');

const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.register({ name, email, password, role });

  sendSuccess(res, 201, 'Account created successfully.', { token, user });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  sendSuccess(res, 200, 'Login successful.', { token, user });
});

const getMe = catchAsync(async (req, res) => {
  sendSuccess(res, 200, 'Profile retrieved.', { user: req.user });
});

module.exports = { register, login, getMe };
