require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const { Transaction, CATEGORIES } = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finflow';

const users = [
  { name: 'Admin User',    email: 'admin@finflow.com',   password: 'Admin@1234',   role: 'admin'   },
  { name: 'Alice Analyst', email: 'analyst@finflow.com', password: 'Analyst@1234', role: 'analyst' },
  { name: 'Bob Viewer',    email: 'viewer@finflow.com',  password: 'Viewer@1234',  role: 'viewer'  },
];

const randomBetween = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

const randomDate = (monthsBack) => {
  const d = new Date();
  d.setMonth(d.getMonth() - Math.floor(Math.random() * monthsBack));
  d.setDate(Math.floor(Math.random() * 28) + 1);
  return d;
};

const incomeCategories  = ['salary', 'freelance', 'investment', 'business'];
const expenseCategories = ['rent', 'utilities', 'groceries', 'transport', 'healthcare', 'entertainment', 'education', 'insurance', 'taxes', 'other'];

const generateTransactions = (userId, count = 40) => {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() > 0.55;
    transactions.push({
      amount:      isIncome ? randomBetween(500, 8000) : randomBetween(10, 2000),
      type:        isIncome ? 'income' : 'expense',
      category:    isIncome
        ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
        : expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
      date:        randomDate(6),
      description: isIncome ? 'Income received' : 'Expense paid',
      createdBy:   userId,
    });
  }

  return transactions;
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    await Promise.all([User.deleteMany({}), Transaction.deleteMany({})]);
    console.log('✓ Cleared existing data');

    const createdUsers = await User.insertMany(
      await Promise.all(
        users.map(async (u) => ({
          ...u,
          password: await bcrypt.hash(u.password, 12),
        }))
      )
    );
    console.log(`✓ Created ${createdUsers.length} users`);

    const allTransactions = [
      ...generateTransactions(createdUsers[0]._id, 40),
      ...generateTransactions(createdUsers[1]._id, 30),
    ];
    await Transaction.insertMany(allTransactions);
    console.log(`✓ Created ${allTransactions.length} transactions`);

    console.log('\n─── Seed Credentials ───────────────────');
    users.forEach((u) => {
      console.log(`  ${u.role.padEnd(8)} │ ${u.email.padEnd(25)} │ ${u.password}`);
    });
    console.log('────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
