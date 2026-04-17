import { Request, Response, NextFunction } from 'express';

// Error tipado para respuestas HTTP controladas
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Handler global de errores de Express.
// Debe ser el ÚLTIMO middleware registrado en app.ts.
// Captura tanto AppError (errores controlados) como errores inesperados.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Error inesperado: log completo, respuesta genérica al cliente
  console.error('[error]', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Ocurrió un error inesperado. Intentá de nuevo.',
  });
}
