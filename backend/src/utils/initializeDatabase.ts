import fs from 'fs';
import path from 'path';
import pool from '../models/database';

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Initializing database...');

    // Read the SQL initialization script
    const sqlScriptPath = path.join(__dirname, '../../scripts/init.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf-8');

    // Split the script into individual statements and execute them
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
