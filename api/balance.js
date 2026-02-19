const jwt = require('jsonwebtoken');
const { getPool } = require('./_db');

const SECRET = process.env.JWT_SECRET;

const getToken = (req) => {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/kodbank_token=([^;]+)/);
    return match ? match[1] : null;
};

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Not authenticated. Please log in.' });

    try {
        const payload = jwt.verify(token, SECRET);
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT username, balance, role FROM "KodUser" WHERE uid = $1`,
            [payload.uid]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

        const user = rows[0];
        return res.json({
            success: true,
            username: user.username,
            balance: parseFloat(user.balance),
            role: user.role,
        });
    } catch {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
