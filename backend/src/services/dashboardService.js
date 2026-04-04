const { Transaction } = require('../models/Transaction');

const getSummary = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
  ]);

  const summary = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
  result.forEach(({ _id, total, count }) => {
    if (_id === 'income') {
      summary.income = parseFloat(total.toFixed(2));
      summary.incomeCount = count;
    }
    if (_id === 'expense') {
      summary.expense = parseFloat(total.toFixed(2));
      summary.expenseCount = count;
    }
  });

  summary.netBalance = parseFloat((summary.income - summary.expense).toFixed(2));
  summary.totalTransactions = summary.incomeCount + summary.expenseCount;
  summary.savingsRate =
    summary.income > 0
      ? parseFloat(((summary.netBalance / summary.income) * 100).toFixed(2))
      : 0;

  return summary;
};

const getByCategory = async ({ type, startDate, endDate } = {}) => {
  const match = { isDeleted: { $ne: true } };
  if (type) match.type = type;
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  return Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $group: {
        _id: '$_id.category',
        breakdown: {
          $push: { type: '$_id.type', total: '$total', count: '$count' },
        },
        categoryTotal: { $sum: '$total' },
      },
    },
    { $sort: { categoryTotal: -1 } },
    {
      $project: {
        category: '$_id',
        breakdown: 1,
        categoryTotal: { $round: ['$categoryTotal', 2] },
        _id: 0,
      },
    },
  ]);
};

const getMonthlyTrends = async (months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return Transaction.aggregate([
    {
      $match: {
        isDeleted: { $ne: true },
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        data: {
          $push: { type: '$_id.type', total: { $round: ['$total', 2] }, count: '$count' },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        monthLabel: {
          $let: {
            vars: {
              months: [
                '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
              ],
            },
            in: { $arrayElemAt: ['$$months', '$_id.month'] },
          },
        },
        data: 1,
      },
    },
  ]);
};

const getRecentActivity = async (limit = 10) => {
  return Transaction.find({ isDeleted: { $ne: true } })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
};

const getWeeklyComparison = async () => {
  const now = new Date();

  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  const aggregate = async (start, end) =>
    Transaction.aggregate([
      { $match: { isDeleted: { $ne: true }, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

  const [thisWeek, lastWeek] = await Promise.all([
    aggregate(thisWeekStart, now),
    aggregate(lastWeekStart, lastWeekEnd),
  ]);

  const format = (data) => {
    const obj = { income: 0, expense: 0 };
    data.forEach(({ _id, total }) => { obj[_id] = parseFloat(total.toFixed(2)); });
    return obj;
  };

  return { thisWeek: format(thisWeek), lastWeek: format(lastWeek) };
};

module.exports = { getSummary, getByCategory, getMonthlyTrends, getRecentActivity, getWeeklyComparison };
