import pool from '../models/database';

interface RiverData {
  id?: number;
  temperature: number;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

export class RiverService {
  async getCurrentRiver(): Promise<RiverData | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM river_data ORDER BY recorded_date DESC LIMIT 1'
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching current river data:', error);
      throw error;
    }
  }

  async getMonthlyHistory(): Promise<RiverData[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM river_data
         WHERE recorded_date >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY recorded_date ASC`
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching river monthly history:', error);
      throw error;
    }
  }

  async getAllHistory(): Promise<RiverData[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM river_data ORDER BY recorded_date DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching all river history:', error);
      throw error;
    }
  }

  async createRiverRecord(data: RiverData): Promise<RiverData> {
    try {
      const result = await pool.query(
        `INSERT INTO river_data (temperature, recorded_date)
         VALUES ($1, $2)
         RETURNING *`,
        [data.temperature, data.recorded_date]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating river record:', error);
      throw error;
    }
  }

  async updateRiverRecord(id: number, data: Partial<RiverData>): Promise<RiverData | null> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      if (data.temperature !== undefined) {
        fields.push(`temperature = $${paramIdx++}`);
        values.push(data.temperature);
      }
      if (data.recorded_date !== undefined) {
        fields.push(`recorded_date = $${paramIdx++}`);
        values.push(data.recorded_date);
      }
      fields.push(`updated_at = NOW()`);

      values.push(id);
      const result = await pool.query(
        `UPDATE river_data SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating river record:', error);
      throw error;
    }
  }

  async deleteRiverRecord(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM river_data WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting river record:', error);
      throw error;
    }
  }
}
