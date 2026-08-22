const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';

// Server-side plan registry. The client sends only a planId; the price is
// looked up here so a tampered client can never charge an arbitrary amount.
const PLANS = {
  pro: { name: 'Pro', amountNaira: Number(process.env.PLAN_PRO_NGN || 0) },
  family: { name: 'Family', amountNaira: Number(process.env.PLAN_FAMILY_NGN || 0) },
};

app.use(cors());
app.use(express.json());
// Webhook needs the raw body for signature verification.
app.use('/paystack/webhook', express.raw({ type: 'application/json' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/paystack/plans', (_req, res) => {
  res.json({
    pro: { name: PLANS.pro.name, amountNaira: PLANS.pro.amountNaira },
    family: { name: PLANS.family.name, amountNaira: PLANS.family.amountNaira },
  });
});

app.post('/paystack/initialize', async (req, res) => {
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment provider is not configured yet.' });
  }
  const { email, planId } = req.body || {};
  const plan = PLANS[planId];
  if (!email || !plan || !plan.amountNaira) {
    return res.status(400).json({ error: 'Invalid email or plan.' });
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(plan.amountNaira * 100), // kobo
        currency: 'NGN',
        metadata: { planId, planName: plan.name },
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      return res.status(502).json({ error: data.message || 'Could not start payment.' });
    }
    return res.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach payment provider.' });
  }
});

app.get('/paystack/verify/:reference', async (req, res) => {
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment provider is not configured yet.' });
  }
  const { reference } = req.params;

  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      return res.status(502).json({ error: data.message || 'Could not verify payment.' });
    }
    const paid = data.data.status === 'success';
    return res.json({
      paid,
      planId: data.data.metadata?.planId || null,
      amountNaira: data.data.amount / 100,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach payment provider.' });
  }
});

// Source of truth for "did this payment really happen" -- verified via HMAC
// signature, independent of anything the client claims. No database wired
// up yet, so this only logs; persisting subscription state server-side is
// the next step once there's an accounts system to attach it to.
app.post('/paystack/webhook', (req, res) => {
  if (!PAYSTACK_SECRET_KEY) return res.sendStatus(500);

  const signature = req.headers['x-paystack-signature'];
  const expected = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(req.body).digest('hex');
  if (signature !== expected) {
    return res.sendStatus(401);
  }

  const event = JSON.parse(req.body.toString('utf8'));
  console.log('Paystack webhook event:', event.event, event.data?.reference);
  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Royal-VPN payment server listening on port ${PORT}`);
});
