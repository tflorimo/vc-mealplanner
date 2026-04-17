import { Request, Response } from 'express';
import * as mealSlotService from '../services/mealSlotService';
import { DEFAULT_USER_ID, SlotType } from '../config/constants';
import { parseYearMonth } from '../utils/dateHelpers';
import { AppError } from '../middleware/errorHandler';

export async function listByMonth(req: Request, res: Response): Promise<void> {
  const monthParam = req.query['month'];
  if (typeof monthParam !== 'string') {
    throw new AppError(400, "El parámetro 'month' es requerido (formato: YYYY-MM).");
  }
  const { year, month } = parseYearMonth(monthParam);
  const slots = await mealSlotService.getByMonth(DEFAULT_USER_ID, year, month);
  res.json(slots);
}

export async function upsert(req: Request, res: Response): Promise<void> {
  const { date, slotType } = req.params as { date: string; slotType: SlotType };
  const slot = await mealSlotService.upsert(DEFAULT_USER_ID, date, slotType, req.body);
  res.json(slot);
}

export async function clear(req: Request, res: Response): Promise<void> {
  const { date, slotType } = req.params as { date: string; slotType: SlotType };
  await mealSlotService.clear(DEFAULT_USER_ID, date, slotType);
  res.status(204).send();
}
