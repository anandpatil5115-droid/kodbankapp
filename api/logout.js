module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Clear the JWT cookie
    res.setHeader('Set-Cookie', 'kodbank_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
    return res.json({ success: true, message: 'Logged out successfully.' });
};
