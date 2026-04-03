require('./setup');

const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../src/app');
const { User } = require('../src/models/User');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}, 30000);

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);

const validUser = {
  name:     'Test User',
  email:    'test@example.com',
  password: 'Test@1234',
  role:     'analyst',
};

const registerUser = async (data) => {
  const res = await request(app).post('/api/auth/register').send(data);
  if (!res.body.success) {
    throw new Error(`Register failed: ${res.body.message}`);
  }
  return res;
};

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await registerUser(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate email with 409', async () => {
    await registerUser(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects weak password with 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'weak' });
    expect(res.status).toBe(422);
  });

  it('rejects missing email with 422', async () => {
    const { email, ...noEmail } = validUser;
    const res = await request(app).post('/api/auth/register').send(noEmail);
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerUser(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('analyst');
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass@1' });
    expect(res.status).toBe(401);
  });

  it('rejects non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Test@1234' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user profile with valid token', async () => {
    const reg = await registerUser(validUser);
    const token = reg.body.token;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer notarealtoken');
    expect(res.status).toBe(401);
  });
});
