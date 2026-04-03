const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createTransactionValidator,
  updateTransactionValidator,
  listTransactionValidator,
} = require('../validators/transactionValidators');

router.use(authenticate);

router.get(
  '/',
  authorize('viewer', 'analyst', 'admin'),
  listTransactionValidator,
  validate,
  transactionController.getAll
);

router.get('/:id', authorize('viewer', 'analyst', 'admin'), transactionController.getById);

router.post(
  '/',
  authorize('analyst', 'admin'),
  createTransactionValidator,
  validate,
  transactionController.create
);

router.patch(
  '/:id',
  authorize('analyst', 'admin'),
  updateTransactionValidator,
  validate,
  transactionController.update
);

router.delete('/:id', authorize('analyst', 'admin'), transactionController.remove);

module.exports = router;
