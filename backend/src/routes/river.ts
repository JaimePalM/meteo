import { Router, Request, Response } from 'express';
import { RiverService } from '../services/riverService';

const router = Router();
const riverService = new RiverService();

// GET /api/river/current
router.get('/current', async (req: Request, res: Response) => {
  try {
    const data = await riverService.getCurrentRiver();
    if (!data) {
      return res.status(404).json({ error: 'No river data available' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching current river:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/river/monthly
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const data = await riverService.getMonthlyHistory();
    res.json(data);
  } catch (error) {
    console.error('Error fetching river monthly history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
