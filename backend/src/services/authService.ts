import pool from '../models/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface AdminUser {
  id: number;
  username: string;
  password_hash?: string;
  created_at?: string;
}

export class AuthService {
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser } | null> {
    try {
      const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
      const user = result.rows[0];

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return null;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'meteo_jwt_secret_key_dev_only_change_in_production',
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<AdminUser | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meteo_jwt_secret_key_dev_only_change_in_production') as AdminUser;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
