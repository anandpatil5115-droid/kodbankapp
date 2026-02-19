require('dotenv').config();
const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.query('SELECT 1')
    .then(function (r) { console.log('OK - DB connected'); process.exit(0); })
    .catch(function (e) { console.log('FAIL:', e.message, 'Code:', e.code); process.exit(1); });
