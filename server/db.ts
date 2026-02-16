import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate required env vars at startup
const requiredEnv = ['DB_PASSWORD'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    console.error('Set environment variables in Railway dashboard or .env file');
    process.exit(1);
  }
}

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'suri-tool-db.cfamw93xhxpu.us-east-2.rds.amazonaws.com',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'atu_neuropro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD!,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
