import api from './api';
import { ShoppingResult, SavedShoppingList } from '../models/ShoppingList';

export const shoppingApi = {
  calculate: async (
    dateFrom: string,
    dateTo: string,
    save?: boolean,
  ): Promise<ShoppingResult> => {
    const { data } = await api.post<ShoppingResult>('/shopping/calculate', {
      date_from: dateFrom,
      date_to:   dateTo,
      save,
    });
    return data;
  },

  getLists: async (): Promise<SavedShoppingList[]> => {
    const { data } = await api.get<SavedShoppingList[]>('/shopping/lists');
    return data;
  },
};
