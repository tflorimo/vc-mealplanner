import { useState, useEffect, useCallback } from 'react';
import { Recipe, RecipeWithIngredients, CreateRecipeInput, RecipeIngredientInput } from '../models/Recipe';
import { recipeApi } from '../services/recipeApi';

export function useRecipes() {
  const [recipes, setRecipes]     = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRecipes(await recipeApi.getAll());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const create = async (input: CreateRecipeInput): Promise<RecipeWithIngredients> => {
    const created = await recipeApi.create(input);
    setRecipes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  };

  const update = async (
    id: number,
    meta: Partial<Pick<CreateRecipeInput, 'name' | 'description' | 'diners'>>,
    ingredients?: RecipeIngredientInput[],
  ): Promise<void> => {
    await recipeApi.updateMeta(id, meta);
    if (ingredients) await recipeApi.replaceIngredients(id, ingredients);
    await fetchAll();
  };

  const remove = async (id: number): Promise<void> => {
    await recipeApi.delete(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return { recipes, isLoading, error, create, update, remove, refetch: fetchAll };
}
