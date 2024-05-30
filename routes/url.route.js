import { Router } from 'express';
import {
  generateShortURL,
  getAnalytics
} from '../controllers/url.controller.js';

const router = Router();

router.post('/', generateShortURL);
router.get('/analytics/:id', getAnalytics);

export default router;
