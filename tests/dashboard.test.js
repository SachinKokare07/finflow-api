require('./setup');

const request         = require('supertest');
const mongoose        = require('mongoose');
const app             = require('../src/app');
const { User }        = require('../src/models/User');
const { Transaction } = require('../src/models/Transaction');

let analystToken, viewerToken;

const registerUser = async (data) => {
  const res = await request(app).post('/api/auth/register').send(data);
  if (!res.body.success) {
    throw new Error(`Register failed for ${data.email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}, 30000);

beforeEach(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});

  analystToken = await registerUser({ name: 'Analyst', email: 'analyst@t.com', password: 'Analyst@1234', role: 'analyst' });
  viewerToken  = await registerUser({ name: 'Viewer',  email: 'viewer@t.com',  password: 'Viewer@1234',  role: 'viewer'  });

  const userId = (await User.findOne({ email: 'analyst@t.com' }))._id;
  await Transaction.insertMany([
    { amount: 5000, type: 'income',  category: 'salary',    date: new Date(), createdBy: userId },
    { amount: 3000, type: 'income',  category: 'freelance', date: new Date(), createdBy: userId },
    { amount: 1200, type: 'expense', category: 'rent',      date: new Date(), createdBy: userId },
    { amount: 400,  type: 'expense', category: 'groceries', date: new Date(), createdBy: userId },
  ]);
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);

describe('GET /api/dashboard/summary', () => {
  it('analyst can access summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(res.body.summary.income).toBe(8000);
    expect(res.body.summary.expense).toBe(1600);
    expect(res.body.summary.netBalance).toBe(6400);
    expect(res.body.summary.savingsRate).toBe(80);
  });

  it('viewer cannot access summary (403)', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/dashboard/by-category', () => {
  it('returns category breakdown', async () => {
    const res = await request(app)
      .get('/api/dashboard/by-category')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.categories.length).toBeGreaterThan(0);
    const salary = res.body.categories.find((c) => c.category === 'salary');
    expect(salary).toBeDefined();
    expect(salary.categoryTotal).toBe(5000);
  });
});

describe('GET /api/dashboard/trends', () => {
  it('returns monthly trends for default 6 months', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.trends)).toBe(true);
  });

  it('rejects months out of range', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends?months=99')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/dashboard/recent', () => {
  it('returns recent transactions', async () => {
    const res = await request(app)
      .get('/api/dashboard/recent')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.transactions.length).toBeLessThanOrEqual(10);
  });
});

describe('GET /api/dashboard/weekly', () => {
  it('returns this week vs last week data', async () => {
    const res = await request(app)
      .get('/api/dashboard/weekly')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(res.body.thisWeek).toBeDefined();
    expect(res.body.lastWeek).toBeDefined();
    expect(typeof res.body.thisWeek.income).toBe('number');
    expect(typeof res.body.thisWeek.expense).toBe('number');
  });
});
