import api from './api';
import { Ingredient, CreateIngredientInput, UpdateIngredientInput } from '../models/Ingredient';

export const ingredientApi = {
  search: async (q: string, limit = 10): Promise<Ingredient[]> => {
    const { data } = await api.get<Ingredient[]>('/ingredients', { params: { q, limit } });
    return data;
  },

  getAll: async (): Promise<Ingredient[]> => {
    const { data } = await api.get<Ingredient[]>('/ingredients');
    return data;
  },

  create: async (input: CreateIngredientInput): Promise<Ingredient> => {
    const { data } = await api.post<Ingredient>('/ingredients', input);
    return data;
  },

  update: async (id: number, input: UpdateIngredientInput): Promise<Ingredient> => {
    const { data } = await api.put<Ingredient>(`/ingredients/${id}`, input);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ingredients/${id}`);
  },
};
