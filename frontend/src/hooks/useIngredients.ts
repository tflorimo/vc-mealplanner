import { useState, useEffect, useCallback } from 'react';
import { Ingredient, CreateIngredientInput, UpdateIngredientInput } from '../models/Ingredient';
import { ingredientApi } from '../services/ingredientApi';

// Hook para gestión completa del maestro de ingredientes (IngredientsPage)
export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setIngredients(await ingredientApi.getAll());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const create = async (input: CreateIngredientInput): Promise<Ingredient> => {
    const created = await ingredientApi.create(input);
    setIngredients((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  };

  const update = async (id: number, input: UpdateIngredientInput): Promise<Ingredient> => {
    const updated = await ingredientApi.update(id, input);
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? updated : i)).sort((a, b) => a.name.localeCompare(b.name)),
    );
    return updated;
  };

  const remove = async (id: number): Promise<void> => {
    await ingredientApi.delete(id);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  return { ingredients, isLoading, error, create, update, remove, refetch: fetchAll };
}

// Hook para autocompletado con debounce (IngredientAutocomplete)
export function useIngredientSearch(query: string, debounceMs = 300) {
  const [results, setResults]   = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        setResults(await ingredientApi.search(query));
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { results, isLoading };
}
