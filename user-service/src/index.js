import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// Placeholder: replace with Prisma DB access
const users = new Map();

app.get('/api/users/:id/profile', (req, res) => {
  const u = users.get(req.params.id) || {
    id: req.params.id,
    name: 'Demo User',
    avatar: null,
    language: 'en',
    fontSize: 14,
    theme: 'light',
  };
  res.json(u);
});

app.patch('/api/users/:id/profile', (req, res) => {
  const u = Object.assign({}, users.get(req.params.id) || { id: req.params.id }, req.body);
  users.set(req.params.id, u);
  res.json(u);
});

app.patch('/api/users/:id/preferences', (req, res) => {
  const u = users.get(req.params.id) || { id: req.params.id };
  u.preferences = Object.assign(u.preferences || {}, req.body);
  users.set(req.params.id, u);
  res.json(u.preferences);
});

const phrases = new Map();

app.get('/api/phrases', (req, res) => {
  const userId = req.query.userId;
  const results = Array.from(phrases.values()).filter(p => p.userId === userId || !userId);
  res.json(results);
});

app.post('/api/phrases', (req, res) => {
  const id = `phrase_${phrases.size + 1}`;
  const data = { id, ...req.body };
  phrases.set(id, data);
  res.status(201).json(data);
});

app.delete('/api/phrases/:id', (req, res) => {
  phrases.delete(req.params.id);
  res.sendStatus(204);
});

app.patch('/api/phrases/:id', (req, res) => {
  const p = phrases.get(req.params.id);
  if (!p) return res.sendStatus(404);
  Object.assign(p, req.body);
  phrases.set(req.params.id, p);
  res.json(p);
});

app.get('/api/users/:id/history', (req, res) => {
  // return dummy decode history
  res.json([]);
});

const port = process.env.PORT || 4002;
app.listen(port, () => console.log(`User service listening on ${port}`));
