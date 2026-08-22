import pool from '../models/database';

interface POMData {
  id?: number;
  temperatura_mar: number;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

export class POMService {
  async getCurrentPOM(): Promise<POMData | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM pom_data ORDER BY recorded_date DESC LIMIT 1'
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching current POM data:', error);
      throw error;
    }
  }

  async getMonthlyHistory(): Promise<POMData[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM pom_data
         WHERE recorded_date >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY recorded_date ASC`
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching POM monthly history:', error);
      throw error;
    }
  }

  async getAllHistory(): Promise<POMData[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM pom_data ORDER BY recorded_date DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching all POM history:', error);
      throw error;
    }
  }

  async createPOMRecord(data: POMData): Promise<POMData> {
    try {
      const result = await pool.query(
        `INSERT INTO pom_data (temperatura_mar, recorded_date)
         VALUES ($1, $2)
         RETURNING *`,
        [data.temperatura_mar, data.recorded_date]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating POM record:', error);
      throw error;
    }
  }

  async updatePOMRecord(id: number, data: Partial<POMData>): Promise<POMData | null> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      if (data.temperatura_mar !== undefined) {
        fields.push(`temperatura_mar = $${paramIdx++}`);
        values.push(data.temperatura_mar);
      }
      if (data.recorded_date !== undefined) {
        fields.push(`recorded_date = $${paramIdx++}`);
        values.push(data.recorded_date);
      }
      fields.push(`updated_at = NOW()`);

      values.push(id);
      const result = await pool.query(
        `UPDATE pom_data SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating POM record:', error);
      throw error;
    }
  }

  async deletePOMRecord(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM pom_data WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting POM record:', error);
      throw error;
    }
  }
}