const { Pool } = require('pg');

// Singleton pool — reused across warm serverless invocations
let pool;

const getPool = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 3, // keep connections low for serverless
            idleTimeoutMillis: 10000,
        });
    }
    return pool;
};

const createTables = async () => {
    const client = await getPool().connect();
    try {
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
        await client.query(`
      CREATE TABLE IF NOT EXISTS "UserToken" (
        tid    VARCHAR(36)  PRIMARY KEY,
        token  TEXT         NOT NULL,
        uid    VARCHAR(36)  REFERENCES "KodUser"(uid) ON DELETE CASCADE,
        expiry TIMESTAMPTZ  NOT NULL
      );
    `);
    } finally {
        client.release();
    }
};

// Run once per cold start
createTables().catch(console.error);

module.exports = { getPool };
