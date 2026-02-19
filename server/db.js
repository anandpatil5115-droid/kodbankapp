require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const createTables = async () => {
    const client = await pool.connect();
    try {
        // KodUser table
        await client.query(`
      CREATE TABLE IF NOT EXISTS "KodUser" (
        uid       VARCHAR(36)  PRIMARY KEY,
        username  VARCHAR(50)  UNIQUE NOT NULL,
        email     VARCHAR(100) UNIQUE NOT NULL,
        password  VARCHAR(255) NOT NULL,
        balance   NUMERIC(15,2) DEFAULT 100000,
        phone     VARCHAR(20),
        role      VARCHAR(20)  DEFAULT 'customer'
      );
    `);

        // UserToken table
        await client.query(`
      CREATE TABLE IF NOT EXISTS "UserToken" (
        tid    VARCHAR(36)  PRIMARY KEY,
        token  TEXT         NOT NULL,
        uid    VARCHAR(36)  REFERENCES "KodUser"(uid) ON DELETE CASCADE,
        expiry TIMESTAMPTZ  NOT NULL
      );
    `);

        console.log('✅ Tables ready (KodUser, UserToken)');
    } finally {
        client.release();
    }
};

module.exports = { pool, createTables };
