import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateBody';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/ingredientController';
import { SUPPORTED_UNITS } from '../config/constants';

const router = Router();

const CreateSchema = z.object({
  name:      z.string().min(1).max(120),
  unit:      z.enum(SUPPORTED_UNITS),
  is_pantry: z.boolean().optional().default(false),
});

const UpdateSchema = z.object({
  name:      z.string().min(1).max(120).optional(),
  unit:      z.enum(SUPPORTED_UNITS).optional(),
  is_pantry: z.boolean().optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'Se requiere al menos un campo para actualizar.' });

router.get('/',     asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.getOne));
router.post('/',   validateBody(CreateSchema), asyncHandler(ctrl.create));
router.put('/:id', validateBody(UpdateSchema), asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

export default router;
