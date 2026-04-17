import { Request, Response, NextFunction } from 'express';

// Logger mínimo para desarrollo. En producción se reemplazaría por morgan o similar.
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
}
