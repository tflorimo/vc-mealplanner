import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateBody';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/recipeController';
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
  diners:      z.number().int().min(1).max(20).optional(),
  ingredients: z.array(IngredientInputSchema).min(1, 'La receta debe tener al menos un ingrediente.'),
});

const UpdateMetaSchema = z.object({
  name:        z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  diners:      z.number().int().min(1).max(20).optional(),
});

const ReplaceIngredientsSchema = z.object({
  ingredients: z.array(IngredientInputSchema).min(1),
});

router.get('/',                             asyncHandler(ctrl.list));
router.get('/:id',                          asyncHandler(ctrl.getOne));
router.post('/',    validateBody(CreateSchema),           asyncHandler(ctrl.create));
router.put('/:id',  validateBody(UpdateMetaSchema),       asyncHandler(ctrl.updateMeta));
router.put('/:id/ingredients', validateBody(ReplaceIngredientsSchema), asyncHandler(ctrl.replaceIngredients));
router.delete('/:id',                       asyncHandler(ctrl.remove));

export default router;
