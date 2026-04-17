import { Request, Response } from 'express';
import * as ingredientService from '../services/ingredientService';
import { AUTOCOMPLETE_LIMIT } from '../config/constants';

export async function list(req: Request, res: Response): Promise<void> {
  const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
  const limit = Number(req.query['limit']) || AUTOCOMPLETE_LIMIT;

  const ingredients = q
    ? await ingredientService.searchByPrefix(q, limit)
    : await ingredientService.getAll();

  res.json(ingredients);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const ingredient = await ingredientService.getById(Number(req.params['id']));
  if (!ingredient) { res.status(404).json({ error: 'NotFound', message: 'Ingrediente no encontrado.' }); return; }
  res.json(ingredient);
}

export async function create(req: Request, res: Response): Promise<void> {
  const ingredient = await ingredientService.create(req.body);
  res.status(201).json(ingredient);
}

export async function update(req: Request, res: Response): Promise<void> {
  const ingredient = await ingredientService.update(Number(req.params['id']), req.body);
  res.json(ingredient);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await ingredientService.deleteById(Number(req.params['id']));
  res.status(204).send();
}
