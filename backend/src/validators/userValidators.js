const { body, param } = require('express-validator');
const { ROLES } = require('../models/User');

const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
];

module.exports = { updateUserValidator, changePasswordValidator };
