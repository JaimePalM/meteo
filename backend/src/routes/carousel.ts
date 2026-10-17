import { Router, Request, Response } from 'express';
import pool from '../models/database';
import { ensureCarouselStorage } from '../services/carouselService';

const router = Router();

const parseSlideBackgrounds = (rawValue: unknown): Record<string, string> => {
  if (typeof rawValue !== 'string') return {};
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const backgrounds: Record<string, string> = {};
    for (const [panelId, color] of Object.entries(parsed)) {
      if (/^panel-(?:[1-9]|1[0-9]|20)$/.test(panelId) && typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color)) {
        backgrounds[panelId] = color;
      }
    }
    return backgrounds;
  } catch {
    return {};
  }
};

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    await ensureCarouselStorage();
    const [settingsResult, imagesResult] = await Promise.all([
      pool.query('SELECT setting_key, setting_value FROM carousel_settings'),
      pool.query('SELECT panel_id, updated_at FROM carousel_images'),
    ]);
    const settings = Object.fromEntries(settingsResult.rows.map((row) => [row.setting_key, row.setting_value]));
    const intervalMs = Number(settings.interval_ms ?? 10000);
    res.json({
      intervalMs: Number.isFinite(intervalMs) && intervalMs >= 0 ? intervalMs : 10000,
      showIndicators: settings.show_indicators !== 'false',
      backgrounds: parseSlideBackgrounds(settings.slide_backgrounds),
      images: imagesResult.rows.map((image) => ({ panelId: image.panel_id, version: new Date(image.updated_at).getTime() })),
    });
  } catch (error) {
    console.error('[CAROUSEL] Failed to get settings:', error);
    res.status(500).json({ error: 'Unable to load carousel settings' });
  }
});

router.get('/images/:panelId', async (req: Request, res: Response) => {
  try {
    await ensureCarouselStorage();
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
