const userService = require('../services/userService');
const { catchAsync, sendSuccess } = require('../utils/helpers');

const getAll = catchAsync(async (req, res) => {
  const result = await userService.getAll(req.query);
  sendSuccess(res, 200, 'Users retrieved.', result);
});

const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.params.id);
  sendSuccess(res, 200, 'User retrieved.', { user });
});

const update = catchAsync(async (req, res) => {
  const user = await userService.update(
    req.params.id,
    req.body,
    req.user._id,
    req.user.role
  );
  sendSuccess(res, 200, 'User updated.', { user });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  sendSuccess(res, 200, 'Password changed successfully.');
});

const deactivate = catchAsync(async (req, res) => {
  const user = await userService.deactivate(req.params.id, req.user._id);
  sendSuccess(res, 200, 'User deactivated.', { user });
});

module.exports = { getAll, getById, update, changePassword, deactivate };
