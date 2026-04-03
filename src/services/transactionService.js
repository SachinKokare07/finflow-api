const { Transaction } = require('../models/Transaction');
const { AppError } = require('../utils/helpers');

const buildFilter = ({ type, category, startDate, endDate, minAmount, maxAmount, search }) => {
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = parseFloat(minAmount);
    if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
  }

  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }

  return filter;
};

const getAll = async (queryParams) => {
  const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', ...filterParams } = queryParams;

  const filter = buildFilter(filterParams);
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

const getById = async (id) => {
  const transaction = await Transaction.findById(id).populate('createdBy', 'name email');
  if (!transaction) {
    throw new AppError('Transaction not found.', 404);
  }
  return transaction;
};

const create = async (data, userId) => {
  return Transaction.create({ ...data, createdBy: userId });
};

const update = async (id, data, userId, userRole) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) throw new AppError('Transaction not found.', 404);

  if (userRole !== 'admin' && transaction.createdBy.toString() !== userId.toString()) {
    throw new AppError('You can only edit your own transactions.', 403);
  }

  const allowed = ['amount', 'type', 'category', 'date', 'description'];
  allowed.forEach((field) => {
    if (data[field] !== undefined) transaction[field] = data[field];
  });

  return transaction.save();
};

const softDelete = async (id, userId, userRole) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) throw new AppError('Transaction not found.', 404);

  if (userRole !== 'admin' && transaction.createdBy.toString() !== userId.toString()) {
    throw new AppError('You can only delete your own transactions.', 403);
  }

  transaction.isDeleted = true;
  transaction.deletedAt = new Date();
  transaction.deletedBy = userId;
  await transaction.save({ validateBeforeSave: false });
};

module.exports = { getAll, getById, create, update, softDelete };
