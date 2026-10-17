import { Router, Request, Response } from 'express';
import pool from '../models/database';

const router = Router();

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const [settingsResult, imagesResult] = await Promise.all([
      pool.query('SELECT setting_key, setting_value FROM carousel_settings'),
      pool.query('SELECT panel_id, updated_at FROM carousel_images'),
    ]);
    const settings = Object.fromEntries(settingsResult.rows.map((row) => [row.setting_key, row.setting_value]));
    const intervalMs = Number(settings.interval_ms ?? 10000);
    res.json({
      intervalMs: Number.isFinite(intervalMs) && intervalMs >= 0 ? intervalMs : 10000,
      showIndicators: settings.show_indicators !== 'false',
      images: imagesResult.rows.map((image) => ({ panelId: image.panel_id, version: new Date(image.updated_at).getTime() })),
    });
  } catch (error) {
    console.error('[CAROUSEL] Failed to get settings:', error);
    res.status(500).json({ error: 'Unable to load carousel settings' });
  }
});

router.get('/images/:panelId', async (req: Request, res: Response) => {
  try {
    const panelId = req.params.panelId;
    if (!/^[a-z0-9-]+$/.test(panelId)) return res.status(400).json({ error: 'Invalid panel id' });

    const result = await pool.query('SELECT image_data, content_type FROM carousel_images WHERE panel_id = $1', [panelId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Image not found' });

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.type(result.rows[0].content_type);
    res.send(Buffer.from(result.rows[0].image_data, 'base64'));
  } catch (error) {
    console.error('[CAROUSEL] Failed to get image:', error);
    res.status(500).json({ error: 'Unable to load carousel image' });
  }
});

export default router;
