const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';
const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : undefined,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan_id TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Server-side plan registry. The client sends only a planId; the price is
// looked up here so a tampered client can never charge an arbitrary amount.
const PLANS = {
  pro: { name: 'Pro', amountNaira: Number(process.env.PLAN_PRO_NGN || 0) },
  family: { name: 'Family', amountNaira: Number(process.env.PLAN_FAMILY_NGN || 0) },
  vip: { name: 'VIP', amountNaira: Number(process.env.PLAN_VIP_NGN || 0) },
};

app.use(cors());
app.use(express.json());
// Webhook needs the raw body for signature verification.
app.use('/paystack/webhook', express.raw({ type: 'application/json' }));

function signToken(user) {
  return jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !JWT_SECRET) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query('SELECT id, email, plan_id FROM users WHERE id = $1', [payload.uid]);
    if (!rows[0]) return res.status(401).json({ error: 'Not authenticated.' });
    req.user = rows[0];
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }));

// The one real, live server backing this app. Everything else is honestly
// marked "coming soon" rather than shown with fabricated ping/load numbers.
const PILOT = {
  id: 'pilot-nyc1',
  city: 'New York',
  country: 'United States',
  flag: '🇺🇸',
  host: process.env.PILOT_STATUS_HOST,
  statusPort: Number(process.env.PILOT_STATUS_PORT || 8081),
  statusKey: process.env.PILOT_STATUS_KEY,
  wgHost: process.env.PILOT_WG_HOST,
  wgPort: Number(process.env.PILOT_WG_PORT || 51820),
  wgPublicKey: process.env.PILOT_WG_PUBLIC_KEY,
};

const COMING_SOON_LOCATIONS = [
  { id: 'lon1', city: 'London', country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'lag1', city: 'Lagos', country: 'Nigeria', flag: '🇳🇬' },
  { id: 'fra1', city: 'Paris', country: 'France', flag: '🇫🇷' },
  { id: 'sin1', city: 'Singapore', country: 'Singapore', flag: '🇸🇬' },
  { id: 'tok1', city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
];

async function fetchPilotStatus() {
  if (!PILOT.host || !PILOT.statusKey) return null;
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`http://${PILOT.host}:${PILOT.statusPort}/status`, {
      headers: { 'x-royal-status-key': PILOT.statusKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    return { ...data, pingMs: Date.now() - started };
  } catch (e) {
    return null;
  }
}

app.get('/servers', async (_req, res) => {
  const live = await fetchPilotStatus();
  const pilotServer = {
    id: PILOT.id,
    city: PILOT.city,
    country: PILOT.country,
    flag: PILOT.flag,
    vip: false,
    live: true,
    status: live ? 'AVAILABLE' : 'TEMPORARILY OFFLINE',
    pingMs: live ? live.pingMs : null,
    loadPct: live ? live.memUsedPct : null,
    activeUsers: live ? live.wgActivePeers : null,
  };

  const comingSoon = COMING_SOON_LOCATIONS.map((loc) => ({
    ...loc,
    vip: true,
    live: false,
    status: 'COMING SOON',
    pingMs: null,
    loadPct: null,
    activeUsers: null,
  }));

  res.json({ servers: [pilotServer, ...comingSoon] });
});

app.get('/vpn/pilot-config', requireAuth, (req, res) => {
  if (!PILOT.wgHost || !PILOT.wgPublicKey) {
    return res.status(503).json({ error: 'The pilot server is not configured yet.' });
  }
  res.json({
    endpoint: `${PILOT.wgHost}:${PILOT.wgPort}`,
    serverPublicKey: PILOT.wgPublicKey,
  });
});

app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and an 8+ character password are required.' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows[0]) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, plan_id',
      [email.toLowerCase(), passwordHash]
    );
    const user = rows[0];
    return res.json({ token: signToken(user), email: user.email, planId: user.plan_id });
  } catch (e) {
    return res.status(500).json({ error: 'Could not create account.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    return res.json({ token: signToken(user), email: user.email, planId: user.plan_id });
  } catch (e) {
    return res.status(500).json({ error: 'Could not log in.' });
  }
});

app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ email: req.user.email, planId: req.user.plan_id });
});

app.get('/paystack/plans', (_req, res) => {
  res.json({
    pro: { name: PLANS.pro.name, amountNaira: PLANS.pro.amountNaira },
    family: { name: PLANS.family.name, amountNaira: PLANS.family.amountNaira },
    vip: { name: PLANS.vip.name, amountNaira: PLANS.vip.amountNaira },
  });
});

app.post('/paystack/initialize', requireAuth, async (req, res) => {
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment provider is not configured yet.' });
  }
  const { planId } = req.body || {};
  const plan = PLANS[planId];
  if (!plan || !plan.amountNaira) {
    return res.status(400).json({ error: 'Invalid plan.' });
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: Math.round(plan.amountNaira * 100), // kobo
        currency: 'NGN',
        metadata: { planId, planName: plan.name, uid: req.user.id },
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

app.get('/paystack/verify/:reference', requireAuth, async (req, res) => {
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
    const planId = data.data.metadata?.planId || null;
    const uid = data.data.metadata?.uid;

    if (paid && planId && uid) {
      await pool.query('UPDATE users SET plan_id = $1 WHERE id = $2', [planId, uid]);
    }

    return res.json({ paid, planId, amountNaira: data.data.amount / 100 });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach payment provider.' });
  }
});

// Independent source of truth for "did this payment really happen" --
// verified via HMAC signature, not anything the client claims. Also
// updates plan_id server-side so a tampered client can't fake an upgrade.
app.post('/paystack/webhook', async (req, res) => {
  if (!PAYSTACK_SECRET_KEY) return res.sendStatus(500);

  const signature = req.headers['x-paystack-signature'];
  const expected = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(req.body).digest('hex');
  if (signature !== expected) {
    return res.sendStatus(401);
  }

  const event = JSON.parse(req.body.toString('utf8'));
  console.log('Paystack webhook event:', event.event, event.data?.reference);

  if (event.event === 'charge.success') {
    const planId = event.data?.metadata?.planId;
    const uid = event.data?.metadata?.uid;
    if (planId && uid) {
      try {
        await pool.query('UPDATE users SET plan_id = $1 WHERE id = $2', [planId, uid]);
      } catch (e) {
        console.error('Failed to update plan from webhook:', e.message);
      }
    }
  }

  return res.sendStatus(200);
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Royal-VPN server listening on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Failed to initialize database:', e.message);
    process.exit(1);
  });
