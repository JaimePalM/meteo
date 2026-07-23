import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'meteo_user',
  password: process.env.DB_PASSWORD || 'meteo_dev_password_123',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'meteo_db',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
