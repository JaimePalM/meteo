import { Router, Request, Response } from 'express';
import { POMService } from '../services/pomService';

const router = Router();
const pomService = new POMService();

// GET /api/pom/current
router.get('/current', async (req: Request, res: Response) => {
  try {
    const data = await pomService.getCurrentPOM();
    if (!data) {
      return res.status(404).json({ error: 'No POM data available' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching current POM:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pom/monthly
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const data = await pomService.getMonthlyHistory();
    res.json(data);
  } catch (error) {
    console.error('Error fetching POM monthly history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;