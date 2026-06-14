import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.post('/api/notifications/send', (req, res) => {
  // placeholder: integrate firebase-admin
  console.log('send notification', req.body);
  res.json({ ok: true });
});

const port = process.env.PORT || 4003;
app.listen(port, () => console.log(`Notification service listening on ${port}`));
