import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weatherService';

const router = Router();
const weatherService = new WeatherService();

// GET /api/weather/current - Get latest weather data
router.get('/current', async (req: Request, res: Response) => {
  try {
    const weather = await weatherService.getCurrentWeather();
    if (!weather) {
      return res.status(404).json({ error: 'No weather data available' });
    }
    res.json(weather);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/weather/monthly - Get last 30 days of weather data
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const weatherData = await weatherService.getMonthlyHistory();
    res.json(weatherData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
