import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

const users = new Map(); // in-memory store for demo; replace with DB

function signTokens(userId) {
  const access = jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refresh = jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'change_me', {
    expiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
  });
  return { access, refresh };
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (users.has(email)) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const id = `user_${users.size + 1}`;
  users.set(email, { id, email, name, password: hash });
  const tokens = signTokens(id);
  res.json({ user: { id, email, name }, tokens });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const tokens = signTokens(user.id);
  res.json({ user: { id: user.id, email: user.email, name: user.name }, tokens });
});

router.post('/refresh', (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ error: 'No refresh token' });
  try {
    const payload = jwt.verify(refresh, process.env.JWT_SECRET || 'change_me');
    const tokens = signTokens(payload.sub);
    res.json({ tokens });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.sendStatus(204);
  // blacklist refresh token in Redis
  const redis = req.app.get('redis');
  try {
    const payload = jwt.decode(refresh);
    if (payload && payload.exp) {
      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) await redis.setex(`blacklist:${refresh}`, ttl, '1');
    }
  } catch (e) {}
  res.sendStatus(204);
});

export default router;
