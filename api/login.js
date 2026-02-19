const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./_db');

const SECRET = process.env.JWT_SECRET;

const setCookie = (res, token) => {
    const cookie = [
        `kodbank_token=${token}`,
        'HttpOnly',
        'Path=/',
        'Max-Age=86400',
        'SameSite=Lax',
        // Vercel = HTTPS, so Secure is always fine
        'Secure',
    ].join('; ');
    res.setHeader('Set-Cookie', cookie);
};

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const pool = getPool();
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

        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const token = jwt.sign(
            { sub: user.username, uid: user.uid, role: user.role },
            SECRET,
            { expiresIn: '24h' }
        );

        // Store token
        await pool.query(
            `INSERT INTO "UserToken" (tid, token, uid, expiry) VALUES ($1, $2, $3, $4)`,
            [uuidv4(), token, user.uid, expiry]
        );

        setCookie(res, token);

        return res.json({
            success: true,
            message: `Welcome back, ${user.username}! 🎉`,
            user: { username: user.username, role: user.role, email: user.email },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};
