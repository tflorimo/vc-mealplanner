import { useState, useEffect, useCallback } from 'react';
import { MealEvent, MealEventWithIngredients, CreateMealEventInput } from '../models/MealEvent';
import { mealEventApi } from '../services/mealEventApi';

export function useMealEvents() {
  const [events, setEvents]       = useState<MealEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setEvents(await mealEventApi.getAll());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const create = async (input: CreateMealEventInput): Promise<MealEventWithIngredients> => {
    const created = await mealEventApi.create(input);
    setEvents((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  };

  const remove = async (id: number): Promise<void> => {
    await mealEventApi.delete(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return { events, isLoading, error, create, remove, refetch: fetchAll };
}
