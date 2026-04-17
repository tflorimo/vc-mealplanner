import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateBody';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/mealSlotController';
import { SLOT_TYPES } from '../config/constants';

const router = Router();

// Validación de parámetros de ruta
function validateSlotParams(slotType: string): boolean {
  return (SLOT_TYPES as readonly string[]).includes(slotType);
}

const UpsertSchema = z.object({
  is_fasting:    z.boolean().optional().default(false),
  recipe_id:     z.number().int().positive().nullable().optional(),
  meal_event_id: z.number().int().positive().nullable().optional(),
}).refine(
  (d) => !(d.recipe_id && d.meal_event_id),
  { message: 'Un slot no puede tener receta y evento al mismo tiempo.' },
).refine(
  (d) => !(d.is_fasting && (d.recipe_id || d.meal_event_id)),
  { message: 'Un slot en ayuno no puede tener receta o evento asignado.' },
);

router.get('/', asyncHandler(ctrl.listByMonth));

router.put('/:date/:slotType', (req, res, next) => {
  if (!validateSlotParams(req.params['slotType'] ?? '')) {
    res.status(400).json({
      error: 'ValidationError',
      message: `slotType inválido. Valores válidos: ${SLOT_TYPES.join(', ')}.`,
    });
    return;
  }
  next();
}, validateBody(UpsertSchema), asyncHandler(ctrl.upsert));

router.delete('/:date/:slotType', (req, res, next) => {
  if (!validateSlotParams(req.params['slotType'] ?? '')) {
    res.status(400).json({
      error: 'ValidationError',
      message: `slotType inválido. Valores válidos: ${SLOT_TYPES.join(', ')}.`,
    });
    return;
  }
  next();
}, asyncHandler(ctrl.clear));

export default router;
