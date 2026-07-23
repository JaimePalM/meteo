import pool from '../models/database';

interface WeatherData {
  id?: number;
  temperature_max: number;
  temperature_min: number;
  humidity: number;
  pressure: number;
  precipitation: number;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

export class WeatherService {
  async getCurrentWeather(): Promise<WeatherData | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM weather_data ORDER BY recorded_date DESC LIMIT 1'
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  async getMonthlyHistory(): Promise<WeatherData[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM weather_data 
         WHERE recorded_date >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY recorded_date ASC`
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching monthly history:', error);
      throw error;
    }
  }

  async getAllHistory(): Promise<WeatherData[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM weather_data ORDER BY recorded_date DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching all history:', error);
      throw error;
    }
  }

  async createWeatherRecord(data: WeatherData): Promise<WeatherData> {
    try {
      const result = await pool.query(
        `INSERT INTO weather_data (temperature_max, temperature_min, humidity, pressure, precipitation, recorded_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.temperature_max, data.temperature_min, data.humidity, data.pressure, data.precipitation, data.recorded_date]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating weather record:', error);
      throw error;
    }
  }

  async updateWeatherRecord(id: number, data: Partial<WeatherData>): Promise<WeatherData | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.temperature_max !== undefined) {
        updates.push(`temperature_max = $${paramCount}`);
        values.push(data.temperature_max);
        paramCount++;
      }
      if (data.temperature_min !== undefined) {
        updates.push(`temperature_min = $${paramCount}`);
        values.push(data.temperature_min);
        paramCount++;
      }
      if (data.humidity !== undefined) {
        updates.push(`humidity = $${paramCount}`);
        values.push(data.humidity);
        paramCount++;
      }
      if (data.pressure !== undefined) {
        updates.push(`pressure = $${paramCount}`);
        values.push(data.pressure);
        paramCount++;
      }
      if (data.precipitation !== undefined) {
        updates.push(`precipitation = $${paramCount}`);
        values.push(data.precipitation);
        paramCount++;
      }
      if (data.recorded_date !== undefined) {
        updates.push(`recorded_date = $${paramCount}`);
        values.push(data.recorded_date);
        paramCount++;
      }

      if (updates.length === 0) return null;

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `UPDATE weather_data SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating weather record:', error);
      throw error;
    }
  }

  async deleteWeatherRecord(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM weather_data WHERE id = $1', [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error('Error deleting weather record:', error);
      throw error;
    }
  }
}
