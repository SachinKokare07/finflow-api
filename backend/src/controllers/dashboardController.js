const dashboardService = require('../services/dashboardService');
const { catchAsync, sendSuccess } = require('../utils/helpers');

const getSummary = catchAsync(async (req, res) => {
  const summary = await dashboardService.getSummary();
  sendSuccess(res, 200, 'Dashboard summary retrieved.', { summary });
});

const getByCategory = catchAsync(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  const data = await dashboardService.getByCategory({ type, startDate, endDate });
  sendSuccess(res, 200, 'Category breakdown retrieved.', { categories: data });
});

const getMonthlyTrends = catchAsync(async (req, res) => {
  const months = parseInt(req.query.months) || 6;
  if (months < 1 || months > 24) {
    return res.status(400).json({ success: false, message: 'months must be between 1 and 24.' });
  }
  const trends = await dashboardService.getMonthlyTrends(months);
  sendSuccess(res, 200, 'Monthly trends retrieved.', { trends });
});

const getRecentActivity = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const transactions = await dashboardService.getRecentActivity(limit);
  sendSuccess(res, 200, 'Recent activity retrieved.', { transactions });
});

const getWeeklyComparison = catchAsync(async (req, res) => {
  const data = await dashboardService.getWeeklyComparison();
  sendSuccess(res, 200, 'Weekly comparison retrieved.', data);
});

module.exports = {
  getSummary,
  getByCategory,
  getMonthlyTrends,
  getRecentActivity,
  getWeeklyComparison,
};
