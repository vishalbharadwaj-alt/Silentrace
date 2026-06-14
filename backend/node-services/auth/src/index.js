require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

// In-memory user store (replace with DB in production)
const users = new Map();

function signAccess(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function signRefresh(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).send({ error: 'email+password required' });
  if (users.has(email)) return res.status(409).send({ error: 'user exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, name: name || '', password: hashed };
  users.set(email, user);
  const access = signAccess(user);
  const refresh = signRefresh(user);
  // store refresh in redis
  await redis.set(`refresh:${user.id}`, refresh, 'EX', 7 * 24 * 60 * 60);
  res.send({ accessToken: access, refreshToken: refresh, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user) return res.status(401).send({ error: 'invalid' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).send({ error: 'invalid' });
  const access = signAccess(user);
  const refresh = signRefresh(user);
  await redis.set(`refresh:${user.id}`, refresh, 'EX', 7 * 24 * 60 * 60);
  res.send({ accessToken: access, refreshToken: refresh });
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).send({ error: 'refreshToken required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const stored = await redis.get(`refresh:${payload.id}`);
    if (stored !== refreshToken) return res.status(401).send({ error: 'invalid refresh' });
    // create new access
    const user = { id: payload.id };
    const access = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.send({ accessToken: access });
  } catch (err) {
    return res.status(401).send({ error: 'invalid' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).send({ error: 'refreshToken required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // remove from redis
    await redis.del(`refresh:${payload.id}`);
    // blacklist current access (optional)
    res.send({ ok: true });
  } catch (err) {
    res.status(400).send({ error: 'invalid' });
  }
});

// Google oauth stub
app.get('/api/auth/google', (req, res) => {
  res.send({ message: 'Google OAuth flow should be implemented here.' });
});

// JWT middleware for gateway
function jwtMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send({ error: 'missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).send({ error: 'invalid token' });
  }
}

app.get('/api/auth/me', jwtMiddleware, (req, res) => {
  res.send({ user: req.user });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Auth service listening on ${port}`));
