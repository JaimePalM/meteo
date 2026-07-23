import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weatherService';
import authMiddleware from '../middleware/auth';

const router = Router();
const weatherService = new WeatherService();

// Protect all admin routes with auth middleware
router.use((req, res, next) => {
  console.log(`[ADMIN] ${req.method} ${req.path}`);
  authMiddleware(req, res, next);
});

// GET /api/admin/weather/history - Get all weather records
router.get('/weather/history', async (req: Request, res: Response) => {
  try {
    console.log('[ADMIN-GET] Fetching weather history');
    const weatherData = await weatherService.getAllHistory();
    console.log(`[ADMIN-GET] weatherData type: ${Array.isArray(weatherData) ? 'array' : typeof weatherData}`);
    console.log(`[ADMIN-GET] weatherData length: ${Array.isArray(weatherData) ? weatherData.length : 'N/A'}`);
    
    // Ensure we're returning an array
    const result = Array.isArray(weatherData) ? weatherData : [weatherData];
    console.log(`[ADMIN-GET] Sending ${result.length} records`);
    res.json(result);
  } catch (error) {
    console.error('[ADMIN-GET] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/weather - Create new weather record
router.post('/weather', async (req: Request, res: Response) => {
  try {
    const { temperature_max, temperature_min, humidity, pressure, precipitation, recorded_date } = req.body;

    // Validation - check if fields exist
    if (temperature_max === undefined || temperature_max === null || temperature_max === '' ||
        temperature_min === undefined || temperature_min === null || temperature_min === '' ||
        humidity === undefined || humidity === null || humidity === '' ||
        pressure === undefined || pressure === null || pressure === '' ||
        !recorded_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert to numbers
    const temp_max = parseFloat(temperature_max);
    const temp_min = parseFloat(temperature_min);
    const hum = parseInt(humidity);
    const pres = parseFloat(pressure);

    // Validate number conversion
    if (isNaN(temp_max) || isNaN(temp_min) || isNaN(hum) || isNaN(pres)) {
      return res.status(400).json({ error: 'Invalid number values' });
    }

    // Validate ranges
    if (hum < 0 || hum > 100) {
      return res.status(400).json({ error: 'Humidity must be between 0 and 100' });
    }

    const weatherData = {
      temperature_max: temp_max,
      temperature_min: temp_min,
      humidity: hum,
      pressure: pres,
      precipitation: precipitation ? parseFloat(precipitation) : 0,
      recorded_date,
    };

    const result = await weatherService.createWeatherRecord(weatherData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating weather:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/admin/weather/:id - Update weather record
router.put('/weather/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await weatherService.updateWeatherRecord(parseInt(id), updates);
    if (!result) {
      return res.status(404).json({ error: 'Weather record not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/weather/:id - Delete weather record
router.delete('/weather/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await weatherService.deleteWeatherRecord(parseInt(id));

    if (!success) {
      return res.status(404).json({ error: 'Weather record not found' });
    }

    res.json({ message: 'Weather record deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
