import pool from '../models/database';

interface CentinelasData {
  id?: number;
  temperatura_agua: number;
  flora_invasora: string;
  residuos: string;
  efluentes: string;
  mortandades: string;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

const FLORA_INVASORA_OPTIONS = ['Ninguna', 'Poca', 'Moderada', 'Mucha'];
const RESIDUOS_OPTIONS = ['Ninguno', 'Pocos', 'Moderados', 'Muchos'];
const EFLUENTES_OPTIONS = ['Ninguno', 'Leves', 'Moderados', 'Severos'];
const MORTANDADES_OPTIONS = ['Ninguna', 'Baja', 'Media', 'Alta'];

export class CentinelasService {
  async hasReachedAcademicYearLimit(recordedDate: string, excludeId?: number): Promise<boolean> {
    const date = new Date(`${recordedDate}T00:00:00Z`);
    const courseStartYear = date.getUTCMonth() >= 7 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count FROM centinelas_data
       WHERE recorded_date >= $1::date AND recorded_date < $2::date
       AND ($3::integer IS NULL OR id <> $3)`,
      [`${courseStartYear}-08-01`, `${courseStartYear + 1}-08-01`, excludeId ?? null],
    );
    return result.rows[0].count >= 1;
  }
  async getCurrentCentinelas(): Promise<CentinelasData | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM centinelas_data ORDER BY recorded_date DESC LIMIT 1'
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching current centinelas data:', error);
      throw error;
    }
  }

  async getMonthlyHistory(): Promise<CentinelasData[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM centinelas_data
         WHERE recorded_date >= (CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8
           THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 8, 1)
           ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int - 1, 8, 1) END)
         AND recorded_date < (CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8
           THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, 8, 1)
           ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 8, 1) END)
         ORDER BY recorded_date ASC`
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching centinelas monthly history:', error);
      throw error;
    }
  }

  async getAllHistory(): Promise<CentinelasData[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM centinelas_data ORDER BY recorded_date DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching all centinelas history:', error);
      throw error;
    }
  }

  async createCentinelasRecord(data: CentinelasData): Promise<CentinelasData> {
    try {
      const result = await pool.query(
        `INSERT INTO centinelas_data (temperatura_agua, flora_invasora, residuos, efluentes, mortandades, recorded_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.temperatura_agua, data.flora_invasora, data.residuos, data.efluentes, data.mortandades, data.recorded_date]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating centinelas record:', error);
      throw error;
    }
  }

  async updateCentinelasRecord(id: number, data: Partial<CentinelasData>): Promise<CentinelasData | null> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      if (data.temperatura_agua !== undefined) {
        fields.push(`temperatura_agua = $${paramIdx++}`);
        values.push(data.temperatura_agua);
      }
      if (data.flora_invasora !== undefined) {
        fields.push(`flora_invasora = $${paramIdx++}`);
        values.push(data.flora_invasora);
      }
      if (data.residuos !== undefined) {
        fields.push(`residuos = $${paramIdx++}`);
        values.push(data.residuos);
      }
      if (data.efluentes !== undefined) {
        fields.push(`efluentes = $${paramIdx++}`);
        values.push(data.efluentes);
      }
      if (data.mortandades !== undefined) {
        fields.push(`mortandades = $${paramIdx++}`);
        values.push(data.mortandades);
      }
      if (data.recorded_date !== undefined) {
        fields.push(`recorded_date = $${paramIdx++}`);
        values.push(data.recorded_date);
      }
      fields.push(`updated_at = NOW()`);

      values.push(id);
      const result = await pool.query(
        `UPDATE centinelas_data SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating centinelas record:', error);
      throw error;
    }
  }

  async deleteCentinelasRecord(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM centinelas_data WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting centinelas record:', error);
      throw error;
    }
  }

  async deleteAllCentinelasRecords(): Promise<number> {
    try {
      const result = await pool.query('DELETE FROM centinelas_data');
      return result.rowCount ?? 0;
    } catch (error) {
      console.error('Error deleting all centinelas records:', error);
      throw error;
    }
  }
}
