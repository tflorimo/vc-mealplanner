import { Request, Response } from 'express';
import * as recipeService from '../services/recipeService';
import { DEFAULT_USER_ID } from '../config/constants';

export async function list(req: Request, res: Response): Promise<void> {
  const recipes = await recipeService.getAll(DEFAULT_USER_ID);
  res.json(recipes);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const recipe = await recipeService.getById(Number(req.params['id']));
  if (!recipe) { res.status(404).json({ error: 'NotFound', message: 'Receta no encontrada.' }); return; }
  res.json(recipe);
}

export async function create(req: Request, res: Response): Promise<void> {
  const recipe = await recipeService.create(DEFAULT_USER_ID, req.body);
  res.status(201).json(recipe);
}

export async function updateMeta(req: Request, res: Response): Promise<void> {
  const recipe = await recipeService.updateMeta(Number(req.params['id']), req.body);
  res.json(recipe);
}

export async function replaceIngredients(req: Request, res: Response): Promise<void> {
  const recipe = await recipeService.replaceIngredients(
    Number(req.params['id']),
    req.body.ingredients,
  );
  res.json(recipe);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await recipeService.deleteById(Number(req.params['id']));
  res.status(204).send();
}
