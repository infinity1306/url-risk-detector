import { Router } from 'express';
import { analyzeUrl, getReport, getStats } from '../controllers/scan.controller';
import { validate, analyzeUrlSchema } from '../middlewares/validation';
import { scanLimiter } from '../middlewares/rateLimiter';

const router = Router();

// POST /api/analyze — Submit URL for analysis
router.post('/analyze', scanLimiter, validate(analyzeUrlSchema), analyzeUrl);

// GET /api/report/:id — Get scan report
router.get('/report/:id', getReport);

// GET /api/stats — Platform statistics
router.get('/stats', getStats);

export default router;
