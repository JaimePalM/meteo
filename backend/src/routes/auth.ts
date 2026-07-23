import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

// POST /api/auth/login
router.post('/login', async (req: LoginRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.login(username, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
