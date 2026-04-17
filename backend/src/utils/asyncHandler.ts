import { Request, Response, NextFunction } from 'express';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Wrappea un controller async para que los errores lleguen al error handler global.
// Sin esto, Express 4 no captura rechazos de promesas automáticamente.
export function asyncHandler(fn: AsyncController) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
