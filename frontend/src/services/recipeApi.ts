import api from './api';
import { Recipe, RecipeWithIngredients, CreateRecipeInput, RecipeIngredientInput } from '../models/Recipe';

export const recipeApi = {
  getAll: async (): Promise<Recipe[]> => {
    const { data } = await api.get<Recipe[]>('/recipes');
    return data;
  },

  getById: async (id: number): Promise<RecipeWithIngredients> => {
    const { data } = await api.get<RecipeWithIngredients>(`/recipes/${id}`);
    return data;
  },

  create: async (input: CreateRecipeInput): Promise<RecipeWithIngredients> => {
    const { data } = await api.post<RecipeWithIngredients>('/recipes', input);
    return data;
  },

  updateMeta: async (
    id: number,
    input: Partial<Pick<CreateRecipeInput, 'name' | 'description' | 'diners'>>,
  ): Promise<Recipe> => {
    const { data } = await api.put<Recipe>(`/recipes/${id}`, input);
    return data;
  },

  replaceIngredients: async (
    id: number,
    ingredients: RecipeIngredientInput[],
  ): Promise<RecipeWithIngredients> => {
    const { data } = await api.put<RecipeWithIngredients>(`/recipes/${id}/ingredients`, { ingredients });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/recipes/${id}`);
  },
};
