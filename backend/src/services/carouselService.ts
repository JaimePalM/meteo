import pool from '../models/database';

let initialization: Promise<void> | undefined;

/**
 * Keeps carousel persistence backwards-compatible with deployments that do not
 * execute backend/scripts/init.sql as part of their release process.
 */
export const ensureCarouselStorage = (): Promise<void> => {
  if (!initialization) {
    initialization = (async () => {
      await pool.query(`CREATE TABLE IF NOT EXISTS carousel_settings (
        setting_key VARCHAR(80) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS carousel_images (
        panel_id VARCHAR(40) PRIMARY KEY,
        content_type VARCHAR(50) NOT NULL,
        image_data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(`INSERT INTO carousel_settings (setting_key, setting_value) VALUES
        ('interval_ms', '10000'), ('show_indicators', 'true')
        ON CONFLICT (setting_key) DO NOTHING`);
    })().catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
};
