import { Router, Request, Response } from 'express';
import { CentinelasService } from '../services/centinelasService';

const router = Router();
const centinelasService = new CentinelasService();

// GET /api/centinelas/current
router.get('/current', async (req: Request, res: Response) => {
  try {
    const data = await centinelasService.getCurrentCentinelas();
    if (!data) {
      return res.status(404).json({ error: 'No centinelas data available' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching current centinelas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/centinelas/monthly
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const data = await centinelasService.getMonthlyHistory();
    res.json(data);
  } catch (error) {
    console.error('Error fetching centinelas monthly history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;