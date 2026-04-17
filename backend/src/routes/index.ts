import { Router } from 'express';
import ingredientRoutes  from './ingredientRoutes';
import recipeRoutes      from './recipeRoutes';
import mealSlotRoutes    from './mealSlotRoutes';
import mealEventRoutes   from './mealEventRoutes';
import shoppingRoutes    from './shoppingRoutes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/ingredients',  ingredientRoutes);
router.use('/recipes',      recipeRoutes);
router.use('/meal-slots',   mealSlotRoutes);
router.use('/meal-events',  mealEventRoutes);
router.use('/shopping',     shoppingRoutes);

export default router;
