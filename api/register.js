const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./_db');

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required.' });
    }
    if (username.trim().length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
        const uid = uuidv4();
        const hashedPass = await bcrypt.hash(password, 12);
        const pool = getPool();

        await pool.query(
            `INSERT INTO "KodUser" (uid, username, email, password, phone, role, balance)
       VALUES ($1, $2, $3, $4, $5, 'customer', 100000)`,
            [uid, username.trim(), email.toLowerCase().trim(), hashedPass, phone || null]
        );

        return res.status(201).json({
            success: true,
            message: `Account created! Welcome to Kodbank, ${username}. ₹1,00,000 added to your account.`,
        });
    } catch (err) {
        if (err.code === '23505') {
            const field = err.detail?.includes('username') ? 'Username' : 'Email';
            return res.status(409).json({ error: `${field} is already taken.` });
        }
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};
