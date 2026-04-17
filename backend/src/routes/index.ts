import { Router } from 'express';

// Los routers de cada recurso se importarán aquí a medida que se implementen.
// Por ahora solo exportamos el router raíz con un health check.

const router = Router();

// Health check para verificar que el servidor y la DB están online
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
