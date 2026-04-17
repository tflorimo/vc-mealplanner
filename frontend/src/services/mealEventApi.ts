import api from './api';
import { MealEvent, MealEventWithIngredients, CreateMealEventInput, EventIngredientInput } from '../models/MealEvent';

export const mealEventApi = {
  getAll: async (): Promise<MealEvent[]> => {
    const { data } = await api.get<MealEvent[]>('/meal-events');
    return data;
  },

  getById: async (id: number): Promise<MealEventWithIngredients> => {
    const { data } = await api.get<MealEventWithIngredients>(`/meal-events/${id}`);
    return data;
  },

  create: async (input: CreateMealEventInput): Promise<MealEventWithIngredients> => {
    const { data } = await api.post<MealEventWithIngredients>('/meal-events', input);
    return data;
  },

  updateMeta: async (
    id: number,
    input: Partial<Pick<CreateMealEventInput, 'name' | 'description'>>,
  ): Promise<MealEvent> => {
    const { data } = await api.put<MealEvent>(`/meal-events/${id}`, input);
    return data;
  },

  replaceIngredients: async (
    id: number,
    ingredients: EventIngredientInput[],
  ): Promise<MealEventWithIngredients> => {
    const { data } = await api.put<MealEventWithIngredients>(`/meal-events/${id}/ingredients`, { ingredients });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/meal-events/${id}`);
  },
};
