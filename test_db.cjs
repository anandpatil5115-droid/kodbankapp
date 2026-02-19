require('dotenv').config({ path: 'server/.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.query('SELECT 1')
    .then(() => { console.log('✅ DB Connected OK'); process.exit(0); })
    .catch(e => { console.log('❌ DB Error:', e.message, '\nCode:', e.code); process.exit(1); });
