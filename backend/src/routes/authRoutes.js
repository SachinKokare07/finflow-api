const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { registerValidator, loginValidator } = require('../validators/authValidators');

router.post('/register', authLimiter, registerValidator, validate, authController.register);

router.post('/login', authLimiter, loginValidator, validate, authController.login);

router.get('/me', authenticate, authController.getMe);

module.exports = router;
