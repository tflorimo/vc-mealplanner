import { Request, Response } from 'express';
import * as shoppingService from '../services/shoppingProjectionService';
import { DEFAULT_USER_ID } from '../config/constants';

export async function calculate(req: Request, res: Response): Promise<void> {
  const { date_from, date_to, save } = req.body as {
    date_from: string;
    date_to: string;
    save?: boolean;
  };

  const items = await shoppingService.calculate(DEFAULT_USER_ID, date_from, date_to);

  if (save) {
    const list = await shoppingService.save(DEFAULT_USER_ID, date_from, date_to, items);
    res.json({ items, list });
  } else {
    res.json({ items });
  }
}

export async function getLists(req: Request, res: Response): Promise<void> {
  const lists = await shoppingService.getSavedLists(DEFAULT_USER_ID);
  res.json(lists);
}
