require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory fallback stub; wire Prisma client in production.
const users = new Map();
const phrases = [];
const histories = [];

app.get('/api/users/:id/profile', (req, res) => {
  const user = users.get(req.params.id) || {
    id: req.params.id,
    name: 'User',
    avatar: '',
    language: 'en',
    fontSize: 14,
    theme: 'light'
  };
  res.send(user);
});

app.patch('/api/users/:id/profile', (req, res) => {
  const current = users.get(req.params.id) || { id: req.params.id };
  const updated = { ...current, ...req.body };
  users.set(req.params.id, updated);
  res.send(updated);
});

app.patch('/api/users/:id/preferences', (req, res) => {
  const current = users.get(req.params.id) || { id: req.params.id };
  const updated = { ...current, preferences: { ...(current.preferences || {}), ...req.body } };
  users.set(req.params.id, updated);
  res.send(updated.preferences);
});

app.get('/api/phrases', (req, res) => {
  const { userId, category } = req.query;
  const filtered = phrases.filter((phrase) => (!userId || phrase.userId === userId) && (!category || phrase.category === category));
  res.send(filtered);
});

app.post('/api/phrases', (req, res) => {
  const phrase = { id: Date.now().toString(), ...req.body };
  phrases.push(phrase);
  res.status(201).send(phrase);
});

app.delete('/api/phrases/:id', (req, res) => {
  const index = phrases.findIndex((phrase) => phrase.id === req.params.id);
  if (index === -1) return res.status(404).send({ error: 'not found' });
  phrases.splice(index, 1);
  res.send({ ok: true });
});

app.patch('/api/phrases/:id', (req, res) => {
  const phrase = phrases.find((item) => item.id === req.params.id);
  if (!phrase) return res.status(404).send({ error: 'not found' });
  Object.assign(phrase, req.body);
  res.send(phrase);
});

app.get('/api/users/:id/history', (req, res) => {
  const limit = Number(req.query.limit || 10);
  const result = histories.filter((item) => item.userId === req.params.id).slice(-limit);
  res.send(result);
});

app.post('/api/users/:id/history', (req, res) => {
  const item = { id: Date.now().toString(), userId: req.params.id, ...req.body, createdAt: new Date().toISOString() };
  histories.push(item);
  res.status(201).send(item);
});

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`User service listening on ${port}`));
