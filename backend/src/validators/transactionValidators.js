const { body, query, param } = require('express-validator');
const { TRANSACTION_TYPES, CATEGORIES } = require('../models/Transaction');

const createTransactionValidator = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage(`Type must be one of: ${Object.values(TRANSACTION_TYPES).join(', ')}`),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const updateTransactionValidator = [
  param('id').isMongoId().withMessage('Invalid transaction ID'),

  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage(`Type must be one of: ${Object.values(TRANSACTION_TYPES).join(', ')}`),

  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const listTransactionValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('type')
    .optional()
    .isIn(Object.values(TRANSACTION_TYPES)).withMessage('Invalid type filter'),

  query('category')
    .optional()
    .isIn(CATEGORIES).withMessage('Invalid category filter'),

  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid ISO 8601 date'),

  query('minAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('minAmount must be a non-negative number'),

  query('maxAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxAmount must be a non-negative number'),
];

module.exports = {
  createTransactionValidator,
  updateTransactionValidator,
  listTransactionValidator,
};
