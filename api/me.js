const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const getToken = (req) => {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/kodbank_token=([^;]+)/);
    return match ? match[1] : null;
};

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    try {
        const payload = jwt.verify(token, SECRET);
        return res.json({
            success: true,
            user: { username: payload.sub, role: payload.role, uid: payload.uid },
        });
    } catch {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
