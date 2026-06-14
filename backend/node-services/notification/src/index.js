require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/notifications/send', async (req, res) => {
  const { token, title, body, data } = req.body;
  if (!token || !title) return res.status(400).send({ error: 'token and title required' });
  // Replace with Firebase Admin SDK integration in production.
  res.send({ ok: true, delivered: false, title, body, data });
});

const port = process.env.PORT || 3003;
app.listen(port, () => console.log(`Notification service listening on ${port}`));
