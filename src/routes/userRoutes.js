const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateUserValidator, changePasswordValidator } = require('../validators/userValidators');

router.use(authenticate);

router.get('/', authorize('admin'), userController.getAll);

router.get('/:id', authorize('admin'), userController.getById);

router.patch(
  '/:id',
  authorize('viewer', 'analyst', 'admin'),
  updateUserValidator,
  validate,
  userController.update
);

router.patch(
  '/:id/change-password',
  authorize('viewer', 'analyst', 'admin'),
  changePasswordValidator,
  validate,
  userController.changePassword
);

router.patch('/:id/deactivate', authorize('admin'), userController.deactivate);

module.exports = router;
