import { Request, Response } from 'express';
import * as mealEventService from '../services/mealEventService';
import { DEFAULT_USER_ID } from '../config/constants';

export async function list(req: Request, res: Response): Promise<void> {
  const events = await mealEventService.getAll(DEFAULT_USER_ID);
  res.json(events);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const event = await mealEventService.getById(Number(req.params['id']));
  if (!event) { res.status(404).json({ error: 'NotFound', message: 'Evento no encontrado.' }); return; }
  res.json(event);
}

export async function create(req: Request, res: Response): Promise<void> {
  const event = await mealEventService.create(DEFAULT_USER_ID, req.body);
  res.status(201).json(event);
}

export async function updateMeta(req: Request, res: Response): Promise<void> {
  const event = await mealEventService.updateMeta(Number(req.params['id']), req.body);
  res.json(event);
}

export async function replaceIngredients(req: Request, res: Response): Promise<void> {
  const event = await mealEventService.replaceIngredients(
    Number(req.params['id']),
    req.body.ingredients,
  );
  res.json(event);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await mealEventService.deleteById(Number(req.params['id']));
  res.status(204).send();
}
