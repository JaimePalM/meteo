import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weatherService';
import { RiverService } from '../services/riverService';
import { CentinelasService } from '../services/centinelasService';
import { POMService } from '../services/pomService';
import authMiddleware from '../middleware/auth';
import pool from '../models/database';

const router = Router();
const weatherService = new WeatherService();
const riverService = new RiverService();
const centinelasService = new CentinelasService();
const pomService = new POMService();
const EDITABLE_IMAGE_PANELS = new Set(['panel-1', 'panel-6', 'panel-7', 'panel-8', 'panel-9', 'panel-10', 'panel-11', 'panel-12', 'panel-14', 'panel-15', 'panel-18', 'panel-20']);

const isRiverCollectionDate = (recordedDate: string) => {
  const date = new Date(`${recordedDate}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && [4, 9].includes(date.getUTCMonth());
};

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

// ─── River Admin Routes ───────────────────────────────────────────────────────

// GET /api/admin/river/history
router.get('/river/history', async (req: Request, res: Response) => {
  try {
    const data = await riverService.getAllHistory();
    res.json(Array.isArray(data) ? data : [data]);
  } catch (error) {
    console.error('[ADMIN-RIVER-GET] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/river
router.post('/river', async (req: Request, res: Response) => {
  try {
    const { temperature, recorded_date, calidad_biologica, estado_rio, bosque_rivera } = req.body;
    if (temperature === undefined || temperature === null || temperature === '' || !recorded_date) {
      return res.status(400).json({ error: 'Missing required fields: temperature, recorded_date' });
    }
    const temp = parseFloat(temperature);
    if (isNaN(temp)) {
      return res.status(400).json({ error: 'Invalid temperature value' });
    }
    if (!isRiverCollectionDate(recorded_date)) {
      return res.status(400).json({ error: 'Los datos de río solo se pueden registrar en mayo u octubre.' });
    }
    if (await riverService.hasRecordForCourseSlot(recorded_date)) {
      return res.status(409).json({ error: 'Ya existe una medición para ese periodo del curso escolar.' });
    }
    const result = await riverService.createRiverRecord({ 
      temperature: temp, 
      recorded_date,
      calidad_biologica: calidad_biologica || 'Buena',
      estado_rio: estado_rio || 'Bueno',
      bosque_rivera: bosque_rivera || 'Bueno'
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('[ADMIN-RIVER-POST] Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/admin/river/:id
router.put('/river/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { temperature, recorded_date, calidad_biologica, estado_rio, bosque_rivera } = req.body;
    const updateData: { temperature?: number; recorded_date?: string; calidad_biologica?: string; estado_rio?: string; bosque_rivera?: string } = {};
    if (temperature !== undefined && temperature !== '') updateData.temperature = parseFloat(temperature);
    if (recorded_date) updateData.recorded_date = recorded_date;
    if (calidad_biologica) updateData.calidad_biologica = calidad_biologica;
    if (estado_rio) updateData.estado_rio = estado_rio;
    if (bosque_rivera) updateData.bosque_rivera = bosque_rivera;

    if (recorded_date) {
      if (!isRiverCollectionDate(recorded_date)) {
        return res.status(400).json({ error: 'Los datos de río solo se pueden registrar en mayo u octubre.' });
      }
      if (await riverService.hasRecordForCourseSlot(recorded_date, parseInt(id))) {
        return res.status(409).json({ error: 'Ya existe una medición para ese periodo del curso escolar.' });
      }
    }

    const result = await riverService.updateRiverRecord(parseInt(id), updateData);
    if (!result) return res.status(404).json({ error: 'River record not found' });
    res.json(result);
  } catch (error) {
    console.error('[ADMIN-RIVER-PUT] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/river/:id
router.delete('/river/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await riverService.deleteRiverRecord(parseInt(id));
    if (!success) return res.status(404).json({ error: 'River record not found' });
    res.json({ message: 'River record deleted successfully' });
  } catch (error) {
    console.error('[ADMIN-RIVER-DELETE] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Centinelas Admin Routes ────────────────────────────────────────────────────

// GET /api/admin/centinelas/history
router.get('/centinelas/history', async (req: Request, res: Response) => {
  try {
    const data = await centinelasService.getAllHistory();
    res.json(Array.isArray(data) ? data : [data]);
  } catch (error) {
    console.error('[ADMIN-CENTINELAS-GET] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/centinelas
router.post('/centinelas', async (req: Request, res: Response) => {
  try {
    const { temperatura_agua, recorded_date, flora_invasora, residuos, efluentes, mortandades } = req.body;
    if (temperatura_agua === undefined || temperatura_agua === null || temperatura_agua === '' || !recorded_date) {
      return res.status(400).json({ error: 'Missing required fields: temperatura_agua, recorded_date' });
    }
    const temp = parseFloat(temperatura_agua);
    if (isNaN(temp)) {
      return res.status(400).json({ error: 'Invalid temperatura_agua value' });
    }
    if (await centinelasService.hasRecordForAcademicYear(recorded_date)) {
      return res.status(409).json({ error: 'Solo puede existir una observación de Centinelas por curso escolar.' });
    }
    const result = await centinelasService.createCentinelasRecord({ 
      temperatura_agua: temp, 
      recorded_date,
      flora_invasora: flora_invasora || 'Ninguna',
      residuos: residuos || 'Ninguno',
      efluentes: efluentes || 'Ninguno',
      mortandades: mortandades || 'Ninguna'
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('[ADMIN-CENTINELAS-POST] Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/admin/centinelas/:id
router.put('/centinelas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { temperatura_agua, recorded_date, flora_invasora, residuos, efluentes, mortandades } = req.body;
    const updateData: { temperatura_agua?: number; recorded_date?: string; flora_invasora?: string; residuos?: string; efluentes?: string; mortandades?: string } = {};
    if (temperatura_agua !== undefined && temperatura_agua !== '') updateData.temperatura_agua = parseFloat(temperatura_agua);
    if (recorded_date) updateData.recorded_date = recorded_date;
    if (flora_invasora) updateData.flora_invasora = flora_invasora;
    if (residuos) updateData.residuos = residuos;
    if (efluentes) updateData.efluentes = efluentes;
    if (mortandades) updateData.mortandades = mortandades;

    if (recorded_date && await centinelasService.hasRecordForAcademicYear(recorded_date, parseInt(id))) {
      return res.status(409).json({ error: 'Solo puede existir una observación de Centinelas por curso escolar.' });
    }

    const result = await centinelasService.updateCentinelasRecord(parseInt(id), updateData);
    if (!result) return res.status(404).json({ error: 'Centinelas record not found' });
    res.json(result);
  } catch (error) {
    console.error('[ADMIN-CENTINELAS-PUT] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/centinelas/:id
router.delete('/centinelas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await centinelasService.deleteCentinelasRecord(parseInt(id));
    if (!success) return res.status(404).json({ error: 'Centinelas record not found' });
    res.json({ message: 'Centinelas record deleted successfully' });
  } catch (error) {
    console.error('[ADMIN-CENTINELAS-DELETE] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POM Admin Routes ──────────────────────────────────────────────────────────

// GET /api/admin/pom/history
router.get('/pom/history', async (req: Request, res: Response) => {
  try {
    const data = await pomService.getAllHistory();
    res.json(Array.isArray(data) ? data : [data]);
  } catch (error) {
    console.error('[ADMIN-POM-GET] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/pom
router.post('/pom', async (req: Request, res: Response) => {
  try {
    const { temperatura_mar, recorded_date } = req.body;
    if (temperatura_mar === undefined || temperatura_mar === null || temperatura_mar === '' || !recorded_date) {
      return res.status(400).json({ error: 'Missing required fields: temperatura_mar, recorded_date' });
    }
    const temp = parseFloat(temperatura_mar);
    if (isNaN(temp)) {
      return res.status(400).json({ error: 'Invalid temperatura_mar value' });
    }
    if (await pomService.hasRecordForMonth(recorded_date)) {
      return res.status(409).json({ error: 'Solo puede existir una temperatura del mar por mes.' });
    }
    const result = await pomService.createPOMRecord({ 
      temperatura_mar: temp, 
      recorded_date
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('[ADMIN-POM-POST] Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/admin/pom/:id
router.put('/pom/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { temperatura_mar, recorded_date } = req.body;
    const updateData: { temperatura_mar?: number; recorded_date?: string } = {};
    if (temperatura_mar !== undefined && temperatura_mar !== '') updateData.temperatura_mar = parseFloat(temperatura_mar);
    if (recorded_date) updateData.recorded_date = recorded_date;

    if (recorded_date && await pomService.hasRecordForMonth(recorded_date, parseInt(id))) {
      return res.status(409).json({ error: 'Solo puede existir una temperatura del mar por mes.' });
    }

    const result = await pomService.updatePOMRecord(parseInt(id), updateData);
    if (!result) return res.status(404).json({ error: 'POM record not found' });
    res.json(result);
  } catch (error) {
    console.error('[ADMIN-POM-PUT] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/pom/:id
router.delete('/pom/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await pomService.deletePOMRecord(parseInt(id));
    if (!success) return res.status(404).json({ error: 'POM record not found' });
    res.json({ message: 'POM record deleted successfully' });
  } catch (error) {
    console.error('[ADMIN-POM-DELETE] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Carousel configuration and image administration ───────────────────────

router.get('/carousel/images', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT panel_id, content_type, updated_at FROM carousel_images ORDER BY panel_id');
    res.json(result.rows);
  } catch (error) {
    console.error('[ADMIN-CAROUSEL-IMAGES] Error:', error);
    res.status(500).json({ error: 'Unable to load carousel images' });
  }
});

router.put('/carousel/settings', async (req: Request, res: Response) => {
  try {
    const intervalMs = Number(req.body.intervalMs);
    const showIndicators = req.body.showIndicators;
    if (!Number.isInteger(intervalMs) || intervalMs < 0 || intervalMs > 3_600_000 || typeof showIndicators !== 'boolean') {
      return res.status(400).json({ error: 'Configuración de carrusel inválida.' });
    }
    await pool.query(
      `INSERT INTO carousel_settings (setting_key, setting_value, updated_at) VALUES
        ('interval_ms', $1, NOW()), ('show_indicators', $2, NOW())
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
      [String(intervalMs), String(showIndicators)],
    );
    res.json({ intervalMs, showIndicators });
  } catch (error) {
    console.error('[ADMIN-CAROUSEL-SETTINGS] Error:', error);
    res.status(500).json({ error: 'Unable to save carousel settings' });
  }
});

router.put('/carousel/images/:panelId', async (req: Request, res: Response) => {
  try {
    const { panelId } = req.params;
    const { imageData, contentType } = req.body;
    if (!EDITABLE_IMAGE_PANELS.has(panelId)) return res.status(400).json({ error: 'Esta diapositiva no admite una imagen editable.' });
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType) || typeof imageData !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(imageData)) {
      return res.status(400).json({ error: 'Formato de imagen no válido. Usa JPEG, PNG o WebP.' });
    }
    if (Buffer.byteLength(imageData, 'base64') > 8 * 1024 * 1024) {
      return res.status(413).json({ error: 'La imagen no puede superar 8 MB.' });
    }
    await pool.query(
      `INSERT INTO carousel_images (panel_id, content_type, image_data, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (panel_id) DO UPDATE SET content_type = EXCLUDED.content_type, image_data = EXCLUDED.image_data, updated_at = NOW()`,
      [panelId, contentType, imageData],
    );
    res.json({ panelId, contentType });
  } catch (error) {
    console.error('[ADMIN-CAROUSEL-UPLOAD] Error:', error);
    res.status(500).json({ error: 'Unable to save carousel image' });
  }
});

export default router;
