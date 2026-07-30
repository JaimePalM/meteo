import fs from 'fs';
import path from 'path';
import pool from '../models/database';

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Initializing database...');

    // Try multiple paths to find init.sql
    const possiblePaths = [
      path.join(__dirname, '../../scripts/init.sql'),
      path.join(__dirname, '../scripts/init.sql'),
      path.join(__dirname, './init.sql'),
      path.join(process.cwd(), 'backend/scripts/init.sql'),
      path.join(process.cwd(), 'scripts/init.sql'),
      '/app/scripts/init.sql',
    ];

    let sqlScript: string | null = null;
    let foundPath: string | null = null;

    for (const sqlPath of possiblePaths) {
      try {
        if (fs.existsSync(sqlPath)) {
          sqlScript = fs.readFileSync(sqlPath, 'utf-8');
          foundPath = sqlPath;
          console.log(`✅ Found SQL script at: ${sqlPath}`);
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }

    if (!sqlScript) {
      console.warn('⚠️  SQL script not found, creating tables inline...');
      // Fallback: Create tables inline
      await createTablesInline();
      return;
    }

    // Split the script into individual statements and execute them
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`  [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
      } catch (error: any) {
        // Ignore "already exists" errors and ON CONFLICT errors
        if (!error.message.includes('already exists') && !error.message.includes('ON CONFLICT')) {
          console.error(`  ❌ Error in statement ${i + 1}:`, error.message);
          throw error;
        }
        console.log(`  ℹ️  Statement ${i + 1} skipped (already exists)`);
      }
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

async function createTablesInline(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('📝 Creating tables inline...');

    // Create admin_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ admin_users table ready');

    // Create weather_data table
    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_data (
          id SERIAL PRIMARY KEY,
          temperature_max DECIMAL(5, 2) NOT NULL,
          temperature_min DECIMAL(5, 2) NOT NULL,
          humidity INTEGER NOT NULL CHECK (humidity >= 0 AND humidity <= 100),
          pressure DECIMAL(7, 2) NOT NULL,
          precipitation DECIMAL(6, 2) NOT NULL DEFAULT 0,
          recorded_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ weather_data table ready');

    // Create river_data table
    await client.query(`
      CREATE TABLE IF NOT EXISTS river_data (
          id SERIAL PRIMARY KEY,
          temperature DECIMAL(5, 2) NOT NULL,
          recorded_date DATE NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ river_data table ready');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_weather_recorded_date ON weather_data(recorded_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_river_recorded_date ON river_data(recorded_date DESC);`);
    console.log('  ✅ Indexes created');

    // Insert default admin user
    await client.query(`
      INSERT INTO admin_users (username, password_hash)
      VALUES ('admin', '$2a$10$uQVBoncGnYX7ueVPmYcw8OfYwwrGL9GJIyMvXKPbkhb/uzaH2p9sK')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('  ✅ Default admin user ready');

    // Insert sample data only if tables are empty
    const weatherCount = await client.query('SELECT COUNT(*) FROM weather_data;');
    if (parseInt(weatherCount.rows[0].count) === 0) {
      console.log('  📊 Inserting sample weather data...');
      await client.query(`
        INSERT INTO weather_data (temperature_max, temperature_min, humidity, pressure, precipitation, recorded_date)
        SELECT
            ROUND((RANDOM() * 15 + 15)::numeric, 1),
            ROUND((RANDOM() * 10 + 5)::numeric, 1),
            (RANDOM() * 40 + 40)::integer,
            ROUND((RANDOM() * 20 + 1000)::numeric, 2),
            ROUND((RANDOM() * 5)::numeric, 2),
            CURRENT_DATE - (n || ' days')::interval
        FROM generate_series(0, 29) AS t(n)
        ON CONFLICT DO NOTHING;
      `);
      console.log('  ✅ Sample weather data inserted');
    }

    const riverCount = await client.query('SELECT COUNT(*) FROM river_data;');
    if (parseInt(riverCount.rows[0].count) === 0) {
      console.log('  🌊 Inserting sample river data...');
      await client.query(`
        INSERT INTO river_data (temperature, recorded_date)
        SELECT
            ROUND((RANDOM() * 8 + 13)::numeric, 2),
            CURRENT_DATE - (n || ' days')::interval
        FROM generate_series(0, 29) AS t(n)
        ON CONFLICT DO NOTHING;
      `);
      console.log('  ✅ Sample river data inserted');
    }

    console.log('✅ Database initialized successfully (inline)');
  } finally {
    client.release();
  }
}
