const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.use(authorize('analyst', 'admin'));

router.get('/summary', dashboardController.getSummary);

router.get('/by-category', dashboardController.getByCategory);

router.get('/trends', dashboardController.getMonthlyTrends);

router.get('/recent', dashboardController.getRecentActivity);

router.get('/weekly', dashboardController.getWeeklyComparison);

module.exports = router;
