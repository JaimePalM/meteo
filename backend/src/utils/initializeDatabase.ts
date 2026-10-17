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

    // Parse SQL statements more carefully
    const statements = parseSqlStatements(sqlScript);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    if (statements.length === 0) {
      console.warn('⚠️  No valid SQL statements found, will use inline creation');
      await createTablesInline();
      return;
    }

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const preview = statement.substring(0, 60).replace(/\n/g, ' ');
        console.log(`  [${i + 1}/${statements.length}] Executing: ${preview}...`);
        await pool.query(statement);
      } catch (error: any) {
        // Ignore "already exists" errors and ON CONFLICT errors
        if (!error.message.includes('already exists') && !error.message.includes('ON CONFLICT')) {
          console.error(`  ❌ Error in statement ${i + 1}:`, error.message);
          console.error(`     Statement: ${statement.substring(0, 100)}`);
          // Don't throw, continue to next statement
        } else {
          console.log(`  ℹ️  Statement ${i + 1} skipped (already exists)`);
        }
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
          recorded_date DATE NOT NULL UNIQUE,
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
          calidad_biologica VARCHAR(50) NOT NULL DEFAULT 'Buena',
          estado_rio VARCHAR(50) NOT NULL DEFAULT 'Bueno',
          bosque_rivera VARCHAR(50) NOT NULL DEFAULT 'Bueno',
          recorded_date DATE NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ river_data table ready');

    // Create centinelas_data table
    await client.query(`
      CREATE TABLE IF NOT EXISTS centinelas_data (
          id SERIAL PRIMARY KEY,
          temperatura_agua DECIMAL(5, 2) NOT NULL,
          flora_invasora VARCHAR(50) NOT NULL DEFAULT 'Ninguna',
          residuos VARCHAR(50) NOT NULL DEFAULT 'Ninguno',
          efluentes VARCHAR(50) NOT NULL DEFAULT 'Ninguno',
          mortandades VARCHAR(50) NOT NULL DEFAULT 'Ninguna',
          recorded_date DATE NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ centinelas_data table ready');

    // Create pom_data table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pom_data (
          id SERIAL PRIMARY KEY,
          temperatura_mar DECIMAL(5, 2) NOT NULL,
          recorded_date DATE NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ pom_data table ready');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_weather_recorded_date ON weather_data(recorded_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_river_recorded_date ON river_data(recorded_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_centinelas_recorded_date ON centinelas_data(recorded_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pom_recorded_date ON pom_data(recorded_date DESC);`);
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
        WITH academic_year AS (
          SELECT CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8 THEN EXTRACT(YEAR FROM CURRENT_DATE)::int ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int - 1 END AS start_year
        )
        INSERT INTO river_data (temperature, calidad_biologica, estado_rio, bosque_rivera, recorded_date)
        SELECT temperature, calidad, estado, bosque, measured_on
        FROM academic_year,
          (VALUES
            (15.8::numeric, 'Buena', 'Bueno', 'Bueno', make_date((SELECT start_year FROM academic_year) - 1, 10, 20)),
            (17.1::numeric, 'Muy buena', 'Muy bueno', 'Bueno', make_date((SELECT start_year FROM academic_year), 5, 15))
          ) AS samples(temperature, calidad, estado, bosque, measured_on)
        ON CONFLICT DO NOTHING;
      `);
      console.log('  ✅ Sample river data inserted');
    }

    const centinelasCount = await client.query('SELECT COUNT(*) FROM centinelas_data;');
    if (parseInt(centinelasCount.rows[0].count) === 0) {
      console.log('  🛰️ Inserting sample centinelas data...');
      await client.query(`
        WITH academic_year AS (
          SELECT CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8 THEN EXTRACT(YEAR FROM CURRENT_DATE)::int ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int - 1 END AS start_year
        )
        INSERT INTO centinelas_data (temperatura_agua, flora_invasora, residuos, efluentes, mortandades, recorded_date)
        SELECT temperatura, flora, residuos, efluentes, mortandades, measured_on
        FROM academic_year,
          (VALUES
            (14.6::numeric, 'Poca', 'Pocos', 'Ninguno', 'Ninguna', GREATEST(make_date((SELECT start_year FROM academic_year), 8, 1), CURRENT_DATE - 21)::date),
            (17.3::numeric, 'Moderada', 'Pocos', 'Leves', 'Ninguna', CURRENT_DATE)
          ) AS samples(temperatura, flora, residuos, efluentes, mortandades, measured_on)
        ON CONFLICT DO NOTHING;
      `);
      console.log('  ✅ Sample centinelas data inserted');
    }

    const pomCount = await client.query('SELECT COUNT(*) FROM pom_data;');
    if (parseInt(pomCount.rows[0].count) === 0) {
      console.log('  🌊 Inserting sample POM data...');
      await client.query(`
        INSERT INTO pom_data (temperatura_mar, recorded_date)
        SELECT
            ROUND((RANDOM() * 8 + 14)::numeric, 2),
            (DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::interval)::DATE
        FROM generate_series(0, 11) AS t(n)
        ON CONFLICT DO NOTHING;
      `);
      console.log('  ✅ Sample POM data inserted');
    }

    console.log('✅ Database initialized successfully (inline)');
  } finally {
    client.release();
  }
}

function parseSqlStatements(sqlScript: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';

  const lines = sqlScript.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('--')) {
      continue;
    }

    currentStatement += ' ' + trimmedLine;

    // If the line ends with a semicolon, we have a complete statement
    if (trimmedLine.endsWith(';')) {
      const cleanedStatement = currentStatement
        .replace(/--.*$/gm, '') // Remove inline comments
        .trim()
        .slice(0, -1); // Remove the trailing semicolon

      if (cleanedStatement.length > 0) {
        statements.push(cleanedStatement);
      }

      currentStatement = '';
    }
  }

  // Add any remaining statement
  if (currentStatement.trim().length > 0) {
    const cleanedStatement = currentStatement.trim();
    if (!cleanedStatement.endsWith(';')) {
      statements.push(cleanedStatement);
    }
  }

  return statements;
}
