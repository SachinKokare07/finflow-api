const { User } = require('../models/User');
const { AppError } = require('../utils/helpers');

const getAll = async ({ page = 1, limit = 10, role, isActive } = {}) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .setOptions({ includeInactive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter).setOptions({ includeInactive: true }),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getById = async (id) => {
  const user = await User.findById(id).setOptions({ includeInactive: true });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

const update = async (id, data, requesterId, requesterRole) => {

  if (requesterRole !== 'admin' && id !== requesterId.toString()) {
    throw new AppError('You can only update your own profile.', 403);
  }

  if (requesterRole !== 'admin') {
    delete data.role;
    delete data.isActive;
  }

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).setOptions({ includeInactive: true });

  if (!user) throw new AppError('User not found.', 404);
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found.', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect.', 401);

  user.password = newPassword;
  await user.save();
};

const deactivate = async (id, requesterId) => {
  if (id === requesterId.toString()) {
    throw new AppError('You cannot deactivate your own account.', 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).setOptions({ includeInactive: true });

  if (!user) throw new AppError('User not found.', 404);
  return user;
};

module.exports = { getAll, getById, update, changePassword, deactivate };
