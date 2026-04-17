import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateBody';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/shoppingController';

const router = Router();

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const CalculateSchema = z.object({
  date_from: z.string().regex(DATE_REGEX, 'Formato inválido, se esperaba YYYY-MM-DD'),
  date_to:   z.string().regex(DATE_REGEX, 'Formato inválido, se esperaba YYYY-MM-DD'),
  save:      z.boolean().optional(),
}).refine(
  (d) => d.date_from <= d.date_to,
  { message: 'date_from debe ser anterior o igual a date_to.' },
);

router.post('/calculate', validateBody(CalculateSchema), asyncHandler(ctrl.calculate));
router.get('/lists',                                      asyncHandler(ctrl.getLists));

export default router;
