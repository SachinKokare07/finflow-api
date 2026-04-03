require('./setup');

const request         = require('supertest');
const mongoose        = require('mongoose');
const app             = require('../src/app');
const { User }        = require('../src/models/User');
const { Transaction } = require('../src/models/Transaction');

let adminToken, analystToken, viewerToken;
let adminId, analystId;

const registerUser = async (data) => {
  const res = await request(app).post('/api/auth/register').send(data);
  if (!res.body.success) {
    throw new Error(`Register failed for ${data.email}: ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token, id: res.body.user._id };
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}, 30000);

beforeEach(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});

  ({ token: adminToken,   id: adminId }   = await registerUser({ name: 'Admin',   email: 'admin@t.com',   password: 'Admin@1234',   role: 'admin'   }));
  ({ token: analystToken, id: analystId } = await registerUser({ name: 'Analyst', email: 'analyst@t.com', password: 'Analyst@1234', role: 'analyst' }));
  ({ token: viewerToken }                 = await registerUser({ name: 'Viewer',  email: 'viewer@t.com',  password: 'Viewer@1234',  role: 'viewer'  }));
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);

const validTx = {
  amount:      1500,
  type:        'income',
  category:    'salary',
  date:        '2024-06-15',
  description: 'Monthly salary',
};

describe('POST /api/transactions', () => {
  it('analyst can create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(validTx);
    expect(res.status).toBe(201);
    expect(res.body.transaction.amount).toBe(1500);
    expect(res.body.transaction.createdBy).toBeDefined();
  });

  it('admin can create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validTx);
    expect(res.status).toBe(201);
  });

  it('viewer cannot create a transaction (403)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(validTx);
    expect(res.status).toBe(403);
  });

  it('rejects negative amount (422)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ ...validTx, amount: -100 });
    expect(res.status).toBe(422);
  });

  it('rejects invalid category (422)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ ...validTx, category: 'unicorn' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/transactions', () => {
  beforeEach(async () => {
    await request(app).post('/api/transactions').set('Authorization', `Bearer ${analystToken}`).send(validTx);
    await request(app).post('/api/transactions').set('Authorization', `Bearer ${analystToken}`).send({ ...validTx, type: 'expense', category: 'rent', amount: 800 });
  });

  it('viewer can list transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
  });

  it('filters by type correctly', async () => {
    const res = await request(app)
      .get('/api/transactions?type=income')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.transactions.every((t) => t.type === 'income')).toBe(true);
  });

  it('paginates correctly', async () => {
    const res = await request(app)
      .get('/api/transactions?page=1&limit=1')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/transactions/:id', () => {
  let txId;
  beforeEach(async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(validTx);
    txId = res.body.transaction._id;
  });

  it('analyst can update their own transaction', async () => {
    const res = await request(app)
      .patch(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ amount: 2000 });
    expect(res.status).toBe(200);
    expect(res.body.transaction.amount).toBe(2000);
  });

  it('admin can update any transaction', async () => {
    const res = await request(app)
      .patch(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated by admin' });
    expect(res.status).toBe(200);
  });

  it('viewer cannot update a transaction (403)', async () => {
    const res = await request(app)
      .patch(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 999 });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/transactions/:id (soft delete)', () => {
  let txId;
  beforeEach(async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(validTx);
    txId = res.body.transaction._id;
  });

  it('analyst can soft-delete their own transaction', async () => {
    const del = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${analystToken}`);
    expect(del.status).toBe(200);

    const list = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(list.body.transactions.find((t) => t._id === txId)).toBeUndefined();
  });

  it('deleted transaction is invisible but still in DB', async () => {
    await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${analystToken}`);

    const raw = await Transaction.findById(txId).setOptions({ includeDeleted: true });
    expect(raw).not.toBeNull();
    expect(raw.isDeleted).toBe(true);
  });
});
