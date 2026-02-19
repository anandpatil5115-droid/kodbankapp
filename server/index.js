require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool, createTables } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET;

/* ── Middleware ─────────────────────────────────────────────────── */
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/* ── Helper: verify JWT from cookie ────────────────────────────── */
const verifyToken = (req) => {
    const token = req.cookies?.kodbank_token;
    if (!token) throw new Error('Not authenticated. Please log in.');
    try {
        return jwt.verify(token, SECRET);
    } catch {
        throw new Error('Session expired. Please log in again.');
    }
};

/* ── POST /api/register ─────────────────────────────────────────── */
app.post('/api/register', async (req, res) => {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required.' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
        const uid = uuidv4();
        const hashedPass = await bcrypt.hash(password, 12);

        await pool.query(
            `INSERT INTO "KodUser" (uid, username, email, password, phone, role, balance)
       VALUES ($1, $2, $3, $4, $5, 'customer', 100000)`,
            [uid, username.trim(), email.toLowerCase().trim(), hashedPass, phone || null]
        );

        res.status(201).json({
            success: true,
            message: `Account created! Welcome to Kodbank, ${username}. ₹1,00,000 added to your account.`
        });
    } catch (err) {
        if (err.code === '23505') {
            const field = err.detail?.includes('username') ? 'Username' : 'Email';
            return res.status(409).json({ error: `${field} is already taken. Please choose another.` });
        }
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

/* ── POST /api/login ────────────────────────────────────────────── */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT * FROM "KodUser" WHERE username = $1`,
            [username.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Generate JWT
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        const token = jwt.sign(
            { sub: user.username, uid: user.uid, role: user.role },
            SECRET,
            { expiresIn: '24h' }
        );

        // Store token in UserToken table
        const tid = uuidv4();
        await pool.query(
            `INSERT INTO "UserToken" (tid, token, uid, expiry) VALUES ($1, $2, $3, $4)`,
            [tid, token, user.uid, expiry]
        );

        // Set httpOnly cookie
        res.cookie('kodbank_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: `Welcome back, ${user.username}! 🎉`,
            user: { username: user.username, role: user.role, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

/* ── GET /api/balance ───────────────────────────────────────────── */
app.get('/api/balance', async (req, res) => {
    try {
        const payload = verifyToken(req);

        const { rows } = await pool.query(
            `SELECT username, balance, role FROM "KodUser" WHERE uid = $1`,
            [payload.uid]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = rows[0];
        res.json({
            success: true,
            username: user.username,
            balance: parseFloat(user.balance),
            role: user.role,
        });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

/* ── GET /api/me ────────────────────────────────────────────────── */
app.get('/api/me', (req, res) => {
    try {
        const payload = verifyToken(req);
        res.json({ success: true, user: { username: payload.sub, role: payload.role, uid: payload.uid } });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

/* ── POST /api/logout ───────────────────────────────────────────── */
app.post('/api/logout', (req, res) => {
    res.clearCookie('kodbank_token');
    res.json({ success: true, message: 'Logged out successfully.' });
});

/* ── Start server ───────────────────────────────────────────────── */
createTables()
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 Kodbank server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('❌ Failed to initialize DB:', err.message);
        process.exit(1);
    });
