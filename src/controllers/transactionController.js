const transactionService = require('../services/transactionService');
const { catchAsync, sendSuccess } = require('../utils/helpers');

const getAll = catchAsync(async (req, res) => {
  const result = await transactionService.getAll(req.query);
  sendSuccess(res, 200, 'Transactions retrieved.', result);
});

const getById = catchAsync(async (req, res) => {
  const transaction = await transactionService.getById(req.params.id);
  sendSuccess(res, 200, 'Transaction retrieved.', { transaction });
});

const create = catchAsync(async (req, res) => {
  const transaction = await transactionService.create(req.body, req.user._id);
  sendSuccess(res, 201, 'Transaction created.', { transaction });
});

const update = catchAsync(async (req, res) => {
  const transaction = await transactionService.update(
    req.params.id,
    req.body,
    req.user._id,
    req.user.role
  );
  sendSuccess(res, 200, 'Transaction updated.', { transaction });
});

const remove = catchAsync(async (req, res) => {
  await transactionService.softDelete(req.params.id, req.user._id, req.user.role);
  sendSuccess(res, 200, 'Transaction deleted successfully.');
});

module.exports = { getAll, getById, create, update, remove };
