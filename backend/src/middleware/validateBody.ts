import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Factory de middleware de validación usando Zod.
// Uso: router.post('/ruta', validateBody(MiSchema), controlador)
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        error: 'ValidationError',
        message: 'El cuerpo de la petición es inválido.',
        details: errors,
      });
      return;
    }
    // Reemplazar req.body con el valor parseado y tipado por Zod
    req.body = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'body';
    result[field] = issue.message;
  }
  return result;
}
