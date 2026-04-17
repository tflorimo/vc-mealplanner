import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateBody';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/mealEventController';
import { SUPPORTED_UNITS } from '../config/constants';

const router = Router();

const IngredientInputSchema = z.object({
  ingredient_id: z.number().int().positive(),
  quantity:      z.number().positive(),
  unit:          z.enum(SUPPORTED_UNITS),
});

const CreateSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  ingredients: z.array(IngredientInputSchema).min(1, 'El evento debe tener al menos un ingrediente.'),
});

const UpdateMetaSchema = z.object({
  name:        z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
}).refine(
  (d) => Object.keys(d).length > 0,
  { message: 'Se requiere al menos un campo para actualizar.' },
);

const ReplaceIngredientsSchema = z.object({
  ingredients: z.array(IngredientInputSchema).min(1),
});

router.get('/',                              asyncHandler(ctrl.list));
router.get('/:id',                           asyncHandler(ctrl.getOne));
router.post('/',    validateBody(CreateSchema),            asyncHandler(ctrl.create));
router.put('/:id',  validateBody(UpdateMetaSchema),        asyncHandler(ctrl.updateMeta));
router.put('/:id/ingredients', validateBody(ReplaceIngredientsSchema), asyncHandler(ctrl.replaceIngredients));
router.delete('/:id',                        asyncHandler(ctrl.remove));

export default router;
